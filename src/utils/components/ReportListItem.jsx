import { Card, CardContent, Typography, Divider, Box } from "@mui/material";
import { CardActionArea } from "@mui/material";
import { getTierColor, formattedDate } from "../../utils/helpers";

function ReportListItem({ item, onClick }) {
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
              <Typography variant="body1" color="text.secondary" fontSize={12}>
                {formattedDate(item)}
              </Typography>
              <Typography variant="body1" color="text.secondary" fontSize={12}>
                Status: {item.status}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="body1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
                fontSize={12}
              >
                <Typography
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: getTierColor(item),
                    marginRight: 1,
                    verticalAlign: "middle",
                  }}
                ></Typography>
                {item.tier}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ReportListItem;
