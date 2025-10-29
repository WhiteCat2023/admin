import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Button,
} from "@mui/material";
import {
  MoreVert,
  Favorite,
  FavoriteBorder,
  Comment,
  Delete,
} from "@mui/icons-material";
import { useState } from "react";
import { formatTimeAgo, getInitials } from "../../utils/helpers";

function ForumDiscussionCard({
  discussion,
  isLiked,
  currentTime,
  onNavigate,
  onLike,
  onDelete,
  pillButton,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(discussion.id);
    handleMenuClose();
  };

  const timestamp = discussion.timestamp?.toDate
    ? discussion.timestamp.toDate()
    : new Date();

  return (
    <Card
      key={discussion.id}
      sx={{
        p: 2.5,
        cursor: "pointer",
        border: "1px solid #084518",
        borderRadius: "8px",
        width: "100%",
        bgcolor: "#fff",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(46, 213, 115, 0.1)",
          borderColor: "#148f35ff",
        },
      }}
      onClick={() => onNavigate(`/forum/${discussion.id}`)}
      elevation={0}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Author Avatar */}
          <Avatar
            src={discussion.authorPhoto}
            alt={discussion.authorName}
            sx={{ width: 44, height: 44, bgcolor: "#2ED573" }}
          >
            {getInitials(discussion.authorFirstName)}
          </Avatar>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                mb: 1,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#000" }}
                >
                  {discussion.authorName}
                </Typography>
                {discussion.isAdmin && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      mr: 1,
                      backgroundColor: "#e6f4ea",
                      borderRadius: "4px",
                      px: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#148f35ff",
                        fontWeight: 600,
                        display: "inline-block",
                
                        width: "inherit",
                      }}
                    >
                      Admin
                    </Typography>
                  </Box>
                )}
                <Typography variant="caption" sx={{ color: "#000" }}>
                  {formatTimeAgo(timestamp, currentTime)}
                </Typography>
              </Box>

              {/* More Menu Button */}
              <Box>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{
                    color: "#000",
                    "&:hover": {
                      bgcolor: "rgba(46, 213, 115, 0.08)",
                    },
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <MenuItem onClick={handleDelete} sx={{ color: "#ff4444" }}>
                    <Delete fontSize="small" sx={{ mr: 1 }} />
                    Delete
                  </MenuItem>
                </Menu>
              </Box>
            </Box>

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                mt: 0.5,
                mb: 1,
                fontWeight: 600,
                color: "#000",
                fontSize: "16px",
              }}
            >
              {discussion.title}
            </Typography>

            {/* Content Preview */}
            <Typography
              variant="body2"
              sx={{ color: "#000", mb: 2, lineHeight: 1.5 }}
            >
              {discussion.content.length > 150
                ? `${discussion.content.substring(0, 150)}...`
                : discussion.content}
            </Typography>

            {/* Engagement Stats */}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                size="small"
                startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(discussion);
                }}
                sx={{
                  ...pillButton,
                  padding: "6px 10px",
                  fontSize: 14,
                  color: "#000",
                  "&:hover": {
                    backgroundColor: isLiked
                      ? "#00000011"
                      : "rgba(46,213,115,0.08)",
                  },
                }}
              >
                {discussion.likesCount || 0}
              </Button>
              <Button
                size="small"
                startIcon={<Comment />}
                sx={{
                  ...pillButton,
                  padding: "6px 10px",
                  fontSize: 14,
                  color: "#000",
                  "&:hover": {
                    backgroundColor: isLiked
                      ? "#00000011"
                      : "rgba(46,213,115,0.08)",
                  },
                }}
              >
                {discussion.commentsCount || 0}
              </Button>
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ForumDiscussionCard;
