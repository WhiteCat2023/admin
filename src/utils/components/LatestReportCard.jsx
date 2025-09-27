import { Card, CardContent, Typography, Box, Button } from "@mui/material";

function LatestReportCard({ latestReport, shiningEffectStyles, onRespond }) {
  return (
    <Card elevation={2} sx={{ p: 1, flexGrow: 1, borderRadius: 4 }}>
      <CardContent sx={{ display: "flex", gap: 2 }}>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
            minWidth: 200,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              LATEST REPORT
            </Typography>
            <Typography
              color="text.primary"
              sx={{ fontWeight: 600, fontSize: 18 }}
            >
              {latestReport?.title || "No Latest Pending Report"}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 1, fontSize: 14 }}
            >
              {latestReport?.description || "No Latest Pending Report"}
            </Typography>
          </Box>

          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#2ED573",
              px: 7,
              fontWeight: 600,
            }}
            onClick={onRespond}
          >
            Respond
          </Button>
        </Box>
        {latestReport?.images?.[0] && (
          <Box
            sx={{
              flex: 1,
              minHeight: 200,
              width: "50%",
              borderRadius: 2,
              overflow: "hidden",
              backgroundImage: `url(${latestReport.images[0]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...shiningEffectStyles,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default LatestReportCard;
