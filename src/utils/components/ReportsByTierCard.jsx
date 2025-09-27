import { Card, CardContent, Typography, Divider, Button } from "@mui/material";
import ReportListItem from "./ReportListItem";

function ReportsByTierCard({ latestEmergencyReport, onItemClick }) {
  return (
    <Card elevation={2} sx={{ flexGrow: 1, borderRadius: 4 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Reports by TierList
        </Typography>
        <Divider sx={{ my: 1 }} />
        {latestEmergencyReport && latestEmergencyReport.length > 0
          ? latestEmergencyReport.map((item) => (
              <ReportListItem key={item.id} item={item} onClick={onItemClick} />
            ))
          : <ReportListItem item={{ title: "No Emergency Reports Found" }} onClick={() => {}} />}

        <Button size="small" sx={{ mt: 1 }}>
          View all
        </Button>
      </CardContent>
    </Card>
  );
}

export default ReportsByTierCard;
