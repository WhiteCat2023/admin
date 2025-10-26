import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../utils/config/firebase'
import { doc, getDoc, collection, onSnapshot, addDoc, deleteDoc, serverTimestamp, increment, updateDoc, setDoc } from 'firebase/firestore'
import { Box, Typography, Button, Card, CardContent, TextField, Stack, Avatar, IconButton, Paper, Container, Fade, Divider, Menu, MenuItem } from '@mui/material'
import { ArrowBack, Delete, Send, MoreVert, ThumbUp, ThumbUpOffAlt } from '@mui/icons-material'
import { formatTimeAgo, getInitials } from '../../utils/helpers'

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

  // new state for replies
  const [repliesMap, setRepliesMap] = useState({}) // { commentId: { top: [...], children: { parentReplyId: [...] } } }
  // replyTarget tracks where we're replying: { commentId, parentReplyId|null }
  const [replyTarget, setReplyTarget] = useState(null)
  const [replyText, setReplyText] = useState("")

  // new state for likes
  const [likedComments, setLikedComments] = useState({}) // { commentId: true/false }
  // likes for replies keyed by `${commentId}_${replyId}`
  const [likedReplies, setLikedReplies] = useState({}) // { "commentId_replyId": true/false }
  // per-comment replies visibility (Replies button)
  const [repliesVisible, setRepliesVisible] = useState({}) // { commentId: true/false }
  // per-reply (children) visibility keyed by `${commentId}_${replyId}`
  const [replyChildrenVisible, setReplyChildrenVisible] = useState({}) // { "commentId_replyId": true/false }
  
  // helper: total replies count for a comment (top + children)
  const countReplies = (commentId) => {
    const group = repliesMap[commentId];
    if (!group) return 0;
    const topCount = (group.top || []).length;
    const childrenCount = Object.values(group.children || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
    return topCount + childrenCount;
  }

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

  // --- NEW: realtime replies listeners per comment ---
  useEffect(() => {
    if (!id) return;

    if (comments.length === 0) {
      // no comments -> clear replies
      setRepliesMap({});
      return;
    }

    const unsubscribes = [];
    // build listeners for each comment
    comments.forEach((c) => {
      const repliesRef = collection(db, "forums", id, "comments", c.id, "replies");
      const unsub = onSnapshot(repliesRef, (snap) => {
        const fetched = snap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => {
            const ta = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
            const tb = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
            return ta - tb;
          });

        // build top-level replies and children map (group by parentReplyId)
        const top = fetched.filter((r) => !r.parentReplyId);
        const children = fetched.reduce((acc, r) => {
          if (r.parentReplyId) {
            acc[r.parentReplyId] = acc[r.parentReplyId] || [];
            acc[r.parentReplyId].push(r);
          }
          return acc;
        }, {});
        setRepliesMap((prev) => ({ ...prev, [c.id]: { top, children } }));

        // If user is present, check likes for each reply for the current user
        if (user) {
          const checks = fetched.map((r) =>
            getDoc(doc(db, "forums", id, "comments", c.id, "replies", r.id, "likes", user.uid))
              .then((snap) => ({ id: r.id, liked: snap.exists() }))
              .catch(() => ({ id: r.id, liked: false }))
          );
          Promise.all(checks).then((results) => {
            setLikedReplies((prev) => {
              const map = { ...prev };
              results.forEach((r) => {
                map[`${c.id}_${r.id}`] = r.liked;
              });
              return map;
            });
          });
        }
      });

      unsubscribes.push(unsub);
    });

    // cleanup: call all unsubscribe functions
    return () => {
      unsubscribes.forEach((u) => {
        try { u(); } catch (err) { /* ignore */ }
      });
    };
  }, [id, comments, user])

  // when comments change, check whether current user liked each comment
  useEffect(() => {
    if (!user || !id || comments.length === 0) {
      // clear likes when no user or no comments
      setLikedComments({});
      return;
    }

    // parallel checks for each comment's like doc (user-specific)
    const checks = comments.map((c) =>
      getDoc(doc(db, "forums", id, "comments", c.id, "likes", user.uid))
        .then((snap) => ({ id: c.id, liked: snap.exists() }))
        .catch(() => ({ id: c.id, liked: false }))
    );

    Promise.all(checks).then((results) => {
      const map = {};
      results.forEach((r) => { map[r.id] = r.liked; });
      setLikedComments(map);
    });
  }, [comments, user, id]);

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

  // helper to patch likes count for a reply inside repliesMap
  const updateReplyLikesInMap = (commentId, replyId, delta) => {
    setRepliesMap((prev) => {
      const map = { ...prev };
      const group = map[commentId];
      if (!group) return prev;
      const updateInArray = (arr) => arr.map((r) => r.id === replyId ? { ...r, likesCount: Math.max(0, (r.likesCount || 0) + delta) } : r);
      // update top-level if present
      if (group.top) group.top = updateInArray(group.top);
      // update children arrays
      if (group.children) {
        Object.keys(group.children).forEach((parentId) => {
          group.children[parentId] = updateInArray(group.children[parentId]);
        });
      }
      return { ...map, [commentId]: group };
    });
  };

  // NEW: recursive renderer for a reply and its nested children
  const ReplyItem = ({ commentId, reply, depth = 0 }) => {
    const replyKey = `${commentId}_${reply.id}`;
    const children = (repliesMap[commentId]?.children || {})[reply.id] || [];
    const replyTimestamp = reply.timestamp?.toDate ? reply.timestamp.toDate() : new Date();

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
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{reply.authorName}</Typography>
              <Typography variant="caption" sx={{ color: "#999" }}>{formatTimeAgo(replyTimestamp)}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{reply.text}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 1, pl: Math.max(4 + depth * 4, 4), alignItems: "center" }}>
            <Button
              size="small"
              onClick={() => { setReplyTarget({ commentId, parentReplyId: reply.id }); setReplyText(""); }}
              sx={{ textTransform: "none", color: "#2ED573", fontWeight: 600 }}
            >
              Reply
            </Button>

            <Button
              size="small"
              onClick={() => toggleLikeReply(commentId, reply.id)}
              startIcon={ likedReplies[replyKey] ? <ThumbUp fontSize="small" /> : <ThumbUpOffAlt fontSize="small" /> }
              sx={{ textTransform: "none", color: likedReplies[replyKey] ? "#2ED573" : "#999", fontWeight: 600, "&:hover": { bgcolor: "transparent" } }}
            >
              {reply.likesCount || 0}
            </Button>

            {children.length > 0 && (
              <Button
                size="small"
                onClick={() => setReplyChildrenVisible((prev) => ({ ...prev, [replyKey]: !prev[replyKey] }))}
                sx={{ textTransform: "none", color: "#2ED573", fontWeight: 600 }}
              >
                {replyChildrenVisible[replyKey] ? `Hide (${children.length})` : `Replies (${children.length})`}
              </Button>
            )}
          </Box>
        </Card>

        {children.length > 0 && replyChildrenVisible[replyKey] && (
          <Box sx={{ pl: 6, mt: 1 }}>
            {children.map((child) => (
              <ReplyItem key={child.id} commentId={commentId} reply={child} depth={depth + 1} />
            ))}
          </Box>
        )}
      </Box>
    );
  };
  
  // NEW: add a reply to a specific comment (optional parentReplyId)
  const addReply = async (commentId, parentReplyId = null) => {
    if (!replyText.trim() || !user) return
    try {
      await addDoc(collection(db, "forums", id, "comments", commentId, "replies"), {
        text: replyText,
        parentReplyId: parentReplyId || null,
        authorName: `${userDoc?.firstName} ${userDoc?.lastName}`,
        authorFirstName: userDoc?.firstName,
        authorPhoto: userDoc?.profilePic,
        authorId: user?.uid,
        timestamp: serverTimestamp(),
      })
      // optional: increment reply counter on the parent comment
      await updateDoc(doc(db, "forums", id, "comments", commentId), {
        repliesCount: increment(1),
      })
      setReplyText("")
      setReplyTarget(null)
    } catch (error) {
      console.error("Error adding reply:", error)
    }
  }

  // NEW: toggle like for a reply (optimistic UI -> then Firestore; revert on error)
  const toggleLikeReply = async (commentId, replyId) => {
    if (!user) return;
    const key = `${commentId}_${replyId}`;
    const currentlyLiked = !!likedReplies[key];

    // optimistic UI update
    setLikedReplies((prev) => ({ ...prev, [key]: !currentlyLiked }));
    updateReplyLikesInMap(commentId, replyId, currentlyLiked ? -1 : 1);

    try {
      const likeRef = doc(db, "forums", id, "comments", commentId, "replies", replyId, "likes", user.uid);
      const replyRef = doc(db, "forums", id, "comments", commentId, "replies", replyId);

      if (currentlyLiked) {
        // user is unliking
        await deleteDoc(likeRef);
        await updateDoc(replyRef, { likesCount: increment(-1) });
      } else {
        // user is liking
        await setDoc(likeRef, { uid: user.uid, timestamp: serverTimestamp() });
        await updateDoc(replyRef, { likesCount: increment(1) });
      }
    } catch (error) {
      // revert optimistic UI on error
      setLikedReplies((prev) => ({ ...prev, [key]: currentlyLiked }));
      updateReplyLikesInMap(commentId, replyId, currentlyLiked ? 1 : -1);
      console.error("Error toggling reply like:", error);
    }
  };

  // NEW: toggle like for a comment (optimistic UI -> then Firestore; revert on error)
  const toggleLike = async (commentId) => {
    if (!user) return;
    const currentlyLiked = !!likedComments[commentId];

    // optimistic UI update
    setLikedComments((prev) => ({ ...prev, [commentId]: !currentlyLiked }));
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likesCount: Math.max(0, (c.likesCount || 0) + (currentlyLiked ? -1 : 1)) } : c
      )
    );

    try {
      const likeRef = doc(db, "forums", id, "comments", commentId, "likes", user.uid);
      const commentRef = doc(db, "forums", id, "comments", commentId);

      if (currentlyLiked) {
        // unlike
        await deleteDoc(likeRef);
        await updateDoc(commentRef, { likesCount: increment(-1) });
      } else {
        // like
        await setDoc(likeRef, { uid: user.uid, timestamp: serverTimestamp() });
        await updateDoc(commentRef, { likesCount: increment(1) });
      }
    } catch (error) {
      // revert optimistic UI on error
      setLikedComments((prev) => ({ ...prev, [commentId]: currentlyLiked }));
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likesCount: Math.max(0, (c.likesCount || 0) + (currentlyLiked ? 1 : -1)) } : c
        )
      );
      console.error("Error toggling like:", error);
    }
  };
  
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

                        {/* Replies toggle button (per comment) */}
                        {countReplies(comment.id) > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Button
                              size="small"
                              onClick={() =>
                                setRepliesVisible((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))
                              }
                              sx={{ textTransform: "none", color: "#2ED573", fontWeight: 600, mb: 1 }}
                            >
                              {repliesVisible[comment.id] ? `Hide Replies (${countReplies(comment.id)})` : `Replies (${countReplies(comment.id)})`}
                            </Button>
                          </Box>
                        )}

                        {/* Top-level replies - shown when toggled visible for this comment */}
                        {repliesVisible[comment.id] && repliesMap[comment.id] && Array.isArray(repliesMap[comment.id].top) && (
                          <Box sx={{ mt: 2, pl: 6 }}>
                            {repliesMap[comment.id].top.map((reply) => (
                              <ReplyItem key={reply.id} commentId={comment.id} reply={reply} depth={0} />
                            ))}
                          </Box>
                        )}

                        {/* actions row: reply to comment and like */}
                        <Box sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
                          <Button
                            size="small"
                            onClick={() => {
                              setReplyTarget((prev) => (prev && prev.commentId === comment.id && !prev.parentReplyId ? null : { commentId: comment.id, parentReplyId: null }))
                              setReplyText("")
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

                          {/* NEW: Like button */}
                          <Button
                            size="small"
                            onClick={() => toggleLike(comment.id)}
                            startIcon={ likedComments[comment.id] ? <ThumbUp fontSize="small" /> : <ThumbUpOffAlt fontSize="small" /> }
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
 
                        {/* inline reply editor for comment-level or reply-level targets */}
                        {replyTarget && replyTarget.commentId === comment.id && (
                          <Box sx={{ mt: 1, pl: 0 }}>
                            <TextField
                              fullWidth
                              placeholder={replyTarget.parentReplyId ? "Write a reply to reply..." : "Write a reply..."}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
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
                                onClick={() => addReply(comment.id, replyTarget.parentReplyId)}
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
                                onClick={() => { setReplyTarget(null); setReplyText("") }}
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