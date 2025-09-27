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
import { useState } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import ChangePasswordDialog from "./ChangePasswordDialog";
import DeleteAccountDialog from "./DeleteAccountDialog";
import EditFieldDialog from "./EditFieldDialog";

function AccountInformationCard({ userDoc }) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(userDoc?.firstName || "");
  const [lastName, setLastName] = useState(
    userDoc?.name?.split(" ").slice(1).join(" ") || ""
  );
  const [email, setEmail] = useState(userDoc?.email || "");
  const [firstNameError, setFirstNameError] = useState();
  const [lastNameError, setLastNameError] = useState();
  const [emailError, setEmailError] = useState();
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingField, setEditingField] = useState("");
  const [editingValue, setEditingValue] = useState("");

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
  const handleChangePassword = (passwords) => {
    // TODO: Implement change password logic
    console.log('Change password:', passwords);
    setOpenModal(false);
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

  const handleSaveEdit = (newValue) => {
    switch (editingField) {
      case "First Name":
        setFirstName(newValue);
        break;
      case "Last Name":
        setLastName(newValue);
        break;
      case "Email":
        setEmail(newValue);
        // TODO: Validate email format
        break;
    }
    // TODO: Save changes to backend
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
              disabled={loading || !isEditing}
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
                          color: emailError ? "error.main" : "#2ED573", // red if error, green otherwise
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
