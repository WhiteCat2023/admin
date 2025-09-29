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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import ChangePasswordDialog from "./ChangePasswordDialog";
import DeleteAccountDialog from "./DeleteAccountDialog";
import EditFieldDialog from "./EditFieldDialog";
import { updateUserName } from "../services/firebase/users.services";
import { updateName } from "../controller/users.controller";
import { updatePassword } from "../controller/auth.controller";
import Swal from 'sweetalert2';

function AccountInformationCard({ userDoc }) {
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
  const [editingField, setEditingField] = useState("");
  const [editingValue, setEditingValue] = useState("");

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
      alert("New passwords do not match");
      return;
    }

    if (!userDoc?.email) {
      alert("User email not available");
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
        alert(result.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error changing password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);
  const handleConfirmDelete = () => {
    // TODO: Implement delete account logic
    console.log('Delete account');
    setOpenDeleteModal(false);
  };

  const handleOpenEdit = (field, value) => {
    setEditingField(field);
    setEditingValue(value);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async (newValue) => {
    if (!userDoc?.id) {
      console.error("User ID not available");
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
        } catch (error) {
          console.error("Error updating first name:", error);
        }
        break;
      case "Last Name":
        setLastName(newValue);
        newData.append("field", "lastName");
        newData.append("value", newValue);
        try {
          await updateName(newData);
        } catch (error) {
          console.error("Error updating last name:", error);
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

  return (
    <Card sx={{ p: 3, pb: 6 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Account Information
      </Typography>
      <Divider sx={{ my: 3 }} />
      <Grid container spacing={2}>
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
                    <IconButton onClick={() => handleOpenEdit("First Name", firstName)}>
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
                    <IconButton onClick={() => handleOpenEdit("Last Name", lastName)}>
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
      <Divider sx={{ my: 3 }} />
      <Box sx={{ px: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
          Change Password
        </Typography>
        <Typography variant="body2">
          If you want to change your password, you can do so below by clicking
          the{" "}
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            “Change Password Button”
          </Typography>
          .
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
          the{" "}
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            “Delete Account Button”
          </Typography>
          .
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
    </Card>
  );
}

export default AccountInformationCard;
