import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";

const getTierColor = (item) => {
  const tier = item.tier?.toLowerCase();
  if (tier === "emergency") return "#ff0000";
  if (tier === "high") return "#ffbb00";
  if (tier === "medium") return "#fffb00";
  if (tier === "low") return "#00ff22";
  return "#666666"; // default color
};

function ReportDetailDialog({ open, onClose, report, onRespond }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {report?.title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {report?.timestamp
                ? new Date(
                    report.timestamp.seconds * 1000
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}{" "}
              {report?.timestamp
                ? new Date(
                    report.timestamp.seconds * 1000
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : ""}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                mt: 0.5,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                <strong>Status:</strong> {report?.status}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", gap: 1 }}
              >
                <strong>Tier:</strong>
                <span style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",

                      backgroundColor: report
                        ? getTierColor(report)
                        : "#666666",
                      marginRight: 4,
                    }}
                  ></span>
                  {report?.tier}
                </span>
              </Typography>
              {report?.status?.toLowerCase() === "responded" && report?.respondedBy && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Responded By:</strong> {report.respondedBy.userName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Responded At:</strong> {report.respondedBy.respondedAt ? new Date(report.respondedBy.respondedAt).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : "N/A"}
                  </Typography>
                </>
              )}
              {report?.status?.toLowerCase() === "ignored" && report?.ignoredBy && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Ignored By:</strong> {report.ignoredBy.userName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Ignored At:</strong> {report.ignoredBy.ignoredAt ? new Date(report.ignoredBy.ignoredAt).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }) : "N/A"}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: 1 }} />
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{ textAlign: "justify" }}
          >
            {report?.description}
          </Typography>
        </Box>

        {report?.images && report.images.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
              Images
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {report.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Report image ${index + 1}`}
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => window.open(image, "_blank")}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        {report?.status?.toLowerCase() === "pending" && (
          <Button
            variant="contained"
            sx={{ bgcolor: "#2ED573", "&:hover": { bgcolor: "#1EBF5F" } }}
            onClick={() => onRespond(report)}
          >
            Respond
          </Button>
        )}
        <Button
          onClick={onClose}
          sx={{ color: "#2ED573" }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReportDetailDialog;
