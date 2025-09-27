import { Card, CardContent, Typography, Box } from "@mui/material";
import ReportIcon from "@mui/icons-material/Report";

function PendingReportsCard({ pendingReportsLength }) {
  return (
    <Card
      elevation={2}
      sx={{
        p: 1,
        flexGrow: 1,
        borderRadius: 4,
        boxShadow: "0px 2px 4px rgba(167, 166, 166, 0.5)",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Pending Reports
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {pendingReportsLength}
          </Typography>
        </Box>

        <ReportIcon sx={{ fontSize: 40, color: "orange" }} />
      </CardContent>
    </Card>
  );
}

export default PendingReportsCard;
