import { Card, CardContent, Typography, Box, Button } from "@mui/material";

function LatestReportCard({ latestReport, shiningEffectStyles, onRespond }) {
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
              sx={{
                fontWeight: 600,
                fontSize: 40,
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              LATEST REPORT
            </Typography>
            <Typography
              color="text.primary"
              sx={{ fontWeight: 600, fontSize: 18 }}
            >
              {latestReport?.title || "No Latest Pending Report"}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontSize: 14 }}>
              {latestReport?.description || "No Latest Pending Report"}
            </Typography>
          </Box>

          <Button
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#34A853",
              px: 9,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 50,
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
              minHeight: 300,
              width: "50%",
              minWidth: 500,
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
