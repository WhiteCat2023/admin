import { Card, CardContent, Typography, Divider, Button } from "@mui/material";
import ReportListItem from "./ReportListItem";

function HistoryCard({ latestRepondedReport, onItemClick }) {
  return (
    <Card
      elevation={2}
      sx={{
        flexGrow: 1,
        borderRadius: 4,
        boxShadow: "0px 2px 4px rgba(167, 166, 166, 0.5)",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          History
        </Typography>
        <Divider sx={{ my: 1 }} />
        {latestRepondedReport && latestRepondedReport.length > 0 ? (
          latestRepondedReport.map((item) => (
            <ReportListItem key={item.id} item={item} onClick={onItemClick} />
          ))
        ) : (
          <ReportListItem
            item={{ title: "No Responded Reports Found" }}
            onClick={() => {}}
          />
        )}
        <Button size="small" sx={{ mt: 1 }}>
          View all Tasks
        </Button>
      </CardContent>
    </Card>
  );
}

export default HistoryCard;
