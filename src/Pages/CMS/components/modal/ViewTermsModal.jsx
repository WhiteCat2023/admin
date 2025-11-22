import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import {
  newTermsAndConditions,
  updateTermsAndConditions,
} from "../../service/cms.service";
import { NewAlert } from "../alert/NewAlert";

function ViewTermsModal({ item, open, handleClose }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle color="success">{item?.tc_title}</DialogTitle>
      <DialogContent>
        <Box sx={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          <Typography variant="body2">{item?.tc_content}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="success" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewTermsModal;
