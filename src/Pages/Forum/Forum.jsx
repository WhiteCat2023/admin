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
import { Box, Container, Fade } from "@mui/material";
import Swal from "sweetalert2";
import ForumHeader from "../../utils/components/ForumHeader";
import ForumControls from "../../utils/components/ForumControls";
import ForumDiscussionsList from "../../utils/components/ForumDiscussionsList";
import ForumModal from "../../utils/components/ForumModal";

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
        isAdmin: true
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

  const handleNewDiscussion = () => {
    setEditingId(null);
    setNewDiscussion({ title: "", description: "" });
    setModalVisible(true);
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
        <ForumHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <Box
          sx={{
            backgroundColor: "#fff",
            padding: 2,
            borderRadius: 3,
          }}
        >
          <ForumControls
            filter={filter}
            onFilterChange={setFilter}
            sortOrder={sortOrder}
            onSortToggle={() =>
              setSortOrder(sortOrder === "desc" ? "asc" : "desc")
            }
            onNewDiscussion={handleNewDiscussion}
            pillButton={pillButton}
            pillButtonFilled={pillButtonFilled}
            pillIconButton={pillIconButton}
          />

          <ForumDiscussionsList
            discussions={filteredDiscussions}
            userLikes={userLikes}
            currentTime={currentTime}
            onNavigate={navigate}
            onLike={toggleLike}
            onDelete={deleteDiscussion}
            pillButton={pillButton}
          />
        </Box>

        <ForumModal
          open={modalVisible}
          onClose={() => setModalVisible(false)}
          title={editingId ? "Edit Discussion" : "New Discussion"}
          discussion={newDiscussion}
          onTitleChange={(title) =>
            setNewDiscussion({ ...newDiscussion, title })
          }
          onDescriptionChange={(description) =>
            setNewDiscussion({ ...newDiscussion, description })
          }
          onSave={saveDiscussion}
          pillButtonFilled={pillButtonFilled}
          pillButton={pillButton}
        />
      </Box>
    </Fade>
  );
}

export default Forum;
