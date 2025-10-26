import {
  Box,
  Typography,
  Fade,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Switch,
  Tooltip,
  Grid,
  Stack,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Block as BlockIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { fetchAdmins } from "../../utils/controller/users.controller";
import { getAllAdminUsers } from "../../utils/services/firebase/users.services";
import { Navigate, useNavigate } from "react-router-dom";

function AdminUser() {
  const [showContent, setShowContent] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentUser] = useState({
    id: 0,
    name: "Super Admin",
    role: "super",
  });
  const [adminUsers, setAdminUsers] = useState([]);

  // Add Admin dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("admin");

  // View details modal state
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const openDetails = (admin) => setSelectedAdmin(admin);
  const closeDetails = () => setSelectedAdmin(null);

  const navigate = useNavigate();

  const openAdd = () => setAddOpen(true);
  const closeAdd = () => {
    setAddOpen(false);
    setNewName("");
    setNewEmail("");
    setNewRole("admin");
  };

  useEffect(() => {
    getAllAdminUsers(setAdminUsers);
  }, []);

  const handleAddAdmin = () => {
    if (!newName || !newEmail) return;
    const nextId = Math.max(0, ...(adminUsers.map((u) => u.id) || [])) + 1;
    const newUser = {
      id: nextId,
      name: newName,
      email: newEmail,
      role: newRole,
      online: true, // new admin is marked online for demo
      restricted: false,
    };
    setAdminUsers((prev) => [newUser, ...prev]);
    closeAdd();
  };

  // Toggle restrict/unrestrict (super admin only)
  const toggleRestrict = (id) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, restricted: !u.restricted } : u))
    );
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src={params.row?.avatar}
            alt={params.row?.name}
            sx={{ width: 36, height: 36 }}
          >
            {params.row?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Typography sx={{ fontWeight: "medium" }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: "medium" }}>{params.value}</Typography>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: "bold" }}>{params.value}</Typography>
      ),
    },
    {
      field: "restricted",
      headerName: "Restricted",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Typography color="error">Yes</Typography>
        ) : (
          <Typography color="success.main">No</Typography>
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;
        const canManage = currentUser.role === "super" && row.role !== "super";
        return (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip
              title={
                canManage
                  ? row.restricted
                    ? "Unrestrict"
                    : "Restrict"
                  : "Not allowed"
              }
            >
              <span>
                <IconButton
                  size="small"
                  onClick={() => toggleRestrict(row.id)}
                  disabled={!canManage}
                  color={row.restricted ? "error" : "primary"}
                >
                  {row.restricted ? <BlockIcon /> : <CheckIcon />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="View details">
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => openDetails(row)}
                  disabled={row.restricted}
                >
                  View
                </Button>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const filtered = adminUsers
    .filter(
      (u) =>
        (u.firstName || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (u.lastName || "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
    )
    .filter((u) => u.role !== "super");

  return (
    <Fade in={showContent} timeout={600}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: "bold" }}>
            Admin User
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ borderRadius: 4 }}>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 300,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "15px",
                  "&.Mui-focused fieldset": {
                    borderColor: "#2ED573",
                  },
                  "&:hover fieldset": {
                    borderColor: "#2ED573",
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* DataGrid showing online admins */}
        <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 250px)" }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            {currentUser.role === "super" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/admin-users/signup-admin")}
              >
                Add Admin
              </Button>
            )}
          </Box>
          <Box sx={{ flex: 1, width: "100%" }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              autoHeight={false}
              disableSelectionOnClick
              getRowId={(row) => row.id}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              sx={{
                height: "100%",
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            />
          </Box>
        </Box>

        {/* View Admin Details Modal */}
        <Dialog
          open={!!selectedAdmin}
          onClose={closeDetails}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Admin Details
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                <Avatar
                  src={selectedAdmin?.avatar}
                  alt={selectedAdmin?.name}
                  sx={{ width: 80, height: 80 }}
                >
                  {selectedAdmin?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
                <Box>{selectedAdmin?.name ?? "-"}</Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Box>{selectedAdmin?.email ?? "-"}</Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Role
                </Typography>
                <Box sx={{ fontWeight: "bold" }}>{selectedAdmin?.role ?? "-"}</Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box>
                  {selectedAdmin?.restricted ? (
                    <Typography color="error">Restricted</Typography>
                  ) : (
                    <Typography color="success.main">Active</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDetails}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Add Admin Dialog (super admin only) */}
        <Dialog open={addOpen} onClose={closeAdd}>
          <DialogTitle>Add New Admin</DialogTitle>
          <DialogContent
            sx={{
              minWidth: 360,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={newRole}
                label="Role"
                onChange={(e) => setNewRole(e.target.value)}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super">Super Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAdd}>Cancel</Button>
            <Button
              onClick={handleAddAdmin}
              variant="contained"
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}

export default AdminUser;
