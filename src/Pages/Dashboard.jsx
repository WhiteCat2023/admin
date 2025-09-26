import {
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Fade,
  Badge,
  Modal,
  CardActionArea,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { auth } from "../utils/config/firebase";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ReportIcon from "@mui/icons-material/Report";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useEffect, useMemo, useState } from "react";
import { getAllReports } from "../utils/controller/report.controller";
import { HttpStatus } from "../utils/enums/status";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useAuth } from "../context/AuthContext";
import CloseIcon from "@mui/icons-material/Close";

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [showContent, setShowContent] = useState(false);
  const [openChartModal, setOpenChartModal] = useState(false);
  const { user, loading: authLoading, userDoc } = useAuth();

  useEffect(() => {
    fetchData();
    console.log(user);
    console.log(userDoc);
  }, [user]);

  const fetchData = async () => {
    setShowContent(false);
    try {
      const result = await getAllReports();
      if (result.status === HttpStatus.OK) {
        setReports(result.data);
        console.log("Reports:", result.data);
      } else {
        console.warn("Failed to fetch reports:", result);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setShowContent(true);
    }
  };

  const pendingReports = reports.filter(
    (report) => report.status.toLowerCase() === "pending"
  );
  const respondedReports = reports.filter(
    (report) => report.status.toLowerCase() === "responded"
  );

  const emergencyReports = reports.filter(
    (report) => report.tier.toLowerCase() === "emergency"
  );
  const highTierReports = reports.filter(
    (report) => report.tier.toLowerCase() === "high"
  );

  const latestReport = useMemo(() => {
    if (!pendingReports.length) return null;

    // Sort and get the latest report
    const sortedReports = [...pendingReports].sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(0);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(0);
      return dateB - dateA; // Sort descending (newest first)
    });

    return sortedReports[0]; // Return the first (latest) report
  }, [pendingReports]);

  const latestEmergencyReport = useMemo(() => {
    if (!emergencyReports.length) return null;

    // Sort and get the latest report
    const sortedReports = [...emergencyReports]
      .sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(0);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(0);
        return dateB - dateA; // Sort descending (newest first)
      })
      .slice(0, 3); // Take only the first 3 items

    return sortedReports;
  }, [emergencyReports]);

  const latestRepondedReport = useMemo(() => {
    if (!respondedReports.length) return null;

    // Sort and get the latest report
    const sortedReports = [...respondedReports]
      .sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(0);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(0);
        return dateB - dateA; // Sort descending (newest first)
      })
      .slice(0, 3); // Take only the first 3 items

    return sortedReports; // Return the first (latest) report
  }, [respondedReports]);

  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = format(date, "MMM yyyy");
      const respondedCount = respondedReports.filter((report) => {
        const reportTimestamp = report.timestamp;
        let reportDate;
        if (reportTimestamp?.toDate) {
          reportDate = reportTimestamp.toDate();
        } else if (
          typeof reportTimestamp === "string" ||
          typeof reportTimestamp === "number"
        ) {
          reportDate = new Date(reportTimestamp);
        } else if (reportTimestamp instanceof Date) {
          reportDate = reportTimestamp;
        } else {
          reportDate = null;
        }
        return (
          reportDate &&
          !isNaN(reportDate.getTime()) &&
          reportDate.getMonth() === date.getMonth() &&
          reportDate.getFullYear() === date.getFullYear()
        );
      }).length;
      const emergencyCount = emergencyReports.filter((report) => {
        const reportTimestamp = report.timestamp;
        let reportDate;
        if (reportTimestamp?.toDate) {
          reportDate = reportTimestamp.toDate();
        } else if (
          typeof reportTimestamp === "string" ||
          typeof reportTimestamp === "number"
        ) {
          reportDate = new Date(reportTimestamp);
        } else if (reportTimestamp instanceof Date) {
          reportDate = reportTimestamp;
        } else {
          reportDate = null;
        }
        return (
          reportDate &&
          !isNaN(reportDate.getTime()) &&
          reportDate.getMonth() === date.getMonth() &&
          reportDate.getFullYear() === date.getFullYear()
        );
      }).length;
      months.push({ month: monthName, responded: respondedCount, emergency: emergencyCount });
    }
    return months;
  }, [respondedReports, emergencyReports]);

  const getTierColor = (item) => {
    const tier = item.tier?.toLowerCase();
    if (tier === "emergency") return "#ff0000";
    if (tier === "high") return "#ffbb00";
    if (tier === "medium") return "#fffb00";
    if (tier === "low") return "#00ff22";
    return "#666666"; // default color
  };

  const renderListItem = (item) => {
    const formattedDate = item.timestamp?.toDate
      ? format(item.timestamp.toDate(), "MMM d | h:mma")
      : "";
    return (
      <Card key={item.id} sx={{ mb: 1, borderRadius: 2 }} elevation={0}>
        <CardActionArea>
          <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
            <Divider
              orientation="vertical"
              sx={{
                height: 70, // Match the text height
                borderRightWidth: 3, // Thicker line
                borderColor: "#2ED573", // Color
                borderRadius: 2,
                mr: 2, // More margin for better spacing
              }}
            />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={700}
                  fontSize={16}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontSize={12}
                >
                  {formattedDate}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontSize={12}
                >
                  Status: {item.status}
                </Typography>
              </Box>
              <Typography
                variant="body1"
                color={getTierColor(item)}
                sx={{
                  textShadow: "1px 1px 1px rgb(0, 0, 0)",
                }}
                fontSize={12}
              >
                {item.tier}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  const shiningEffectStyles = {
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s ease-in-out",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-100%",
      width: "100%",
      height: "100%",
      background:
        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
      transition: "left 0.5s ease-in-out",
    },
    "&:hover::before": {
      left: "100%",
    },
    "&:hover": {
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    },
  };

  const DashboardContent = () => (
    <Fade in={showContent} timeout={600}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Typography variant="h6" color="text.secondary">
          Greetings! Welcome Back
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 3 }}>
          ADMIN
        </Typography>

        {/* Top cards */}
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={6} sx={{ display: "flex" }}>
            <Card
              elevation={2}
              sx={{ p: 1, flexGrow: 1, borderRadius: 4, cursor: "pointer" }}
              onClick={() => setOpenChartModal(true)}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reports responded this month
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {respondedReports.length}
                  </Typography>
                </Box>

                <InsertChartIcon sx={{ fontSize: 40, color: "green" }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={6} sx={{ display: "flex" }}>
            <Card elevation={2} sx={{ p: 1, flexGrow: 1, borderRadius: 4 }}>
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending Reports
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {pendingReports.length}
                  </Typography>
                </Box>

                <ReportIcon sx={{ fontSize: 40, color: "orange" }} />
              </CardContent>
            </Card>
          </Grid>

          {/* Latest report full width */}
          <Grid size={12} sx={{ display: "flex" }}>
            <Card elevation={2} sx={{ p: 1, flexGrow: 1, borderRadius: 4 }}>
              <CardContent sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    minWidth: 200,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      LATEST REPORT
                    </Typography>
                    <Typography
                      color="text.primary"
                      sx={{ fontWeight: 600, fontSize: 18 }}
                    >
                      {latestReport?.title || "No Latest Pending Report"}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1, fontSize: 14 }}
                    >
                      {latestReport?.description || "No Latest Pending Report"}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: "#2ED573",
                      px: 7,
                      fontWeight: 600,
                    }}
                  >
                    Respond
                  </Button>
                </Box>
                {latestReport?.images?.[0] && (
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 200,
                      width: "50%",
                      borderRadius: 2,
                      overflow: "hidden",
                      backgroundImage: `url(${latestReport.images[0]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...shiningEffectStyles,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={4} sx={{ display: "flex" }}>
            <Card elevation={2} sx={{ flexGrow: 1, borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Reports by TierList
                </Typography>
                <Divider sx={{ my: 1 }} />
                {latestEmergencyReport
                  ? latestEmergencyReport.map((item) => renderListItem(item))
                  : renderListItem({ title: "No Emergency Reports Found" })}

                <Button size="small" sx={{ mt: 1 }}>
                  View all
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={4} sx={{ display: "flex" }}>
            <Card elevation={2} sx={{ flexGrow: 1, borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  History
                </Typography>
                <Divider sx={{ my: 1 }} />
                {latestRepondedReport
                  ? latestRepondedReport.map((item) => renderListItem(item))
                  : renderListItem({ title: "No Emergency Reports Found" })}
                <Button size="small" sx={{ mt: 1 }}>
                  View all Tasks
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={4} sx={{ display: "flex" }}>
            <Card
              elevation={2}
              sx={{ flexGrow: 1, textAlign: "center", borderRadius: 4 }}
            >
              <CardContent>
                <Badge
                  color="success"
                  overlap="circular"
                  badgeContent=" "
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  invisible={pendingReports.length === 0}
                  sx={{
                    width: 80,
                    height: 80,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#2ED573",
                      width: 80,
                      height: 80,
                      margin: "0 auto",
                      mb: 2,
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                </Badge>

                <Typography variant="h6">{userDoc?.name}</Typography>
                <Typography
                  variant="body1"
                  sx={{ fontSize: 14, color: "#adadadff" }}
                >
                  {userDoc?.email}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {pendingReports.length}
                    </Typography>
                    <Typography variant="caption">Tasks</Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {reports.length}
                    </Typography>
                    <Typography variant="caption">Reports</Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {emergencyReports.length}
                    </Typography>
                    <Typography variant="caption">Alerts</Typography>
                  </Grid>
                </Grid>
                <Button variant="outlined">Go to Profile</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  return (
    <>
      <DashboardContent />
      <Modal open={openChartModal} onClose={() => setOpenChartModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "background.paper",
            boxShadow: 24,
            border: 0,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reports Over Time
            </Typography>
            <Button onClick={() => setOpenChartModal(false)}>
              <CloseIcon />
            </Button>
          </Box>

          <LineChart
            xAxis={[{ data: chartData.map((d) => d.month), scaleType: "band" }]}
            series={[
              { data: chartData.map((d) => d.responded), label: "Responded" },
              {
                data: chartData.map((d) => d.emergency),
                label: "Emergency",
                color: "#ff0000",
              },
            ]}
            width={700}
            height={400}
          />
        </Box>
      </Modal>
    </>
  );
}

export default Dashboard;
