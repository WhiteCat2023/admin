import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ForumIcon from "@mui/icons-material/Forum";
import Ariba from "../../assets/Ariba.png";
import { Link, Outlet, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Sos } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { updateAdminActivity } from "../services/firebase/users.services";
import AndroidIcon from '@mui/icons-material/Android';

function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userDoc, loading } = useAuth();
  const drawerWidth = 300;
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const baseRoutes = [
    { text: "Dashboard", path: "", icon: <DashboardIcon /> },
    { text: "Map", path: "map", icon: <MapIcon /> },
    { text: "Reports", path: "report", icon: <AssessmentIcon /> },
    { text: "Forum", path: "forum", icon: <ForumIcon /> },
    { text: "Sos", path: "sos", icon: <Sos /> },
    { text: "Profile", path: "profile", icon: <PersonIcon /> },
  ];

  // Admin Users only visible for super admin
  const adminRoute = [
    { text: "Admin Users", path: "admin-users", icon: <PeopleAltIcon />, },
    { text: "CMS", path: "cms", icon: <AndroidIcon /> },
  ];

  const routes =
    userDoc?.role === "super"
      ? [...baseRoutes.slice(0, -1), ...adminRoute, baseRoutes[baseRoutes.length - 1]]
      : baseRoutes;

  const getInitialIndex = () => {
    const index = routes.findIndex(
      (route) => location.pathname === "/" + route.path
    );
    return index !== -1 ? index : 0;
  };

  const [selectedIndex, setSelectedIndex] = useState(getInitialIndex);

  useEffect(() => {
    const currentIndex = routes.findIndex(
      (route) => location.pathname === "/" + route.path
    );
    if (currentIndex !== -1) {
      setSelectedIndex(currentIndex);
    }
  }, [location.pathname, routes]);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await updateAdminActivity(userDoc?.id, false);
      await signOut(auth);
      navigate("/login"); // ✅ redirect to login after logout
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // 👈 push logout to bottom
        height: "100%",
        // textAlign: "center",
        border: "1px solid #ddd",
        //  m: 2,
        pt: 4,
        p: 3,
        borderRadius: 3,
        // boxShadow: 3,
        // border: isDesktop ? "none" : "1px solid #ddd",
        backgroundColor: "#fff",
      }}
    >
      {/* Top content */}
      <Box>
        <Box
          sx={{
            // flex: 1,
            display: { xs: "none", md: "flex" },
            // borderRadius: 4,
            overflow: "hidden",
            width: 90,
            height: 40,
            backgroundImage: `url(${Ariba})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          Report your concerns
        </Typography>
        <List sx={{ textAlign: "left" }}>
          {routes.map(({ text, path, icon }, index) => (
            <ListItem key={path} disablePadding>
              <Button
                component={Link}
                to={path}
                selected={selectedIndex === index}
                onClick={(event) => handleListItemClick(event, index)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "flex-start",
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  m: 1,
                  backgroundColor:
                    selectedIndex === index ? "#34A853" : "transparent",
                  color: selectedIndex === index ? "white" : "#8a8a8aff",
                  "&:hover": {
                    backgroundColor:
                      selectedIndex === index ? "#34A853" : "rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  {icon}
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {text}
                  </Typography>
                </Box>
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom logout button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="#c2c2c2ff"
          onClick={handleLogout}
          sx={{
            fontFamily: '"Poppins", sans-serif',
            borderRadius: 2,
            py: 1.5,
            borderColor: "#34A853", // custom outline color
            color: "#34A853", // text color
            "&:hover": {
              borderColor: "#23a559ff", // darker outline on hover
              backgroundColor: "rgba(0,0,0,0.02)", // subtle hover effect
            },
          }}
        >
          Log Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: "#34A853",
          boxShadow: "none",
        }}
      >
        <Toolbar
          sx={{
            display: isDesktop ? "none" : "flex",
          }}
        >
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif' }}>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            height: "100vh", // full height
            boxSizing: "border-box",
            position: isDesktop ? "fixed" : "absolute", // 👈 fixed sidebar on desktop
            top: 0,
            left: 0,
            p: 2,
            backgroundColor: "#D9E9DD",
            borderRight: "none",
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Slot for content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isDesktop ? 3 : 2,
          mt: isDesktop ? 0 : 7,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          // height: "100vh",
          ml: { md: `${drawerWidth}px` }, // 👈 shift content to the right of sidebar
          backgroundColor: "#D9E9DD", //#f4fff6ff",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
