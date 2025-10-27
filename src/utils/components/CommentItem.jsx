import React from 'react'
import { Card, Box, Avatar, Typography, IconButton, Menu, MenuItem, Button, TextField } from '@mui/material'
import { Delete, MoreVert, ThumbUp, ThumbUpOffAlt, Send } from '@mui/icons-material'
import { formatTimeAgo, getInitials } from '../helpers'
import RepliesSection from './RepliesSection'

function CommentItem({
  comment,
  forumId,
  repliesMap,
  replyTarget,
  replyText,
  likedComments,
  likedReplies,
  repliesVisible,
  replyChildrenVisible,
  countReplies,
  onReplyTargetChange,
  onReplyTextChange,
  onToggleLike,
  onToggleLikeReply,
  onAddReply,
  onSetRepliesVisible,
  onSetReplyChildrenVisible,
  onMenuOpen,
  menuAnchor,
  onMenuClose,
  selectedCommentId,
  onDelete,
}) {
  const commentTimestamp = comment.timestamp?.toDate ? comment.timestamp.toDate() : new Date()
  const isReplyTargetActive = replyTarget && replyTarget.commentId === comment.id && !replyTarget.parentReplyId

  return (
    <Card
      key={comment.id}
      sx={{
        p: 2.5,
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        bgcolor: "#fff",
      }}
      elevation={0}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        <Avatar
          src={comment.authorPhoto}
          alt={comment.authorName}
          sx={{ width: 40, height: 40, bgcolor: "#2ED573" }}
        >
          {getInitials(comment.authorFirstName)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#1a1a1a" }}
              >
                {comment.authorName}
              </Typography>
              <Typography variant="caption" sx={{ color: "#999" }}>
                {formatTimeAgo(commentTimestamp)}
              </Typography>
            </Box>

            <Box>
              <IconButton
                size="small"
                onClick={(e) => onMenuOpen(e, comment.id)}
                sx={{
                  color: "#999",
                  "&:hover": { bgcolor: "rgba(46, 213, 115, 0.08)" },
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor) && selectedCommentId === comment.id}
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
            variant="body2"
            sx={{
              mt: 1,
              whiteSpace: "pre-wrap",
              color: "#333",
              lineHeight: 1.5,
            }}
          >
            {comment.text}
          </Typography>

          <RepliesSection
            commentId={comment.id}
            repliesMap={repliesMap}
            repliesVisible={repliesVisible}
            replyChildrenVisible={replyChildrenVisible}
            likedReplies={likedReplies}
            replyTarget={replyTarget}
            replyText={replyText}
            countReplies={countReplies}
            onSetRepliesVisible={onSetRepliesVisible}
            onSetReplyChildrenVisible={onSetReplyChildrenVisible}
            onToggleLike={onToggleLikeReply}
            onSetReplyTarget={onReplyTargetChange}
            onReplyTextChange={onReplyTextChange}
            onAddReply={onAddReply}
          />

          <Box sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
            <Button
              size="small"
              onClick={() => {
                onReplyTargetChange((prev) =>
                  prev && prev.commentId === comment.id && !prev.parentReplyId
                    ? null
                    : { commentId: comment.id, parentReplyId: null }
                )
                onReplyTextChange("")
              }}
              sx={{
                textTransform: "none",
                color: "#2ED573",
                fontWeight: 600,
                "&:hover": { bgcolor: "transparent" },
              }}
            >
              Reply
            </Button>

            <Button
              size="small"
              onClick={() => onToggleLike(comment.id)}
              startIcon={likedComments[comment.id] ? <ThumbUp fontSize="small" /> : <ThumbUpOffAlt fontSize="small" />}
              sx={{
                textTransform: "none",
                color: likedComments[comment.id] ? "#2ED573" : "#999",
                fontWeight: 600,
                "&:hover": { bgcolor: "transparent" },
              }}
            >
              {comment.likesCount || 0}
            </Button>
          </Box>

          {isReplyTargetActive && (
            <Box sx={{ mt: 1, pl: 0 }}>
              <TextField
                fullWidth
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                multiline
                rows={2}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    "& fieldset": { borderColor: "#e0e0e0" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2ED573",
                      borderWidth: "2px",
                    },
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  endIcon={<Send />}
                  onClick={() => onAddReply(comment.id, null)}
                  disabled={!replyText.trim()}
                  sx={{
                    backgroundColor: "#2ED573",
                    color: "#fff",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "6px",
                    "&:hover": { backgroundColor: "#26c061" },
                    "&:disabled": { bgcolor: "#ddd", color: "#999" },
                  }}
                >
                  Post Reply
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    onReplyTargetChange(null)
                    onReplyTextChange("")
                  }}
                  sx={{ textTransform: "none" }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  )
}

export default CommentItem
