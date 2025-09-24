import { useState } from "react";
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
import Ariba from "../assets/Ariba.png";
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
    { text: "Dashboard", path: "/dashboard" },
    { text: "Map", path: "/map" },
    { text: "Reports", path: "/report" },
    { text: "Notification", path: "/notification" },
  ];

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
          {routes.map(({ text, path }) => (
            <ListItem key={path} disablePadding>
              <ListItemButton
                component={Link}
                to={path}
                selected={location.pathname === path}
                sx={{
                  textAlign: "left",
                  borderRadius: 1,
                  m: 1,
                  backgroundColor:
                    location.pathname === path ? "#16b95aff" : "transparent",
                  color: location.pathname === path ? "white" : "black",
                }}
              >
                <ListItemText primary={text} />
              </ListItemButton>
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
