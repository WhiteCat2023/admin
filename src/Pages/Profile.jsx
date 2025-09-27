import {
  Avatar,
  Box,
  Typography,
  Card,
  Fade,
  useMediaQuery,
  Button,
  TextField,
  Grid,
  IconButton,
  Divider,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import AccountInformationCard from "../utils/components/AccountInformationCard";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const [showContent, setShowContent] = useState(true);
  const [value, setValue] = useState(0);
  const { userDoc } = useAuth();

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  // const getStatusColor = (status) => {
  //   if (status === "Paid" || status === "Delivered") return "success";
  //   if (status === "Pending" || status === "Processing") return "warning";
  //   return "default";
  // };

  return (
    <Fade in={showContent} timeout={600}>
      <Box sx={{ flexGrow: 1 }}>
        {/* Profile Header */}
        <Box
          sx={{
            position: "relative",
            height: 200,
            backgroundColor: "#000",
            display: "flex",
            alignItems: "flex-end",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1,
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: "50%",
              p: 0.5,
            }}
          >
            <IconButton
              sx={{ color: "#2ED573" }}
              onClick={() => console.log("Upload Cover Photo")}
            >
              <EditIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 3, mx: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                border: "4px solid white",
                boxShadow: 2,
              }}
            >
              {getInitials(userDoc?.firstName)}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {userDoc?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {userDoc?.email}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Admin
              </Typography>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs
            value={value}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              "& .MuiTab-root.Mui-selected": {
                color: "#2ED573",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#2ED573",
              },
            }}
          >
            <Tab label="Account Information" />
          </Tabs>

          {/* Content based on tab */}
          {value === 0 && <AccountInformationCard userDoc={userDoc} />}
        </Box>
      </Box>
    </Fade>
  );
}

export default Profile;
