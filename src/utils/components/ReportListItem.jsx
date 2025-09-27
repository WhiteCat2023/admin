import { Card, CardContent, Typography, Divider, Box } from "@mui/material";
import { CardActionArea } from "@mui/material";

function ReportListItem({ item, onClick }) {
  const getTierColor = (tier) => {
    const tierLower = tier?.toLowerCase();
    if (tierLower === "emergency") return "#ff0000";
    if (tierLower === "high") return "#ffbb00";
    if (tierLower === "medium") return "#fffb00";
    if (tierLower === "low") return "#00ff22";
    return "#666666"; // default color
  };

  const formattedDate = item.timestamp?.toDate
    ? new Date(item.timestamp.toDate()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <Card key={item.id} sx={{ mb: 1, borderRadius: 2 }} elevation={0}>
      <CardActionArea onClick={() => onClick(item)}>
        <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
          <Divider
            orientation="vertical"
            sx={{
              height: 70, // Match the text height
              borderRightWidth: 3, // Thicker line
              borderColor: "#2ED573", // Color
              borderRadius: 2,
              mr: 2, // More margin for better spacing
            }}
          />
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={700}
                fontSize={16}
              >
                {item.title}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                fontSize={12}
              >
                {formattedDate}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                fontSize={12}
              >
                Status: {item.status}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color={getTierColor(item.tier)}
              sx={{
                textShadow: "1px 1px 1px rgb(0, 0, 0)",
              }}
              fontSize={12}
            >
              {item.tier}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ReportListItem;
