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
  FormHelperText,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import { useState } from "react";

function CredentialModal({ open, onClose, onAuthenticate, title = "Authenticate", description = "Please enter your password to continue." }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthenticate = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onAuthenticate(password);
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={{ borderRadius: 12 }}>
      <DialogTitle sx={{ fontWeight: "bold" }}>{title}</DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {description}
          </Typography>
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
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
        <Button sx={{ color: "#2ED573" }} onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#2ED573", color: "white" }}
          onClick={handleAuthenticate}
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Authenticate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CredentialModal;
