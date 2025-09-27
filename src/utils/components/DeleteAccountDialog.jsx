import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

function DeleteAccountDialog({ open, onClose, onConfirmDelete }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Delete Account</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete your account? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button sx={{ color: "#2ED573" }} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#FF384A", color: "white" }}
          onClick={onConfirmDelete}
        >
          Delete Account
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteAccountDialog;
