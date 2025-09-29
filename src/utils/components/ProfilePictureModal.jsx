import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Swal from 'sweetalert2';

function ProfilePictureModal({ open, onClose, onUpdateProfilePic, currentProfilePic }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentProfilePic || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, PNG images are allowed.");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File size too large. Maximum size is 5MB.");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile) {
      setError("Please select a profile picture.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await onUpdateProfilePic(formData);
      setSelectedFile(null);
      setPreview(null);
      setError('');
      onClose();
    } catch (err) {
      console.error("Error updating profile picture:", err);
      Swal.fire({
        title: 'Error!',
        text: err.message || "Failed to update profile picture",
        icon: 'error',
        confirmButtonColor: '#2ED573'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(currentProfilePic || null);
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{ borderRadius: 12 }}
    >
      <DialogTitle sx={{ fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Change Profile Picture
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select a new profile picture below.
          </Typography>
          {preview && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <img
                src={preview}
                alt="Profile Preview"
                style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover" }}
              />
            </Box>
          )}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-pic-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="profile-pic-upload">
            <Button
              variant="contained"
              component="span"
              sx={{
                backgroundColor: "#2ED573",
                color: "white",
                borderRadius: 2,
                py: 1,
                px: 3,
                "&:hover": {
                  backgroundColor: "#7BED9F",
                },
              }}
              disabled={loading}
            >
              Choose Image
            </Button>
          </label>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ color: "#2ED573" }}
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#2ED573", color: "white" }}
          onClick={handleUpdate}
          disabled={loading || !selectedFile}
        >
          {loading ? "Updating..." : "Update Profile Picture"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProfilePictureModal;
