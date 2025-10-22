import {
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Button,
  Badge,
  Avatar,
} from "@mui/material";
import { getInitials } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";

function ProfileSummaryCard({
  userDoc,
  pendingReportsLength,
  reportsLength,
  emergencyReportsLength,
}) {
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      sx={{
        flexGrow: 1,
        textAlign: "center",
        borderRadius: 4,
        // boxShadow: "0px 2px 4px rgba(167, 166, 166, 0.5)",
        pt: 3,
      }}
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
            width: 120,
            height: 120,
          }}
        >
          <Avatar
            
            src={userDoc?.profilePic}
            sx={{
              bgcolor: "#2ED573",
              width: 120,
              height: 120,
              margin: "0 auto",
              mb: 2,
              border: "4px solid white",
              boxShadow: 1,
            }}
          >
            {getInitials(userDoc?.firstName)}
          </Avatar>
        </Badge>

        <Typography variant="h6">{userDoc?.name}</Typography>
        <Typography variant="body1" sx={{ fontSize: 14, color: "#adadadff" }}>
          {userDoc?.email}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2} sx={{ mb: 2 }}>
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
        <Button
          variant="outlined"
          sx={{
            borderColor: "#2ED573",
            color: "#2ED573",
            "&:hover": { borderColor: "#1EBF5F", color: "#1EBF5F" },
          }}
          onClick={() => navigate("/profile")}
        >
          Go to Profile
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProfileSummaryCard;
