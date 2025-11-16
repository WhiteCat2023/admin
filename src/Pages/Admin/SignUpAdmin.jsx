import React, { useState } from "react";
import {
  Box,
  Typography,
  Fade,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Swal from "sweetalert2";
import { createAdminUser } from "../../utils/services/firebase/users.services";

export default function SignUpAdmin() {
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Validation error states
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

  const isError = !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirm.trim() ||
      firstNameError ||
      lastNameError ||
      emailError ||
      passwordError ||
      confirmPasswordError ||
      termsError;

  // Validation functions
  const validateName = (name) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(name);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFirstName(value);
    setFirstNameError(
      !value.trim()
        ? "First name is required."
        : !validateName(value)
        ? "Only letters are allowed."
        : ""
    );
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setLastName(value);
    setLastNameError(
      !value.trim()
        ? "Last name is required."
        : !validateName(value)
        ? "Only letters are allowed."
        : ""
    );
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(
      !value.trim()
        ? "Email is required."
        : !validateEmail(value)
        ? "Enter a valid email address."
        : ""
    );
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(
      !value.trim()
        ? "Password is required."
        : !validatePassword(value)
        ? "Password must be at least 8 characters and contain a letter, a number, and a special character."
        : ""
    );
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirm(value);
    setConfirmPasswordError(
      !value.trim()
        ? "Please confirm your password."
        : value !== password
        ? "Passwords do not match."
        : ""
    );
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("admin");
    setPassword("");
    setConfirm("");
    setAcceptedTerms(false);
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTermsError(
      !acceptedTerms ? "You must accept the Terms and Conditions." : ""
    );
    setFirstNameError(!firstName.trim() ? "First name is required." : "");
    setLastNameError(!lastName.trim() ? "Last name is required." : "");
    setEmailError(
      !email.trim()
        ? "Email is required."
        : !validateEmail(email)
        ? "Enter a valid email address."
        : ""
    );
    setPasswordError(
      !password.trim()
        ? "Password is required."
        : !validatePassword(password)
        ? "Password must be at least 8 characters and contain a letter, a number, and a special character."
        : ""
    );
    setConfirmPasswordError(
      !confirm.trim()
        ? "Please confirm your password."
        : confirm !== password
        ? "Passwords do not match."
        : ""
    );

    if (isError) setLoading(false);
    
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await createAdminUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        email: email.trim(),
        role,
        password,
      });
      Swal.fire({
        icon: "success",
        title: "Admin User Created",
        html: `A confirmation email has been sent to <strong>${email.trim()}</strong>. Please check your inbox and confirm your email address.`,
        confirmButtonText: "OK",
      }).then(() => {
        resetForm();
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fade in timeout={300}>
      <Box sx={{height: "100vh", maxWidth: 600, mx: "auto", p: 3 }}>
        {/* added back button next to title */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            aria-label="back"
            onClick={() => window.history.back()}
            size="large"
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography variant="h4" sx={{ ml: 1, fontWeight: "bold" }}>
            Sign up Admin
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl fullWidth error={!!firstNameError}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={handleFirstNameChange}
              required
              fullWidth
              error={!!firstNameError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                },
              }}
            />
            {firstNameError && (
              <FormHelperText>{firstNameError}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth error={!!lastNameError}>
            <TextField
              label="Last Name"
              value={lastName}
              onChange={handleLastNameChange}
              required
              fullWidth
              error={!!lastNameError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                },
              }}
            />
            {lastNameError && <FormHelperText>{lastNameError}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth error={!!emailError}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              fullWidth
              error={!!emailError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                },
              }}
            />
            {emailError && <FormHelperText>{emailError}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
              sx={{
                backgroundColor: "#fff",
              }}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="super">Super Admin</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth error={!!passwordError}>
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              fullWidth
              error={!!passwordError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                },
              }}
              helperText="At least 8 characters with letter, number, and special character"
            />
            {passwordError && <FormHelperText>{passwordError}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth error={!!confirmPasswordError}>
            <TextField
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={handleConfirmPasswordChange}
              required
              fullWidth
              error={!!confirmPasswordError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fff",
                },
              }}
            />
            {confirmPasswordError && (
              <FormHelperText>{confirmPasswordError}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth error={!!termsError}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
              }
              label="I agree to the Terms and Conditions"
            />
            {termsError && <FormHelperText error>{termsError}</FormHelperText>}
          </FormControl>

          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 1 }}
          >
            <Button variant="outlined" onClick={resetForm} disabled={loading}>
              Reset
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Creating..." : "Create Admin"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
}
