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
import { auth } from "../config/firebase";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import ReportIcon from "@mui/icons-material/Report";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useEffect, useState } from "react";
import {
  getAllReports,
  getAllReportsWithFilter,
} from "../controller/report.controller";
import { HttpStatus } from "../enums/status";

function Dashboard() {
  const [pendingReports, setPendingReports] = useState({});
  const [respondedReports, setRespondedReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setShowContent(false);
    try {
      await Promise.all([fetchPending(), fetchReports()]);
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

  const fetchReports = async () => {
    try {
      const result = await getAllReports();
      if (result.status === HttpStatus.OK) {
        setPendingReports(result.data);
        console.log("Reports:", result.data);
      } else {
        console.warn("Failed to fetch reports:", result);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const fetchPending = async () => {
    try {
      const result = await getAllReportsWithFilter("pending");
      if (result.status === HttpStatus.OK) {
        setRespondedReports(result.data);
        console.log("Reports:", result.data);
      } else {
        console.warn("Failed to fetch reports:", result);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

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
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  LATEST REPORT
                </Typography>
                <Typography color="text.secondary">
                  The latest incident report will be placed here
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, backgroundColor: "#2ED573" }}
                >
                  Respond
                </Button>
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
z