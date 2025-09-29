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
import ProfilePictureModal from "../utils/components/ProfilePictureModal";
import CoverPhotoModal from "../utils/components/CoverPhotoModal";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { getInitials } from "../utils/helpers";
import { updateProfilePicture, updateCoverPhoto } from "../utils/controller/users.controller";
import Swal from 'sweetalert2';

function Profile() {
  const [showContent, setShowContent] = useState(true);
  const [value, setValue] = useState(0);
  const [openProfilePicModal, setOpenProfilePicModal] = useState(false);
  const [openCoverPhotoModal, setOpenCoverPhotoModal] = useState(false);
  const { userDoc, refetchUserDoc } = useAuth();



  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleUpdateProfilePic = async (formData) => {
    if (!userDoc?.id) {
      Swal.fire({
        title: 'Error!',
        text: 'User ID not available',
        icon: 'error',
        confirmButtonColor: '#2ED573'
      });
      return;
    }

    const newData = new FormData();
    newData.append("uid", userDoc.id);
    newData.append("file", formData.get('file'));

    try {
      const result = await updateProfilePicture(newData);

      if (result.status === 200) {
        await refetchUserDoc();
        Swal.fire({
          title: 'Success!',
          text: 'Profile picture updated successfully',
          icon: 'success',
          confirmButtonColor: '#2ED573'
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: result.message || "Failed to update profile picture",
          icon: 'error',
          confirmButtonColor: '#2ED573'
        });
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      Swal.fire({
        title: 'Error!',
        text: "Error updating profile picture: " + error.message,
        icon: 'error',
        confirmButtonColor: '#2ED573'
      });
    }
  };

  const handleUpdateCoverPhoto = async (formData) => {
    if (!userDoc?.id) {
      Swal.fire({
        title: 'Error!',
        text: 'User ID not available',
        icon: 'error',
        confirmButtonColor: '#2ED573'
      });
      return;
    }

    const newData = new FormData();
    newData.append("uid", userDoc.id);
    newData.append("file", formData.get('file'));

    try {
      const result = await updateCoverPhoto(newData);

      if (result.status === 200) {
        await refetchUserDoc();
        Swal.fire({
          title: 'Success!',
          text: 'Cover photo updated successfully',
          icon: 'success',
          confirmButtonColor: '#2ED573'
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: result.message || "Failed to update cover photo",
          icon: 'error',
          confirmButtonColor: '#2ED573'
        });
      }
    } catch (error) {
      console.error("Error updating cover photo:", error);
      Swal.fire({
        title: 'Error!',
        text: "Error updating cover photo: " + error.message,
        icon: 'error',
        confirmButtonColor: '#2ED573'
      });
    }
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
            backgroundColor: userDoc?.coverPhoto ? "transparent" : "#000",
            backgroundImage: userDoc?.coverPhoto ? `url(${userDoc.coverPhoto})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "flex-end",
            borderRadius: 3,
            "&::before": userDoc?.coverPhoto ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderRadius: 3,
            } : {},
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
              onClick={() => setOpenCoverPhotoModal(true)}
            >
              <EditIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 3, mx: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={userDoc?.profilePic}
                sx={{
                  width: 80,
                  height: 80,
                  mr: 3,
                  border: "4px solid white",
                  boxShadow: 2,
                  bgcolor: "#2ED573",
                }}
              >
                {getInitials(userDoc?.firstName)}
              </Avatar>
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 20,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: "50%",
                  p: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,1)",
                  },
                }}
                onClick={() => setOpenProfilePicModal(true)}
              >
                <EditIcon sx={{ color: "#2ED573", fontSize: 16 }} />
              </IconButton>
            </Box>
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

          {/* Profile Picture Modal */}
          <ProfilePictureModal
            open={openProfilePicModal}
            onClose={() => setOpenProfilePicModal(false)}
            onUpdateProfilePic={handleUpdateProfilePic}
            currentProfilePic={userDoc?.profilePic}
          />

          {/* Cover Photo Modal */}
          <CoverPhotoModal
            open={openCoverPhotoModal}
            onClose={() => setOpenCoverPhotoModal(false)}
            onUpdateCoverPhoto={handleUpdateCoverPhoto}
            currentCoverPhoto={userDoc?.coverPhoto}
          />
        </Box>
      </Box>
    </Fade>
  );
}

export default Profile;
