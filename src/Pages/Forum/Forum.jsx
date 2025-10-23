import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../utils/config/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  Card,
  CardContent,
  Grid,
  IconButton,
  Avatar,
  Container,
  Paper,
  InputAdornment,
  Stack,
  Fade,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Sort,
  SortByAlpha,
  Edit,
  Delete,
  Favorite,
  FavoriteBorder,
  Comment,
  Search as SearchIcon,
  MoreVert,
  FilterList, // <-- added
} from "@mui/icons-material";
import { getInitials, formatTimeAgo } from "../../utils/helpers";

function Forum() {
  const { user, userDoc } = useAuth();
  const navigate = useNavigate();
  const isWeb = true;
  const [showContent, setShowContent] = useState(false);

  // States
  const [modalVisible, setModalVisible] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    description: "",
  }); // <-- fixed: object
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");
  const [userLikes, setUserLikes] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Shared button styles for the new pill UI
  const pillButton = {
    borderRadius: "5px", // slightly larger pill radius like picture
    textTransform: "none",
    padding: "8px 16px", // comfortable padding
    // border: "1px solid #084518",
    color: "#084518",
    backgroundColor: "transparent",
    fontFamily: '"Poppins", sans-serif',
    minHeight: 40,
    "& .MuiButton-startIcon": {
      // ensure icon matches text color
      color: "inherit",
    },
    "&:hover": {
      backgroundColor: "rgba(46,213,115,0.06)",
    },
  };

  const pillButtonFilled = {
    ...pillButton,
    backgroundColor: "#34A853",
    color: "#fff",
    minWidth: 96,                      // make the filled pill slightly wider like picture
    boxShadow: "none",
    "&:hover": { backgroundColor: "#26c061" },
  };

  const pillIconButton = {
    borderRadius: "6px", // small rounded square
    border: "1px solid #084518",
    color: "#084518",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"Poppins", sans-serif',
    backgroundColor: "#fff",
    "&:hover": { backgroundColor: "rgba(46,213,115,0.06)" },
  };

  // Show content on mount
  useEffect(() => {
    setShowContent(true);
  }, []);

  // Update current time every minute (for "time ago")
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Load cached likes
  useEffect(() => {
    const loadCachedLikes = async () => {
      try {
        const cached = localStorage.getItem(`userLikes_${user?.uid}`);
        if (cached) setUserLikes(JSON.parse(cached));
      } catch (e) {
        console.error("Error loading cached likes:", e);
      }
    };
    if (user) loadCachedLikes();
  }, [user]);

  // Realtime discussions
  useEffect(() => {
    const q = collection(db, "forums");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setDiscussions(fetched);
    });
    return () => unsubscribe();
  }, []);

  // Listen for user likes
  useEffect(() => {
    if (!user) return;
    const likesRef = collection(db, "userLikes", user.uid, "forums");
    const unsubscribe = onSnapshot(likesRef, (snapshot) => {
      const likedPosts = {};
      snapshot.forEach((docSnap) => {
        likedPosts[docSnap.id] = true;
      });
      setUserLikes(likedPosts);
      saveLikesToCache(likedPosts);
    });
    return () => unsubscribe();
  }, [user]);

  // Compute filtered + sorted discussions whenever dependencies change
  useEffect(() => {
    const computeFiltered = () => {
      let list = Array.isArray(discussions) ? [...discussions] : [];

      // Filter by search query (title OR content)
      const q = (searchQuery || "").trim().toLowerCase();
      if (q.length > 0) {
        list = list.filter((item) => {
          const title = (item.title || "").toString().toLowerCase();
          const content = (item.content || "").toString().toLowerCase();
          return title.includes(q) || content.includes(q);
        });
      }

      // Apply filter options
      if (filter === "newest") {
        list.sort((a, b) => {
          const ta = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
          const tb = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
          return tb - ta;
        });
      } else if (filter === "ongoing") {
        list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
      }

      // sortOrder toggle (if asc reverse)
      if (sortOrder === "asc") list.reverse();
      return list;
    };

    setFilteredDiscussions(computeFiltered());
  }, [discussions, searchQuery, filter, sortOrder]);

  const saveLikesToCache = async (likes) => {
    try {
      localStorage.setItem(`userLikes_${user?.uid}`, JSON.stringify(likes));
    } catch (e) {
      console.error("Error saving likes:", e);
    }
  };

  // Save discussion (new or edit)
  const saveDiscussion = async () => {
    console.log(userDoc);
    if (
      !newDiscussion.title ||
      !newDiscussion.title.trim() ||
      !newDiscussion.description ||
      !newDiscussion.description.trim()
    ) {
      // Could show an error toast, highlight fields, etc.
      return;
    }

    if (editingId) {
      await updateDoc(doc(db, "forums", editingId), {
        title: newDiscussion.title,
        content: newDiscussion.description,
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, "forums"), {
        title: newDiscussion.title,
        content: newDiscussion.description,
        likesCount: 0,
        commentsCount: 0,
        authorName: `${userDoc?.firstName}  ${userDoc?.lastName}`,
        authorFirstName: userDoc?.firstName,
        authorPhoto: userDoc?.profilePic,
        authorId: user?.uid,
        timestamp: serverTimestamp(),
      });
    }

    setNewDiscussion({ title: "", description: "" });
    setModalVisible(false);
  };

  const deleteDiscussion = async (forumId) => {
    await deleteDoc(doc(db, "forums", forumId));
  };

  // Toggle like
  const toggleLike = async (forum) => {
    if (!user) return;
    const forumRef = doc(db, "forums", forum.id);
    const likeRef = doc(db, "forums", forum.id, "likes", user.uid);
    const userLikeRef = doc(db, "userLikes", user.uid, "forums", forum.id);

    const likeDoc = await getDoc(likeRef);
    if (likeDoc.exists()) {
      await deleteDoc(likeRef);
      await deleteDoc(userLikeRef);
      await updateDoc(forumRef, { likesCount: increment(-1) });
      const updatedLikes = { ...userLikes };
      delete updatedLikes[forum.id];
      setUserLikes(updatedLikes);
      saveLikesToCache(updatedLikes);
    } else {
      await setDoc(likeRef, { userId: user.uid });
      await setDoc(userLikeRef, { forumId: forum.id });
      await updateDoc(forumRef, { likesCount: increment(1) });
      const updatedLikes = { ...userLikes, [forum.id]: true };
      setUserLikes(updatedLikes);
      saveLikesToCache(updatedLikes);
    }
  };

  const handleMenuOpen = (e, postId) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const handleMenuDelete = async (e) => {
    e.stopPropagation()
    if (selectedPostId) {
      await deleteDiscussion(selectedPostId);
    }
    handleMenuClose();
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6">Please log in to access the forum.</Typography>
      </Container>
    );
  }

  return (
    <Fade in={showContent} timeout={600}>
      <Box sx={{ flexGrow: 1, p: 3, minHeight: "100vh" }}>
        {/* Header with Title and Search */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mb: 3,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Forum
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              
              width: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
                borderRadius: "15px",
                "&.Mui-focused fieldset": {
                  borderColor: "#084518",
                },
                "&:hover fieldset": {
                  borderColor: "#084518",
                },
              },
            }}
          />
        </Box>
        <Box
          sx={{
            backgroundColor: "#fff",
            padding: 2,
            borderRadius: 3,
          }}
        >
          {/* Filter and Sort Controls + New Discussion Button */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              alignItems: "center",
              justifyContent: "flex-end", // split left group and right filter button
            }}
          >
            <Button
              startIcon={<Add />}
              onClick={() => {
                setEditingId(null);
                setNewDiscussion({ title: "", description: "" });
                setModalVisible(true);
              }}
              sx={{
                borderRadius: "5px", // slightly larger pill radius like picture
                textTransform: "none",
                fontWeight: 600,
                padding: "12px 16px", // comfortable padding
                border: "1px solid #084518",
                color: "#084518",
                backgroundColor: "transparent",
                fontFamily: '"Poppins", sans-serif',
                minHeight: 40,
                "& .MuiButton-startIcon": {
                  // ensure icon matches text color
                  color: "inherit",
                },
                "&:hover": {
                  backgroundColor: "rgba(46,213,115,0.06)",
                },
              }}
            >
              Add Discussion
            </Button>
            <Box
              sx={{
                padding: 0.5,
                display: "flex",
                gap: 1,
                border: "1px solid #084518",
                borderRadius: "6px",
              }}
            >
              <Button
                onClick={() => setFilter("newest")}
                sx={filter === "newest" ? pillButtonFilled : pillButton}
              >
                Newest
              </Button>

              <Button
                onClick={() => setFilter("ongoing")}
                sx={filter === "ongoing" ? pillButtonFilled : pillButton}
              >
                Ongoing
              </Button>
            </Box>

            <IconButton
              size="small"
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              sx={pillIconButton}
              aria-label="filter"
            >
              <FilterList />
            </IconButton>
          </Box>

          {/* Discussions List */}
          <Box sx={{ mb: 4 }}>
            {filteredDiscussions.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filteredDiscussions.map((discussion) => {
                  const timestamp = discussion.timestamp?.toDate
                    ? discussion.timestamp.toDate()
                    : new Date();
                  const isLiked = userLikes[discussion.id];

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
                      onClick={() => navigate(`/forum/${discussion.id}`)}
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
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#000" }}
                                >
                                  {formatTimeAgo(timestamp, currentTime)}
                                </Typography>
                              </Box>

                              {/* More Menu Button */}
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) =>
                                    handleMenuOpen(e, discussion.id)
                                  }
                                  sx={{
                                    color: "#000  ",
                                    "&:hover": {
                                      bgcolor: "rgba(46, 213, 115, 0.08)",
                                    },
                                  }}
                                >
                                  <MoreVert fontSize="small" />
                                </IconButton>
                                <Menu
                                  anchorEl={anchorEl}
                                  open={
                                    Boolean(anchorEl) &&
                                    selectedPostId === discussion.id
                                  }
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
                                  <MenuItem
                                    onClick={handleMenuDelete}
                                    sx={{ color: "#ff4444" }}
                                  >
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
                                startIcon={
                                  isLiked ? <Favorite /> : <FavoriteBorder />
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLike(discussion);
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
                })}
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
        </Box>

        {/* New/Edit Discussion Modal */}
        <Modal open={modalVisible} onClose={() => setModalVisible(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 500 },
              bgcolor: "background.paper",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
              p: 4,
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#1a1a1a",
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {editingId ? "Edit Discussion" : "New Discussion"}
            </Typography>

            <TextField
              fullWidth
              label="Title"
              value={newDiscussion.title}
              onChange={(e) =>
                setNewDiscussion({
                  ...newDiscussion,
                  title: e.target.value,
                })
              }
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&.Mui-focused fieldset": {
                    borderColor: "#34A853",
                    borderWidth: "2px",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={newDiscussion.description}
              onChange={(e) =>
                setNewDiscussion({
                  ...newDiscussion,
                  description: e.target.value,
                })
              }
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&.Mui-focused fieldset": {
                    borderColor: "#2ED573",
                    borderWidth: "2px",
                  },
                },
              }}
            />

            <Stack direction="row" spacing={2}>
              <Button onClick={saveDiscussion} sx={pillButtonFilled}>
                {editingId ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setModalVisible(false)} sx={pillButton}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </Fade>
  );
}

export default Forum;
