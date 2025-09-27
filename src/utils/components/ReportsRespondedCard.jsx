import { Card, CardContent, Typography, Box } from "@mui/material";
import InsertChartIcon from "@mui/icons-material/InsertChart";

function ReportsRespondedCard({ respondedReportsLength, onClick }) {
  return (
    <Card
      elevation={2}
      sx={{
        p: 1,
        flexGrow: 1,
        borderRadius: 4,
        cursor: "pointer",
        boxShadow: "0px 2px 4px rgba(167, 166, 166, 0.5)",
      }}
      onClick={onClick}
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
            Reports responded this month
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {respondedReportsLength}
          </Typography>
        </Box>

        <InsertChartIcon sx={{ fontSize: 40, color: "green" }} />
      </CardContent>
    </Card>
  );
}

export default ReportsRespondedCard;
