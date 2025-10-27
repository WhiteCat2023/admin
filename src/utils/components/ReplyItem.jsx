import React from 'react'
import { Box, Card, Avatar, Typography, Button, TextField } from '@mui/material'
import { ThumbUp, ThumbUpOffAlt, Send } from '@mui/icons-material'
import { formatTimeAgo, getInitials } from '../helpers'

function ReplyItem({
  commentId,
  reply,
  depth = 0,
  likedReplies,
  replyChildrenVisible,
  repliesMap,
  replyTarget,
  replyText,
  onToggleLike,
  onSetReplyChildrenVisible,
  onSetReplyTarget,
  onReplyTextChange,
  onAddReply,
}) {
  const replyKey = `${commentId}_${reply.id}`
  const children = (repliesMap[commentId]?.children || {})[reply.id] || []
  const replyTimestamp = reply.timestamp?.toDate ? reply.timestamp.toDate() : new Date()
  const isReplyTargetActive = replyTarget && replyTarget.commentId === commentId && replyTarget.parentReplyId === reply.id

  // Auto-expand children by default
  const areChildrenVisible = replyChildrenVisible[replyKey] !== false

  return (
    <Box key={reply.id} sx={{ mb: 1 }}>
      <Card
        sx={{
          p: 1.25,
          borderRadius: "6px",
          border: "1px solid #f0f0f0",
          bgcolor: depth === 0 ? "#fafafa" : "#fff",
        }}
        elevation={0}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Avatar
            src={reply.authorPhoto}
            alt={reply.authorName}
            sx={{ width: Math.max(28, 32 - depth * 2), height: Math.max(28, 32 - depth * 2), bgcolor: "#2ED573" }}
          >
            {getInitials(reply.authorFirstName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {reply.authorName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#999" }}>
              {formatTimeAgo(replyTimestamp)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {reply.text}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mt: 1, pl: Math.max(4 + depth * 4, 4), alignItems: "center" }}>
          <Button
            size="small"
            onClick={() => onSetReplyTarget({ commentId, parentReplyId: reply.id })}
            sx={{ textTransform: "none", color: "#2ED573", fontWeight: 600 }}
          >
            Reply
          </Button>

          <Button
            size="small"
            onClick={() => onToggleLike(commentId, reply.id)}
            startIcon={likedReplies[replyKey] ? <ThumbUp fontSize="small" /> : <ThumbUpOffAlt fontSize="small" />}
            sx={{ textTransform: "none", color: likedReplies[replyKey] ? "#2ED573" : "#999", fontWeight: 600, "&:hover": { bgcolor: "transparent" } }}
          >
            {reply.likesCount || 0}
          </Button>

          {children.length > 0 && (
            <Button
              size="small"
              onClick={() => onSetReplyChildrenVisible((prev) => ({ ...prev, [replyKey]: !prev[replyKey] }))}
              sx={{ textTransform: "none", color: "#2ED573", fontWeight: 600 }}
            >
              {areChildrenVisible ? `Hide (${children.length})` : `Replies (${children.length})`}
            </Button>
          )}
        </Box>

        {isReplyTargetActive && (
          <Box sx={{ mt: 2, pl: Math.max(4 + depth * 4, 4) }}>
            <TextField
              fullWidth
              placeholder="Write a reply to reply..."
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
                onClick={() => onAddReply(commentId, reply.id)}
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
                  onSetReplyTarget(null)
                  onReplyTextChange("")
                }}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Card>

      {children.length > 0 && areChildrenVisible && (
        <Box sx={{ pl: 6, mt: 1 }}>
          {children.map((child) => (
            <ReplyItem
              key={child.id}
              commentId={commentId}
              reply={child}
              depth={depth + 1}
              likedReplies={likedReplies}
              replyChildrenVisible={replyChildrenVisible}
              repliesMap={repliesMap}
              replyTarget={replyTarget}
              replyText={replyText}
              onToggleLike={onToggleLike}
              onSetReplyChildrenVisible={onSetReplyChildrenVisible}
              onSetReplyTarget={onSetReplyTarget}
              onReplyTextChange={onReplyTextChange}
              onAddReply={onAddReply}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ReplyItem
