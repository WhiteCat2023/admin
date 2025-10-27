import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GetAppIcon from "@mui/icons-material/GetApp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { format } from "date-fns";
import Swal from "sweetalert2";

function SosDataModal({
  open,
  onClose,
  data,
  onRespond,
  onCopyJSON,
  onDownloadJSON,
}) {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {`SOS ${data?.id ?? ""}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data
                ? typeof data.timestamp === "string"
                  ? data.timestamp
                  : data.timestamp
                  ? format(new Date(data.timestamp), "yyyy-MM-dd HH:mm:ss")
                  : ""
                : ""}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Copy JSON">
              <IconButton size="small" onClick={onCopyJSON}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download JSON">
              <IconButton size="small" onClick={onDownloadJSON}>
                <GetAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" size="small" onClick={onClose}>
              Close
            </Button>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Details
            </Typography>

            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Resident
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {data?.firstName ?? data?.userName ?? "-"}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Contact
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {data?.contactNumber ?? data?.phone ? (
                    <a
                      href={`tel:${data?.contactNumber ?? data?.phone}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {data?.contactNumber ?? data?.phone}
                    </a>
                  ) : (
                    "-"
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Type
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {data?.type ?? data?.emergencyType ?? "-"}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {data?.falseAlarm
                    ? "False Alarm"
                    : data?.response?.started && data?.response?.ended
                    ? "Resolved"
                    : data?.verified
                    ? "Verified"
                    : "Unverified"}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Verified By
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {data?.verifiedBy ?? data?.verification?.by ?? "-"}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Responder
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {data?.response?.responderName ??
                    data?.response?.responder ??
                    "-"}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        {!(data?.response?.started && data?.response?.ended) && (
          <Button
            variant="contained"
            color={
              data?.response?.started && !data?.response?.ended
                ? "error"
                : "success"
            }
            onClick={onRespond}
            disabled={!data?.verified}
            startIcon={
              data?.response?.started && !data?.response?.ended ? (
                <StopIcon />
              ) : (
                <PlayArrowIcon />
              )
            }
          >
            {data?.response?.started && !data?.response?.ended
              ? "Finish"
              : "Respond"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default SosDataModal;
