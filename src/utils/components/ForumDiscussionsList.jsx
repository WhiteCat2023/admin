import { Box, Paper, Typography } from "@mui/material";
import ForumDiscussionCard from "./ForumDiscussionCard";

function ForumDiscussionsList({
  discussions,
  userLikes,
  currentTime,
  onNavigate,
  onLike,
  onDelete,
  pillButton,
}) {
  return (
    <Box sx={{ mb: 4 }}>
      {discussions.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {discussions.map((discussion) => (
            <ForumDiscussionCard
              key={discussion.id}
              discussion={discussion}
              isLiked={userLikes[discussion.id]}
              currentTime={currentTime}
              onNavigate={onNavigate}
              onLike={onLike}
              onDelete={onDelete}
              pillButton={pillButton}
            />
          ))}
        </Box>
      ) : (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: "8px",
            bgcolor: "#fff",
            border: "1px solid #e0e0e0",
          }}
          elevation={0}
        >
          <Typography
            variant="body1"
            sx={{ color: "#999", fontFamily: '"Poppins", sans-serif' }}
          >
            No discussions found. Be the first to start one!
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default ForumDiscussionsList;
