import { Alert, AlertTitle, Snackbar } from "@mui/material";

export const NewAlert = ({ msg, title, severity = "info", onClose = () => {}, open = false }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000} // 3 seconds
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {msg}
      </Alert>
    </Snackbar>
  );
};