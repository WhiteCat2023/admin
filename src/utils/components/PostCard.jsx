import React from 'react'
import { Card, CardContent, Box, Typography, Avatar, IconButton, Menu, MenuItem, Stack, Divider } from '@mui/material'
import { Delete, MoreVert } from '@mui/icons-material'
import { formatTimeAgo, getInitials } from '../helpers'

function PostCard({ post, onMenuOpen, menuAnchor, onMenuClose, onDelete }) {
  const postTimestamp = post.timestamp?.toDate ? post.timestamp.toDate() : new Date()

  return (
    <Card
      sx={{
        p: 3,
        mb: 4,
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        bgcolor: "#fff",
      }}
      elevation={0}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Avatar
              src={post.authorPhoto}
              alt={post.authorName}
              sx={{ width: 52, height: 52, bgcolor: "#2ED573" }}
            >
              {getInitials(post.authorName)}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#1a1a1a" }}
              >
                {post.authorName}
              </Typography>
              <Typography variant="caption" sx={{ color: "#999" }}>
                {formatTimeAgo(postTimestamp)}
              </Typography>
            </Box>
          </Box>

          <Box>
            <IconButton
              size="small"
              onClick={onMenuOpen}
              sx={{
                color: "#999",
                "&:hover": { bgcolor: "rgba(46, 213, 115, 0.08)" },
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={onMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={onDelete} sx={{ color: "#ff4444" }}>
                <Delete fontSize="small" sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 2, color: "#1a1a1a", lineHeight: 1.4 }}
        >
          {post.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 3,
            whiteSpace: "pre-wrap",
            color: "#333",
            lineHeight: 1.6,
          }}
        >
          {post.content}
        </Typography>

        <Divider sx={{ my: 2, borderColor: "#e0e0e0" }} />

        <Stack direction="row" spacing={3}>
          <Typography variant="body2" sx={{ color: "#666" }}>
            <strong style={{ color: "#1a1a1a" }}>Likes:</strong> {post.likesCount || 0}
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            <strong style={{ color: "#1a1a1a" }}>Comments:</strong> {post.commentsCount || 0}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default PostCard
