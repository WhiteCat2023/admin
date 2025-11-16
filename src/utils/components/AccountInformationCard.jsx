import {
  Box,
  Typography,
  Card,
  Grid,
  IconButton,
  TextField,
  FormControl,
  Button,
  FormHelperText,
  Divider,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import ChangePasswordDialog from "./ChangePasswordDialog";
import DeleteAccountDialog from "./DeleteAccountDialog";
import EditFieldDialog from "./EditFieldDialog";
import CredentialModal from "./CredentialModal";
import EmailChangeModal from "./EmailChangeModal";
import ProfilePictureModal from "./ProfilePictureModal";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../helpers";
import { updateProfilePicture } from "../controller/users.controller";
import { updateUserName } from "../services/firebase/users.services";
import { updateName } from "../controller/users.controller";
import { updatePassword, updateEmail } from "../controller/auth.controller";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { deleteUserAccount } from "../services/firebase/auth.sevices";

function AccountInformationCard({ userDoc, onDeleteAccount }) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [firstNameError, setFirstNameError] = useState();
  const [lastNameError, setLastNameError] = useState();
  const [emailError, setEmailError] = useState();
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCredentialModal, setOpenCredentialModal] = useState(false);
  const [openEmailChangeModal, setOpenEmailChangeModal] = useState(false);
  const [openProfilePicModal, setOpenProfilePicModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [editingField, setEditingField] = useState("");
  const [editingValue, setEditingValue] = useState("");
  const { refetchUserDoc } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setFirstName(userDoc?.firstName || "")
    setLastName(userDoc?.lastName || "")
    setEmail(userDoc?.email || "")
  }, [userDoc])

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };
  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleChangePassword = async (passwords) => {
    const { oldPassword, newPassword, confirmPassword } = passwords;

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'New passwords do not match',
        icon: 'error',
        confirmButtonColor: '#2ED573'
      });
      return;
    }

    if (!userDoc?.email) {
      Swal.fire({
        title: 'Error!',
        text: 'User email not available',
        icon: 'error',
        confirmButtonColor: '#2ED573'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await updatePassword({
        email: userDoc.email,
        currentPassword: oldPassword,
        newPassword: newPassword,
      });

      if (result.status === 200) {
        Swal.fire({
          title: 'Success!',
          text: 'Password updated successfully',
          icon: 'success',
          confirmButtonColor: '#2ED573'
        });
        setOpenModal(false);
      } else {
        Swal.fire({
          title: 'Error!',
          text: result.message || "Failed to update password",
          icon: 'error',
          confirmButtonColor: '#2ED573'
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Swal.fire({
        title: 'Error!',
        text: "Error changing password: " + error.message,
        icon: 'error',
        confirmButtonColor: '#2ED573'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccountClick = async () => {
    const confirmed = await Swal.fire({
      title: "Delete Account?",
      text: "This action cannot be undone. All your data will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#757575",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      topLayer: true,
    });

    if (!confirmed.isConfirmed) return;

    const passwordPrompt = await Swal.fire({
      title: "Confirm Your Password",
      text: "Enter your password to verify your identity and delete your account",
      input: "password",
      inputPlaceholder: "Enter your password",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#757575",
      confirmButtonText: "Delete Account",
      cancelButtonText: "Cancel",
      topLayer: true,
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      didOpen: () => {
        Swal.getInput().focus();
      },
      inputValidator: (value) => {
        if (!value) {
          return "Password is required";
        }
      },
    });

    if (!passwordPrompt.isConfirmed || !passwordPrompt.value) return;

    // Show loading state while deleting
    await Swal.fire({
      title: "Deleting Account",
      text: "Please wait while we delete your account...",
      icon: "info",
      allowOutsideClick: false,
      allowEscapeKey: false,
      topLayer: true,
      didOpen: async () => {
        Swal.showLoading();
      },
    });

    try {
      await deleteUserAccount(passwordPrompt.value);
      
      await Swal.fire({
        title: "Account Deleted",
        text: "Your account has been successfully deleted. Redirecting to login...",
        icon: "success",
        confirmButtonColor: "#34A853",
        allowOutsideClick: false,
        allowEscapeKey: false,
        topLayer: true,
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to delete account. Please try again.",
        icon: "error",
        confirmButtonColor: "#34A853",
        topLayer: true,
      });
    }
  };

  const handleOpenDeleteModal = () => handleDeleteAccountClick();

  const handleCloseDeleteModal = () => setOpenDeleteModal(false);
  const handleConfirmDelete = () => {
    // TODO: Implement delete account logic
    console.log('Delete account');
    setOpenDeleteModal(false);
  };

  const handleOpenEdit = (field, value) => {
    if (field === "Email") {
      setOpenCredentialModal(true);
    } else {
      setEditingField(field);
      setEditingValue(value);
      setOpenEditDialog(true);
    }
  };

  const handleSaveEdit = async (newValue) => {
    if (!userDoc?.id) {
      console.error("User ID not available");
      Swal.fire({
        title: 'Error!',
        text: 'User ID not available',
        icon: 'error',
        confirmButtonColor: '#2ED573',
        topLayer: true
      });
      return;
    }

    const newData = new FormData();
    newData.append("uid", userDoc.id);

    switch (editingField) {
      case "First Name":
        setFirstName(newValue);
        newData.append("field", "firstName");
        newData.append("value", newValue);
        console.log(newData);
        try {
          await updateName(newData);
          Swal.fire({
            title: 'Success!',
            text: 'First name updated successfully',
            icon: 'success',
            confirmButtonColor: '#2ED573',
            topLayer: true
          });
        } catch (error) {
          console.error("Error updating first name:", error);
          Swal.fire({
            title: 'Error!',
            text: 'Error updating first name: ' + error.message,
            icon: 'error',
            confirmButtonColor: '#2ED573',
            topLayer: true
          });
        }
        break;
      case "Last Name":
        setLastName(newValue);
        newData.append("field", "lastName");
        newData.append("value", newValue);
        try {
          await updateName(newData);
          Swal.fire({
            title: 'Success!',
            text: 'Last name updated successfully',
            icon: 'success',
            confirmButtonColor: '#2ED573',
            topLayer: true
          });
        } catch (error) {
          console.error("Error updating last name:", error);
          Swal.fire({
            title: 'Error!',
            text: 'Error updating last name: ' + error.message,
            icon: 'error',
            confirmButtonColor: '#2ED573',
            topLayer: true
          });
        }
        break;
      case "Email":
        setEmail(newValue);
        // Email update disabled - state only
        break;
    }
    setOpenEditDialog(false);
  };

  const handleCloseEdit = () => {
    setOpenEditDialog(false);
  };

  const handleCredentialAuthenticate = async (password) => {
    setCurrentPassword(password);
    setOpenCredentialModal(false);
    setOpenEmailChangeModal(true);
  };

  const handleCloseCredentialModal = () => {
    setOpenCredentialModal(false);
  };

  const handleChangeEmail = async (newEmail) => {
    if (!userDoc?.email) {
      Swal.fire({
        title: 'Error!',
        text: 'User email not available',
        icon: 'error',
        confirmButtonColor: '#2ED573',
        topLayer: true,
      });
      return;
    }

    if (!currentPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'Password not available',
        icon: 'error',
        confirmButtonColor: '#2ED573',
        topLayer: true,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await updateEmail({
        currentEmail: userDoc.email,
        currentPassword: currentPassword,
        newEmail: newEmail,
      });

      if (result.status === 200) {
        Swal.fire({
          title: 'Success!',
          text: 'Email updated successfully',
          icon: 'success',
          confirmButtonColor: '#2ED573',
          topLayer: true
        });
        setEmail(newEmail);
        setCurrentPassword("");
        setOpenEmailChangeModal(false);
      } else {
        Swal.fire({
          title: 'Error!',
          text: result.message || "Failed to update email",
          icon: 'error',
          confirmButtonColor: '#2ED573',
          topLayer: true
        });
      }
    } catch (error) {
      console.error("Error changing email:", error);
      Swal.fire({
        title: 'Error!',
        text: "Error changing email: " + error.message,
        icon: 'error',
        confirmButtonColor: '#2ED573',
        topLayer: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEmailChangeModal = () => {
    setOpenEmailChangeModal(false);
  };

  const handleUpdateProfilePic = async (formData) => {
    if (!userDoc?.id) {
      Swal.fire({
        title: 'Error!',
        text: 'User ID not available',
        icon: 'error',
        confirmButtonColor: '#2ED573',
        topLayer: true
      });
      return;
    }

    const newData = new FormData();
    newData.append("uid", userDoc.id);
    const file = formData.get('file');
    if (!file) {
      Swal.fire({
        title: 'Error!',
        text: 'No file selected',
        icon: 'error',
        confirmButtonColor: '#2ED573',
        topLayer: true
      });
      return;
    }
    newData.append("file", file);

    try {
      const result = await updateProfilePicture(newData);

      if (result.status === 200) {
        await refetchUserDoc();
        Swal.fire({
          title: 'Success!',
          text: 'Profile picture updated successfully',
          icon: 'success',
          confirmButtonColor: '#2ED573',
          topLayer: true
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: result.message || "Failed to update profile picture",
          icon: 'error',
          confirmButtonColor: '#2ED573',
          topLayer: true
        });
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      Swal.fire({
        title: 'Error!',
        text: "Error updating profile picture: " + error.message,
        icon: 'error',
        confirmButtonColor: '#2ED573',
        topLayer: true
      });
    }
  };

  return (
    <Card sx={{ p: 3, pb: 6 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Account Information
      </Typography>
      <Divider sx={{ mb: 3, mt: 1 }} />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid item xs={4}>
          <FormControl fullWidth sx={{ mb: 2 }} error={!!firstNameError}>
            <TextField
              disabled={loading || !isEditing}
              label="First Name"
              variant="outlined"
              fullWidth
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={handleFirstNameChange}
              error={!!firstNameError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleOpenEdit("First Name", firstName)}
                    >
                      <EditIcon
                        sx={{
                          color: firstNameError ? "error.main" : "#2ED573", // red if error, green otherwise
                        }}
                      />
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
                  color: "#2ED573",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#2ED573",
                },
              }}
            />
            {firstNameError && (
              <FormHelperText>{firstNameError}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth sx={{ mb: 2 }} error={!!lastNameError}>
            <TextField
              disabled={loading || !isEditing}
              label="Last Name"
              variant="outlined"
              fullWidth
              type="text"
              // autoComplete="email"
              value={lastName}
              onChange={handleLastNameChange}
              error={!!lastNameError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleOpenEdit("Last Name", lastName)}
                    >
                      <EditIcon
                        sx={{
                          color: lastNameError ? "error.main" : "#2ED573", // red if error, green otherwise
                        }}
                      />
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
                  color: "#2ED573",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#2ED573",
                },
              }}
            />
            {lastNameError && <FormHelperText>{lastNameError}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth sx={{ mb: 2 }} error={!!emailError}>
            <TextField
              disabled={true}
              label="Email"
              variant="outlined"
              fullWidth
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleOpenEdit("Email", email)}>
                      <EditIcon
                        sx={{
                          color: lastNameError ? "error.main" : "#2ED573", // red if error, green otherwise
                        }}
                      />
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
                  color: "#2ED573",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#2ED573",
                },
              }}
            />
            {emailError && <FormHelperText>{emailError}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              disabled={true}
              label="Role"
              variant="outlined"
              fullWidth
              value={"Admin"}
              onChange={handleEmailChange}
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
                  color: "#2ED573",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#2ED573",
                },
              }}
            />
          </FormControl>
        </Grid>
      </Grid>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Account Settings
      </Typography>
      <Divider sx={{ mb: 3, mt: 1 }} />
      <Box sx={{ px: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
          Change Password
        </Typography>
        <Typography variant="body2">
          If you want to change your password, you can do so below by clicking
          the <strong>“Change Password Button”</strong>.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 7,
            fontWeight: 600,
            mt: 1,
            background: "linear-gradient(90deg, #2ED573 0%, #7BED9F 100%)",
            color: "#fff",
            "&:hover": {
              background: "linear-gradient(90deg, #7BED9F 0%, #2ED573 100%)",
            },
          }}
          onClick={handleOpenModal}
        >
          Change Password
        </Button>
      </Box>
      <Divider sx={{ my: 3, maxWidth: 550 }} />
      <Box sx={{ px: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
          Account Deletion
        </Typography>
        <Typography variant="body2">
          If you want to delete your account, you can do so below by clicking
          the <strong>"Delete Account Button"</strong>.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 7,
            fontWeight: 600,
            mt: 1,
            background: "linear-gradient(90deg, #FF384A 0%, #FF5463 100%)",
            color: "#fff",
            "&:hover": {
              background: "linear-gradient(90deg, #FF5463 0%, #FF384A 100%)",
            },
          }}
          onClick={handleOpenDeleteModal}
        >
          Delete Account
        </Button>
      </Box>

      <ChangePasswordDialog
        open={openModal}
        onClose={handleCloseModal}
        onChangePassword={handleChangePassword}
      />
      <DeleteAccountDialog
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
      />

      <EditFieldDialog
        open={openEditDialog}
        onClose={handleCloseEdit}
        fieldName={editingField}
        value={editingValue}
        onSave={handleSaveEdit}
      />

      <CredentialModal
        open={openCredentialModal}
        onClose={handleCloseCredentialModal}
        onAuthenticate={handleCredentialAuthenticate}
        title="Reauthenticate"
        description="Please enter your current password to change your email."
      />

      <EmailChangeModal
        open={openEmailChangeModal}
        onClose={handleCloseEmailChangeModal}
        onChangeEmail={handleChangeEmail}
        currentEmail={email}
      />

      <ProfilePictureModal
        open={openProfilePicModal}
        onClose={() => setOpenProfilePicModal(false)}
        onUpdateProfilePic={handleUpdateProfilePic}
      />
    </Card>
  );
}

export default AccountInformationCard;
