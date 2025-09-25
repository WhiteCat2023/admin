import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
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
import NotificationsIcon from "@mui/icons-material/Notifications";
import Ariba from "../../assets/Ariba.png";
import { Link, Outlet, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

function DashboardLayout({ children }) {
  const location = useLocation();
const navigate = useNavigate();
  const drawerWidth = 300;
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const routes = [
    { text: "Dashboard", path: "dashboard", icon: <DashboardIcon /> },
    { text: "Map", path: "map", icon: <MapIcon /> },
    { text: "Reports", path: "report", icon: <AssessmentIcon /> },
    { text: "Notification", path: "notification", icon: <NotificationsIcon /> },
  ];

  const getInitialIndex = () => {
    const index = routes.findIndex(route => location.pathname === "/" + route.path);
    return index !== -1 ? index : 0;
  };

  const [selectedIndex, setSelectedIndex] = useState(getInitialIndex);

  useEffect(() => {
    const currentIndex = routes.findIndex(route => location.pathname === "/" + route.path);
    if (currentIndex !== -1) {
      setSelectedIndex(currentIndex);
    }
  }, [location.pathname]);

    const handleListItemClick = (event, index) => {
      setSelectedIndex(index);
    };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
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
        textAlign: "center",
        border: "1px solid #ddd",
        m: 2,
        pt: 4,
        borderRadius: 3,
        boxShadow: 3,
        border: isDesktop ? "none" : "1px solid #ddd",
      }}
    >
      {/* Top content */}
      <Box>
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            borderRadius: 4,
            overflow: "hidden",
            height: 60,
            backgroundImage: `url(${Ariba})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <Typography variant="h6" sx={{ my: 2 }}>
          My Dashboard
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
                  p:2,
                  borderRadius: 1,
                  m: 1,
                  backgroundColor:
                    selectedIndex === index ? "#2ED573" : "transparent",
                  color: selectedIndex === index ? "white" : "black",
                  "&:hover": {
                    backgroundColor: selectedIndex === index ? "#2ED573" : "rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "flex-start" }}>
                  {icon}
                  <Typography variant="body1" sx={{ ml: 1 }}>{text}</Typography>
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
            borderRadius: 2,
            py: 1.5,
            borderColor: "#c2c2c2ff", // custom outline color
            color: "#c2c2c2ff", // text color
            "&:hover": {
              borderColor: "#999999", // darker outline on hover
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
          background: "#2ED573",
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
          <Typography variant="h6">Dashboard</Typography>
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
          ml: { md: `${drawerWidth}px` }, // 👈 shift content to the right of sidebar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
