import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import LoginPicture from "./assets/LoginPicture.png";
import Logo from "./assets/Logo.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./utils/config/firebase";
import Stack from "@mui/material/Stack";
import Divider, { dividerClasses } from "@mui/material/Divider";
import Ariba from "./assets/Ariba.png";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple email regex
  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Password: min 8 chars, at least one letter, one number, and one special character
  const validatePassword = (value) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(
      value && !validateEmail(value) ? "Enter a valid email address." : ""
    );
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(
      value && !validatePassword(value)
        ? "Password must be at least 8 characters and contain a letter, a number, and a special character."
        : ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError(!validateEmail(email) ? "Enter a valid email address." : "");
    setPasswordError(
      !validatePassword(password)
        ? "Password must be at least 8 characters and contain a letter, a number, and a special character."
        : ""
    );

    if (validateEmail(email) && validatePassword(password)) {
      try {
        await signInWithEmailAndPassword(auth, email, password);

        window.location.href = "/";
      } catch (error) {
        // Show Firebase error
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          setPasswordError("Invalid email or password.");
        } else {
          setPasswordError(error.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 500,
          mt: 8,
          gap: 4,
        }}
      >
        {/* Left Side - Background Image */}
        <Box sx={{ height: 800, flex: 1 }}>
          <Box>
            <Box
              sx={{
                flex: 1,
                display: { xs: "none", md: "flex" },
                borderRadius: 4,
                overflow: "hidden",
                height: 100,
                backgroundImage: `url(${Ariba})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></Box>
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{
                mb: 3,
                textAlign: "center",
                color: "#000000ff",
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
              }}
            >
              Locate - Report - Connect
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: { xs: "none", md: "flex" },
              borderRadius: 4,
              overflow: "hidden",
              height: 800,
              backgroundImage: `url(${LoginPicture})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* No content needed here */}
          </Box>
        </Box>

        {/* Right Side - Login Form */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            pb: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 500,
            borderRadius: 4,
            width: 400,
          }}
        >
          <form style={{ width: "100%" }} onSubmit={handleSubmit} noValidate>
            <Box
              sx={{
                flex: 1,
                display: { xs: "none", md: "flex" },
                borderRadius: 4,
                overflow: "hidden",
                height: 150,
                backgroundImage: `url(${Logo})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></Box>
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ mb: 3, textAlign: "center", color: "#2ED573" }}
            >
              Greetings! <br />
              Welcome Back
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }} error={!!emailError}>
              <TextField
                disabled={loading}
                placeholder="Email"
                variant="outlined"
                fullWidth
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon
                        sx={{
                          color: emailError ? "error.main" : "#2ED573", // red if error, green otherwise
                        }}
                      />
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
                }}
              />
              {emailError && <FormHelperText>{emailError}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }} error={!!passwordError}>
              <TextField
                disabled={loading}
                placeholder="Password"
                variant="outlined"
                fullWidth
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                error={!!passwordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon
                        sx={{
                          color: passwordError ? "error.main" : "#2ED573", // red if error, green otherwise
                        }}
                      />
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
                }}
              />
              {passwordError && (
                <FormHelperText>{passwordError}</FormHelperText>
              )}
            </FormControl>
            <Link
              onClick={() => (window.location.href = "/forgot-password")}
              variant="body2"
              sx={{
                mt: -1,
                float: "right",
                mb: 2,
                color: "#2ED573", // custom green
                fontWeight: 200,
                textDecoration: "none",
                "&:hover": {
                  color: "#1E9E4D", // darker shade on hover
                  textDecoration: "underline",
                },
              }}
            >
              Forgot Password
            </Link>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                mt: 1,
                background: "linear-gradient(90deg, #2ED573 0%, #7BED9F 100%)",
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #7BED9F 0%, #2ED573 100%)",
                },
              }}
              type="submit"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Or
              </Typography>
            </Divider>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                mt: 1,
                background: "linear-gradient(90deg, #FFA502 0%, #FF6348 100%)",
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #FF6348 0%, #FFA502 100%)",
                },
              }}
              type="button"
              onClick={() => (window.location.href = "/signup")}
            >
              Sign Up
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
