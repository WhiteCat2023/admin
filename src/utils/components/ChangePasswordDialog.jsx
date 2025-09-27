import {
  Box,
  IconButton,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import { useState } from "react";

function ChangePasswordDialog({ open, onClose, onChangePassword }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = () => {
    onChangePassword({ oldPassword, newPassword, confirmPassword });
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Change Password</DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            label="Old Password"
            type={showOldPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                  >
                    {showOldPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc", // default
                  borderRadius: 2,
                },
                "&:hover fieldset": {
                  borderColor: "#2ED573", // on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2ED573", // when active
                  borderWidth: 2, // make it a bit bolder if you want
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
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc", // default
                  borderRadius: 2,
                },
                "&:hover fieldset": {
                  borderColor: "#2ED573", // on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2ED573", // when active
                  borderWidth: 2, // make it a bit bolder if you want
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
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    edge="end"
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc", // default
                  borderRadius: 2,
                },
                "&:hover fieldset": {
                  borderColor: "#2ED573", // on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2ED573", // when active
                  borderWidth: 2, // make it a bit bolder if you want
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
        <Button sx={{ color: "#2ED573" }} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#2ED573", color: "white" }}
          onClick={onChangePassword}
        >
          Change Password
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangePasswordDialog;
