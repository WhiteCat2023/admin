import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  TextareaAutosize,
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
        <DialogContentText>{item?.tc_content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="success" onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewTermsModal;
