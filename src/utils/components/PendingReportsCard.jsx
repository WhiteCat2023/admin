import { Card, CardContent, Typography, Box } from "@mui/material";
import ReportIcon from "@mui/icons-material/Report";
import LineGraphIcon from "../../assets/LineGraphIcon.png";
import UserGreenBg from "../../assets/UserGreenBg.png";

function PendingReportsCard({ pendingReportsLength }) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 1,
        flexGrow: 1,
        borderRadius: 4,
        // boxShadow: "0px 2px 4px rgba(167, 166, 166, 0.5)",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{display: "flex", gap: 2, alignItems: "center"}}>
          <Box
            component="img"
            src={UserGreenBg}
            alt="graph"
            sx={{ width: 70, height: 70 }}
          />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Pending Reports
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {pendingReportsLength}
            </Typography>
          </Box>
        </Box>

        <Box
          component="img"
          src={LineGraphIcon}
          alt="graph"
          sx={{ width: 80, height: 50 }}
        />
      </CardContent>
    </Card>
  );
}

export default PendingReportsCard;
