import { Card, CardContent, Typography, Divider, Grid, Button, Badge, Avatar } from "@mui/material";
import { getInitials } from "../../utils/helpers";

function ProfileSummaryCard({ userDoc, pendingReportsLength, reportsLength, emergencyReportsLength }) {
  return (
    <Card
      elevation={2}
      sx={{ flexGrow: 1, textAlign: "center", borderRadius: 4 }}
    >
      <CardContent>
        <Badge
          color="success"
          overlap="circular"
          badgeContent=" "
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          invisible={pendingReportsLength === 0}
          sx={{
            width: 80,
            height: 80,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#2ED573",
              width: 80,
              height: 80,
              margin: "0 auto",
              mb: 2,
              border: "2px solid white",
            }}
          >
            {getInitials(userDoc?.firstName)}
          </Avatar>
        </Badge>

        <Typography variant="h6">{userDoc?.name}</Typography>
        <Typography
          variant="body1"
          sx={{ fontSize: 14, color: "#adadadff" }}
        >
          {userDoc?.email}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid size={4}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {pendingReportsLength}
            </Typography>
            <Typography variant="caption">Tasks</Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {reportsLength}
            </Typography>
            <Typography variant="caption">Reports</Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {emergencyReportsLength}
            </Typography>
            <Typography variant="caption">Alerts</Typography>
          </Grid>
        </Grid>
        <Button variant="outlined">Go to Profile</Button>
      </CardContent>
    </Card>
  );
}

export default ProfileSummaryCard;
