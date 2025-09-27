import {
  Box,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Badge,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { messaging } from "../config/firebase";
import { onMessage } from "firebase/messaging";
import { useEffect, useState, useRef, useCallback } from "react";
import { format } from "date-fns";

const PushNotificationButton = ({
  reportNotifs,
  onSelectReport,
  setSnackbarMessage,
  setSnackbarOpen,
}) => {
  const [pushNotifications, setPushNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Unread
  const [anchorEl, setAnchorEl] = useState(null);
  const notificationButtonRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = (id) => {
    // Update push notifications
    setPushNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    // Report notifs are managed in parent, but since passed as prop, we can't mutate; assume parent handles if needed
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleItemClick = (notification) => {
    const report = notification.report || notification;
    if (onSelectReport && report) {
      onSelectReport(report);
    }
    handleMarkAsRead(notification.id);
    handleClose();
  };

  // Merge push and report notifications
  const allNotifications = [...pushNotifications, ...reportNotifs];

  // Filter based on tab
  const displayedNotifications = tabValue === 0
    ? allNotifications
    : allNotifications.filter((n) => !n.read);

  // Compute total unread (push + report)
  useEffect(() => {
    const totalUnread = allNotifications.filter((n) => !n.read).length;
    setUnreadCount(totalUnread);
  }, [allNotifications]);

  // Service Worker registration
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

  // Firebase onMessage listener
  useEffect(() => {
    if (Notification.permission === "granted" && messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        const newNotif = {
          id: Date.now(),
          title: payload.notification?.title || "New Notification",
          body: payload.notification?.body || "New notification received",
          timestamp: new Date(),
          read: false,
          type: "push",
          report: payload.data?.report ? JSON.parse(payload.data.report) : null,
        };
        setPushNotifications((prev) => [newNotif, ...prev]);
        // Open popover
        setAnchorEl(notificationButtonRef.current);
        // Show snackbar via props
        const message = payload.notification?.body || "New notification received";
        setSnackbarMessage(message);
        setSnackbarOpen(true);
        // Browser notification
        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title || "New Notification", {
            body: payload.notification?.body,
            icon: "/vite.svg",
          });
        }
      });
      return unsubscribe;
    }
  }, [messaging, setSnackbarMessage, setSnackbarOpen]);

  return (
    <Box>
      <IconButton
        ref={notificationButtonRef}
        aria-describedby={id}
        onClick={handleClick}
        sx={{
          color: unreadCount > 0 ? "#2ED573" : "#666",
          backgroundColor: unreadCount > 0 ? "#d1fae2ff" : "#f5f5f5",
        }}
        title="View notifications"
      >
        <Badge badgeContent={unreadCount} color="success">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ width: 400, maxHeight: 600 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", p: 2 }}>
            <Typography variant="h6" sx={{fontWeight: "bold"}}>Notifications</Typography>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                mt: 1,
                "& .MuiTab-root": { color: "#2ED573" },
                "& .MuiTab-root:focus": { color: "#2ED573" },
                "& .MuiTabs-indicator": { backgroundColor: "#2ED573" },
              }}
            >
              <Tab label={`All (${allNotifications.length})`} />
              <Tab label={`Unread (${unreadCount})`} />
            </Tabs>
          </Box>
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {displayedNotifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleItemClick(notification)}
                sx={{
                  backgroundColor: notification.read
                    ? "transparent"
                    : "#f5f5f5",
                  "&:hover": { backgroundColor: "#e0e0e0" },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor:
                        notification.type === "push" ? "#2ED573" : "#ff6b6b",
                    }}
                  >
                    {notification.type === "push" ? "N" : "R"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Chip
                          label="New"
                          size="small"
                          sx={{ bgcolor: "#2ED573", color: "white" }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.body}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(notification.timestamp, "MMM dd, HH:mm")}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {displayedNotifications.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  secondary={
                    tabValue === 0
                      ? "You have no notifications yet"
                      : "No unread notifications"
                  }
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Popover>
    </Box>
  );
};

export default PushNotificationButton;
