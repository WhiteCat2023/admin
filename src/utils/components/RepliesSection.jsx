import React from 'react'
import { Box, Button } from '@mui/material'
import ReplyItem from './ReplyItem'

function RepliesSection({
  commentId,
  repliesMap,
  repliesVisible,
  replyChildrenVisible,
  likedReplies,
  replyTarget,
  replyText,
  countReplies,
  onSetRepliesVisible,
  onSetReplyChildrenVisible,
  onToggleLike,
  onSetReplyTarget,
  onReplyTextChange,
  onAddReply,
}) {
  const replyCount = countReplies(commentId)

  if (replyCount === 0) return null

  // Auto-expand replies by default
  const isVisible = repliesVisible[commentId] !== false

  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        onClick={() => onSetRepliesVisible((prev) => ({ ...prev, [commentId]: !prev[commentId] }))}
        sx={{ textTransform: "none", color: "#2ED573", fontWeight: 600, mb: 1 }}
      >
        {isVisible ? `Hide Replies (${replyCount})` : `Replies (${replyCount})`}
      </Button>

      {isVisible && repliesMap[commentId] && Array.isArray(repliesMap[commentId].top) && (
        <Box sx={{ mt: 2, pl: 6 }}>
          {repliesMap[commentId].top.map((reply) => (
            <ReplyItem
              key={reply.id}
              commentId={commentId}
              reply={reply}
              depth={0}
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

export default RepliesSection
