import {
  Box,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Typography,
} from "@mui/material";
import { useState } from "react";

function EmailChangeModal({ open, onClose, onChangeEmail, currentEmail }) {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!newEmail) {
      setError("New email is required");
      return false;
    }
    if (!confirmEmail) {
      setError("Confirm email is required");
      return false;
    }
    if (newEmail !== confirmEmail) {
      setError("Emails do not match");
      return false;
    }
    if (newEmail === currentEmail) {
      setError("New email must be different from current email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError("Invalid email format");
      return false;
    }
    setError('');
    return true;
  };

  const handleChangeEmail = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onChangeEmail(newEmail);
      setNewEmail('');
      setConfirmEmail('');
      onClose();
    } catch (err) {
      // Error is handled in onChangeEmail with Swal
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewEmail('');
    setConfirmEmail('');
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
      <DialogTitle sx={{ fontWeight: "bold" }}>Change Email</DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your new email address below.
          </Typography>
          <TextField
            label="New Email"
            type="email"
            fullWidth
            margin="normal"
            value={newEmail}
            error={!!error}
            helperText={error}
            onChange={(e) => setNewEmail(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc",
                  borderRadius: 2,
                },
                "&:hover fieldset": {
                  borderColor: "#2ED573",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2ED573",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root": {
                color: "#ccc",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#2ED573",
              },
            }}
          />
          <TextField
            label="Confirm New Email"
            type="email"
            fullWidth
            margin="normal"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc",
                  borderRadius: 2,
                },
                "&:hover fieldset": {
                  borderColor: "#2ED573",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2ED573",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root": {
                color: "#ccc",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#2ED573",
              },
            }}
          />
        </Box>
      </DialogContent>
      <Divider sx={{ my: 3 }} />
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
          onClick={handleChangeEmail}
          disabled={loading}
        >
          {loading ? "Changing..." : "Change Email"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmailChangeModal;
