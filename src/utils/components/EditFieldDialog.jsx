import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";

function EditFieldDialog({ open, onClose, fieldName, value, onSave }) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(inputValue);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ borderRadius: 12 }}>
      <DialogTitle sx={{ fontWeight: "bold" }}>Edit {fieldName}</DialogTitle>
      <Divider />
      <DialogContent>
        <TextField
          label={fieldName}
          variant="outlined"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#ccc",
                borderRadius: 2,
              },
              "&:hover fieldset": {
                borderColor: "#2ED573",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#2ED573",
                borderWidth: 2,
              },
            },
            "& .MuiInputLabel-root": {
              color: "#ccc",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#2ED573",
            },
          }}
        />
      </DialogContent>
      <Divider sx={{ my: 3 }} />
      <DialogActions>
        <Button sx={{ color: "#2ED573" }} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#2ED573", color: "white" }}
          onClick={handleSave}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditFieldDialog;
