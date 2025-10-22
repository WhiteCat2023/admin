import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/config/firebase'
import { doc, getDoc, collection, onSnapshot, addDoc, deleteDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore'
import { Box, Typography, Button, Card, CardContent, TextField, Stack, Avatar, IconButton, Paper, Container, Fade, Divider, Menu, MenuItem } from '@mui/material'
import { ArrowBack, Delete, Send, MoreVert } from '@mui/icons-material'
import { formatTimeAgo, getInitials } from '../utils/helpers'

function ForumPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userDoc } = useAuth()
  const [showContent, setShowContent] = useState(false)
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [postMenuAnchor, setPostMenuAnchor] = useState(null)
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null)
  const [selectedCommentId, setSelectedCommentId] = useState(null)

  useEffect(() => {
    setShowContent(true)
  }, [])

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, "forums", id))
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() })
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching post:", error)
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  // Real-time comments listener
  useEffect(() => {
    if (!id) return
    const commentsRef = collection(db, "forums", id, "comments")
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const fetchedComments = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setComments(fetchedComments.sort((a, b) => {
        const ta = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0
        const tb = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0
        return ta - tb
      }))
    })
    return () => unsubscribe()
  }, [id])

  const addComment = async () => {
    if (!newComment.trim() || !user) return

    try {
      await addDoc(collection(db, "forums", id, "comments"), {
        text: newComment,
        authorName: `${userDoc?.firstName} ${userDoc?.lastName}`,
        authorFirstName: userDoc?.firstName,
        authorPhoto: userDoc?.profilePic,
        authorId: user?.uid,
        timestamp: serverTimestamp(),
      })
      await updateDoc(doc(db, "forums", id), {
        commentsCount: increment(1),
      })
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, "forums", id, "comments", commentId))
      await updateDoc(doc(db, "forums", id), {
        commentsCount: increment(-1),
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handlePostMenuOpen = (e) => {
    e.stopPropagation()
    setPostMenuAnchor(e.currentTarget)
  }

  const handlePostMenuClose = () => {
    setPostMenuAnchor(null)
  }

  const handleDeletePost = async () => {
    try {
      await deleteDoc(doc(db, "forums", id))
      handlePostMenuClose()
      navigate("/forum")
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const handleCommentMenuOpen = (e, commentId) => {
    e.stopPropagation()
    setCommentMenuAnchor(e.currentTarget)
    setSelectedCommentId(commentId)
  }

  const handleCommentMenuClose = () => {
    setCommentMenuAnchor(null)
    setSelectedCommentId(null)
  }

  const handleDeleteComment = async () => {
    if (selectedCommentId) {
      await deleteComment(selectedCommentId)
    }
    handleCommentMenuClose()
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  if (!post) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6">Post not found</Typography>
        <Button onClick={() => navigate("/forum")} sx={{ mt: 2 }}>
          Back to Forum
        </Button>
      </Container>
    )
  }

  const postTimestamp = post.timestamp?.toDate ? post.timestamp.toDate() : new Date()

  return (
    <Fade in={showContent} timeout={600}>
      <Box sx={{ flexGrow: 1, p: 3, minHeight: "100vh" }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/forum")}
          sx={{
            mb: 3,
            color: "#2ED573",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(46, 213, 115, 0.08)" },
          }}
        >
          Back to Forum
        </Button>

        {/* Post Card */}
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
                />
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

              {/* Post Menu Button */}
              <Box>
                <IconButton
                  size="small"
                  onClick={handlePostMenuOpen}
                  sx={{
                    color: "#999",
                    "&:hover": { bgcolor: "rgba(46, 213, 115, 0.08)" },
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={postMenuAnchor}
                  open={Boolean(postMenuAnchor)}
                  onClose={handlePostMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem
                    onClick={handleDeletePost}
                    sx={{ color: "#ff4444" }}
                  >
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
                <strong style={{ color: "#1a1a1a" }}>Likes:</strong>{" "}
                {post.likesCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                <strong style={{ color: "#1a1a1a" }}>Comments:</strong>{" "}
                {post.commentsCount || 0}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Paper
          sx={{
            p: 3,
            borderRadius: "8px",
            mb: 3,
            bgcolor: "#fff",
            border: "1px solid #e0e0e0",
          }}
          elevation={0}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 3, color: "#1a1a1a" }}
          >
            Comments
          </Typography>

          {/* Add Comment Form */}
          {user && (
            <Box
              sx={{
                mb: 3,
                p: 2.5,
                bgcolor: "#fafafa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <TextField
                fullWidth
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                multiline
                rows={2}
                sx={{
                  mb: 1.5,
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
              <Button
                variant="contained"
                endIcon={<Send />}
                onClick={addComment}
                disabled={!newComment.trim()}
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
                Post Comment
              </Button>
            </Box>
          )}

          {!user && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
              }}
              elevation={0}
            >
              <Typography variant="body2" sx={{ color: "#856404" }}>
                Please log in to comment
              </Typography>
            </Paper>
          )}

          {/* Comments List */}
          <Stack spacing={2}>
            {comments.length > 0 ? (
              comments.map((comment) => {
                const commentTimestamp = comment.timestamp?.toDate
                  ? comment.timestamp.toDate()
                  : new Date();
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
                            <Typography
                              variant="caption"
                              sx={{ color: "#999" }}
                            >
                              {formatTimeAgo(commentTimestamp)}
                            </Typography>
                          </Box>

                          {/* Comment Menu Button */}
                          <Box>
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleCommentMenuOpen(e, comment.id)
                              }
                              sx={{
                                color: "#999",
                                "&:hover": {
                                  bgcolor: "rgba(46, 213, 115, 0.08)",
                                },
                              }}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                            <Menu
                              anchorEl={commentMenuAnchor}
                              open={
                                Boolean(commentMenuAnchor) &&
                                selectedCommentId === comment.id
                              }
                              onClose={handleCommentMenuClose}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                            >
                              <MenuItem
                                onClick={handleDeleteComment}
                                sx={{ color: "#ff4444" }}
                              >
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
                      </Box>
                    </Box>
                  </Card>
                );
              })
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "#999", textAlign: "center", py: 2 }}
              >
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    </Fade>
  );
}

export default ForumPost