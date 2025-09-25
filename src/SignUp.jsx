import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import SignUpPicture from "./assets/SignUpPicture.png";
import Ariba from "./assets/Ariba.png";
import Logo from "./assets/Logo.png";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./utils/config/firebase";
import Divider, { dividerClasses } from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import KeyIcon from "@mui/icons-material/Key";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import { signUp } from "./utils/controller/auth.controller";
import { Role } from "./utils/enums/roles";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import Swal from 'sweetalert2';

function SignUp() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  useEffect(() => {
    if (user && user.emailVerified) {
      window.location.href = "/dashboard";
    }
  }, [user]);

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
    // Minimum 8 characters, at least one letter, one number and one special character
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
    setConfirmPassword(value);
    setConfirmPasswordError(
      !value.trim()
        ? "Please confirm your password."
        : value !== password
        ? "Passwords do not match."
        : ""
    );
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
      !confirmPassword.trim()
        ? "Please confirm your password."
        : confirmPassword !== password
        ? "Passwords do not match."
        : ""
    );

    // stop if any validation errors exist
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      firstNameError ||
      lastNameError ||
      emailError ||
      passwordError ||
      confirmPasswordError ||
      termsError
    ) {
      setLoading(false);
      return;
    }

    try {
      // ✅ Create user in Firebase with form data
      const formData = {
        email,
        password,
        firstName,
        lastName,
      };
      const response = await signUp(formData);
      if (response.status === 200) {
        await Swal.fire({
          title: 'Sign up success!',
          text: 'Check your email for verification',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        setPasswordError(response.message || "Signup failed.");
      }
    } catch (error) {
      console.error(error);
      setPasswordError(error.message);
    } finally {
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
        {/* Right Side - Login Form */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            pb: 6,
            mb: 8,
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
              variant="subtitle1"
              fontWeight={500}
              sx={{ m: 0, textAlign: "center", color: "#2ED573" }}
            >
              Welcome Let's set you up first!
            </Typography>
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ mb: 3, textAlign: "center", color: "#2ED573" }}
            >
              Greetings!
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }} error={!!firstNameError}>
              <TextField
                required
                disabled={loading}
                placeholder="First Name"
                variant="outlined"
                fullWidth
                type="text"
                autoComplete="name"
                value={firstName}
                onChange={handleFirstNameChange}
                error={!!firstNameError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon
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
              {firstNameError && (
                <FormHelperText>{firstNameError}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }} error={!!lastNameError}>
              <TextField
                required
                disabled={loading}
                placeholder="Last Name"
                variant="outlined"
                fullWidth
                type="text"
                autoComplete="email"
                value={lastName}
                onChange={handleLastNameChange}
                error={!!lastNameError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon
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
              {lastNameError && (
                <FormHelperText>{lastNameError}</FormHelperText>
              )}
            </FormControl>
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
                      <KeyIcon
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
              {passwordError && (
                <FormHelperText>{passwordError}</FormHelperText>
              )}
            </FormControl>
            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              error={!!confirmPasswordError}
            >
              <TextField
                disabled={loading}
                variant="outlined"
                placeholder="Re-enter your password"
                fullWidth
                type="password"
                autoComplete="current-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={!!confirmPasswordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon
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
              {confirmPasswordError && (
                <FormHelperText>{confirmPasswordError}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={loading}
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    sx={{
                      color: termsError ? "error.main" : "#2ED573",
                      "&.Mui-checked": { color: "#2ED573" },
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      underline="hover"
                      sx={{ color: "#2ED573", fontWeight: 500 }}
                    >
                      Terms and Conditions
                    </Link>
                  </Typography>
                }
              />
              {termsError && (
                <FormHelperText error sx={{ ml: 1 }}>
                  {termsError}
                </FormHelperText>
              )}
            </FormControl>

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
              {loading ? "Signing Up..." : "Sign Up"}
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
              onClick={() => (window.location.href = "/login")}
            >
              Sign In
            </Button>
          </form>
        </Paper>
        {/* Left Side - Background Image */}
        <Box
          sx={{
            position: "relative",
            flex: 1,
            display: { xs: "none", md: "flex" },
            borderRadius: 4,
            height: 800,
            backgroundImage: `url(${SignUpPicture})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* No content needed here */}
          <Box
            sx={{
              position: "absolute",
              top: -90,
              left: 200,
            }}
          >
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
              sx={{ mb: 3, textAlign: "center", color: "#000000ff" }}
            >
              Locate - Report - Connect
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default SignUp;
