import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Fade,
  Badge,
  CardActionArea,
  Snackbar,
  Alert,
} from "@mui/material";
import { auth } from "../utils/config/firebase";
import { useEffect, useMemo, useState } from "react";
import { getAllReports } from "../utils/controller/report.controller";
import { HttpStatus } from "../utils/enums/status";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import ReportDetailDialog from "../utils/components/ReportDetailDialog";
import { getInitials } from "../utils/helpers";
import ReportsRespondedCard from "../utils/components/ReportsRespondedCard";
import PendingReportsCard from "../utils/components/PendingReportsCard";
import LatestReportCard from "../utils/components/LatestReportCard";
import ReportsByTierCard from "../utils/components/ReportsByTierCard";
import HistoryCard from "../utils/components/HistoryCard";
import ProfileSummaryCard from "../utils/components/ProfileSummaryCard";
import ReportsChartModal from "../utils/components/ReportsChartModal";
import PushNotificationButton from "../utils/components/PushNotificationButton";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [showContent, setShowContent] = useState(false);
  const [openChartModal, setOpenChartModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [reportNotifs, setReportNotifs] = useState([]);
  const { userDoc } = useAuth();
  const navigate = useNavigate()
  useEffect(() => {
    fetchData();
  }, []); 

  // Load Poppins font from Google Fonts
  useEffect(() => {
    const id = "poppins-font-stylesheet";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap";
      document.head.appendChild(link);
      return () => {
        try { document.head.removeChild(link); } catch (e) { /* ignore */ }
      };
    }
  }, []);

  useEffect(() => {
    // Simulate notifications from reports (new/pending as unread)
    if (reports.length > 0) {
      const notifs = reports
        .filter(
          (report) =>
            report.status.toLowerCase() === "pending" ||
            report.tier.toLowerCase() === "emergency"
        )
        .slice(0, 10) // Recent 10
        .map((report) => ({
          id: report.id,
          title: `New ${report.tier.toLowerCase()} report: ${
            report.title || "Untitled"
          }`,
          body: report.description || "Check the details",
          timestamp: report.timestamp?.toDate
            ? report.timestamp.toDate()
            : new Date(),
          read: false,
          type: "report",
          report: report,
        }));
      setReportNotifs(notifs);
    }
  }, [reports]);

  const fetchData = async () => {
    setShowContent(false);
    try {
      const result = await getAllReports();
      if (result.status === HttpStatus.OK) {
        setReports(result.data);
        console.log(result.data);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
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
      months.push({
        month: monthName,
        responded: respondedCount,
        emergency: emergencyCount,
      });
    }
    return months;
  }, [respondedReports, emergencyReports]);

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

  const handleRespond = () => {
    console.log("Respond to report:", selectedReport);
    navigate("/report")
  };

  return (
    <>
      <Fade in={showContent} timeout={600}>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{  }}
              >
                Greetings! Welcome Back
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold",  }}
              >
                ADMIN
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PushNotificationButton
                reportNotifs={reportNotifs}
                onSelectReport={(report) => {
                  setSelectedReport(report);
                  setOpenDialog(true);
                }}
                setSnackbarMessage={setSnackbarMessage}
                setSnackbarOpen={setSnackbarOpen}
              />

              {/* <Card
              elevation="0"
                sx={{
                  borderRadius: 4,
                  // boxShadow: "0px 2px 4px rgba(167, 166, 166, 0.5)",
                  
                }}
              >
                <CardActionArea sx={{ px: 2, py: 1.5, borderRadius: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Badge
                      color="success"
                      overlap="circular"
                      badgeContent=""
                      variant="dot"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                    >
                      <Avatar
                        src={userDoc?.profilePic}
                        sx={{
                          bgcolor: "#2ED573",
                          width: 40,
                          height: 40,
                          border: "2px solid white",
                          boxShadow: 2,
                        }}
                      >
                        {getInitials(userDoc?.firstName)}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {userDoc?.name || "TotoTok Michael"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userDoc?.email || "tmichael20@email.com"}
                      </Typography>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card> */}
            </Box>
          </Box>

          {/* Top cards */}
          <Grid container spacing={2} alignItems="stretch">
            <Grid size={6} sx={{ display: "flex" }}>
              <ReportsRespondedCard
                respondedReportsLength={respondedReports.length}
                onClick={(event) => setOpenChartModal(true)}
              />
            </Grid>

            <Grid size={6} sx={{ display: "flex" }}>
              <PendingReportsCard
                pendingReportsLength={pendingReports.length}
              />
            </Grid>

            {/* Latest report full width */}
            <Grid size={12} sx={{ display: "flex" }}>
              <LatestReportCard
                latestReport={latestReport}
                shiningEffectStyles={shiningEffectStyles}
                onRespond={handleRespond}
              />
            </Grid>

            <Grid size={4} sx={{ display: "flex" }}>
              <ReportsByTierCard
                latestEmergencyReport={latestEmergencyReport}
                onItemClick={(item) => {
                  setSelectedReport(item);
                  setOpenDialog(true);
                }}
              />
            </Grid>

            <Grid size={4} sx={{ display: "flex" }}>
              <HistoryCard
                latestRepondedReport={latestRepondedReport}
                onItemClick={(item) => {
                  setSelectedReport(item);
                  setOpenDialog(true);
                }}
              />
            </Grid>

            <Grid size={4} sx={{ display: "flex" }}>
              <ProfileSummaryCard
                userDoc={userDoc}
                pendingReportsLength={pendingReports.length}
                reportsLength={reports.length}
                emergencyReportsLength={emergencyReports.length}
              />
            </Grid>
          </Grid>
        </Box>
      </Fade>
      <ReportsChartModal
        open={openChartModal}
        onClose={() => setOpenChartModal(false)}
        chartData={chartData}
      />
      <ReportDetailDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        report={selectedReport}
        onRespond={handleRespond}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={
            snackbarMessage.includes("enabled") ||
            snackbarMessage.includes("received")
              ? "success"
              : snackbarMessage.includes("Failed") ||
                snackbarMessage.includes("blocked")
              ? "error"
              : "info"
          }
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Dashboard;
