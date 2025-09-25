import {
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Skeleton,
  Fade,
} from "@mui/material";
import { auth } from "../utils/config/firebase";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ReportIcon from "@mui/icons-material/Report";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useEffect, useMemo, useState } from "react";
import {
  getAllReports,
  getAllReportsWithFilter,
  getAllTierReportsWithFilter,
} from "../utils/controller/report.controller";
import { HttpStatus } from "../utils/enums/status";
useMemo;

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => setShowContent(true), 150);
      }, 300);
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
  const trafficReports = reports.filter(
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

  // Skeleton components
  const StatCardSkeleton = () => (
    <Card elevation={3} sx={{ p: 1, flexGrow: 1, borderRadius: 4 }}>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={32} />
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
      </CardContent>
    </Card>
  );

  const LatestReportSkeleton = () => (
    <Card elevation={3} sx={{ p: 1, flexGrow: 1, borderRadius: 4 }}>
      <CardContent>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
        <Skeleton
          variant="rectangular"
          width={120}
          height={36}
          sx={{ borderRadius: 1 }}
        />
      </CardContent>
    </Card>
  );

  const SideCardSkeleton = () => (
    <Card elevation={3} sx={{ flexGrow: 1, borderRadius: 4 }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={24} />
      </CardContent>
    </Card>
  );

  const ProfileCardSkeleton = () => (
    <Card
      elevation={3}
      sx={{ flexGrow: 1, textAlign: "center", borderRadius: 4 }}
    >
      <CardContent>
        <Skeleton
          variant="circular"
          width={80}
          height={80}
          sx={{ margin: "0 auto", mb: 2 }}
        />
        <Skeleton
          variant="text"
          width="40%"
          height={32}
          sx={{ margin: "0 auto", mb: 1 }}
        />
        <Skeleton
          variant="text"
          width="60%"
          height={24}
          sx={{ margin: "0 auto", mb: 2 }}
        />
        <Skeleton
          variant="text"
          width="80%"
          height={1}
          sx={{ margin: "0 auto", mb: 2 }}
        />
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item size={4} key={item}>
              <Skeleton variant="text" width="100%" height={32} />
              <Skeleton variant="text" width="60%" height={20} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const SkeletonLoader = () => (
    <Fade in={loading} timeout={500}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header Skeleton */}
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="20%" height={48} sx={{ mb: 3 }} />

        {/* Top cards skeleton */}
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={6} sx={{ display: "flex" }}>
            <StatCardSkeleton />
          </Grid>
          <Grid size={6} sx={{ display: "flex" }}>
            <StatCardSkeleton />
          </Grid>

          {/* Latest report skeleton */}
          <Grid size={12} sx={{ display: "flex" }}>
            <LatestReportSkeleton />
          </Grid>

          {/* Side cards skeleton */}
          <Grid size={4} md={6} sx={{ display: "flex" }}>
            <SideCardSkeleton />
          </Grid>
          <Grid size={4} md={6} sx={{ display: "flex" }}>
            <SideCardSkeleton />
          </Grid>
          <Grid size={4} sx={{ display: "flex" }}>
            <ProfileCardSkeleton />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

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
            <Card elevation={3} sx={{ p: 1, flexGrow: 1, borderRadius: 4 }}>
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
            <Card elevation={3} sx={{ p: 1, flexGrow: 1, borderRadius: 4 }}>
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
            <Card elevation={3} sx={{ p: 1, flexGrow: 1, borderRadius: 4 }}>
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
                      {latestReport.title || "No Latest Pending Report"}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1, fontSize: 14 }}
                    >
                      {latestReport.description || "No Latest Pending Report"}
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

          <Grid size={4} md={6} sx={{ display: "flex" }}>
            <Card elevation={3} sx={{ flexGrow: 1, borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Reports by TierList
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>🚨 Emergency</Typography>
                <Typography>🚗 Traffic Incidents</Typography>
                <Typography>📑 Summons</Typography>
                <Button size="small" sx={{ mt: 1 }}>
                  View all
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={4} md={6} sx={{ display: "flex" }}>
            <Card elevation={3} sx={{ flexGrow: 1, borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  History
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Card>
                  <CardContent sx={{ display: "flex", alignItems: "center" }}>
                    <Divider
                      orientation="vertical"
                      sx={{
                        mb: 1,
                        width: "3px", // thicker line
                        backgroundColor: "grey.500", // optional: change color
                        mr: 1,
                      }}
                    />
                    <Typography variant="subtitle2" color="text.secondary">
                      Recent Tasks
                    </Typography>
                  </CardContent>
                </Card>

                <Typography>Pothole Spotted</Typography>
                <Typography>E-bike Accident</Typography>
                <Button size="small" sx={{ mt: 1 }}>
                  View all Tasks
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={4} sx={{ display: "flex" }}>
            <Card
              elevation={3}
              sx={{ flexGrow: 1, textAlign: "center", borderRadius: 4 }}
            >
              <CardContent>
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
                <Typography variant="h6">Admin</Typography>
                <Typography color="text.secondary">
                  Santo Tomas, City
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item size={4}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      28
                    </Typography>
                    <Typography variant="caption">Tasks</Typography>
                  </Grid>
                  <Grid item size={4}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      643
                    </Typography>
                    <Typography variant="caption">Reports</Typography>
                  </Grid>
                  <Grid item size={4}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      76
                    </Typography>
                    <Typography variant="caption">Alerts</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  return (
    <>
      {loading && <SkeletonLoader />}
      {!loading && <DashboardContent />}
    </>
  );
}

export default Dashboard;
