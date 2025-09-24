import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Ariba from "./assets/Ariba.png";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import { useState } from "react";
import Divider from "@mui/material/Divider";
import { auth } from "./config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Swal from "sweetalert2";
import InputAdornment from "@mui/material/InputAdornment";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(
      value && !validateEmail(value) ? "Enter a valid email address." : ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate first
    if (!email) {
      setEmailError("Email is required.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      //   alert("Password reset email sent! Check your inbox.");
      Swal.fire({
        title: "Success",
        text: "Password reset email sent! Check your inbox.",
        icon: "success",
        confirmButtonText: "Back to Login",
        confirmButtonColor: "#2ED573",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        }
      });
      setEmail(""); // clear field
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setEmailError("No account found with this email.");
      } else {
        setEmailError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, py: 10 }}>
        <Box>
          <Box
            sx={{
              flex: 1,
              mb: 4,
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
            variant="h6"
            fontWeight={200}
            sx={{
              fontSize: { xs: 16, md: 18 },
              mb: 3,
              textAlign: "center",
              color: "#000000ff",
            }}
          >
            Enter email so we can help you reset your password
          </Typography>
        </Box>
        <form style={{ width: "100%" }} onSubmit={handleSubmit} noValidate>
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
                background: "linear-gradient(90deg, #7BED9F 0%, #2ED573 100%)",
              },
            }}
            type="submit"
          >
            {loading ? "Sending Confirmation..." : "Send Confirmation"}
          </Button>
          <Divider sx={{ my: 2 }} />
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
                background: "linear-gradient(90deg, #FF6348 0%, #FFA502 100%)",
              },
            }}
            type="button"
            onClick={() => (window.location.href = "/login")}
          >
            Back to Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default ForgotPassword;
