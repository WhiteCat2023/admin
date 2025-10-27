import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReportIcon from "@mui/icons-material/Report";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CallIcon from "@mui/icons-material/Call";
import Swal from "sweetalert2";
import {
  verifySOS,
  markFalseAlarm,
  sendNotification,
} from "../services/firebase/sos.services";
import { useAuth } from "../../context/AuthContext";

function SosActionsMenu({ row, onViewData }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = row?.id;
  const userId = row?.userId ?? row?.uid ?? row?.user?.id;
  const isVerified = !!row?.verified;
  const { userDoc } = useAuth();

  const handleOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const doCloseAnd = (fn) => async (...args) => {
    handleClose();
    try {
      await fn(...args);
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Action failed",
        text: e?.message ?? String(e),
      });
    }
  };

  const handleVerify = doCloseAnd(async () => {
    const confirmed = await Swal.fire({
      title: "Mark this SOS as verified?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });
    if (!confirmed.isConfirmed) return;
    await verifySOS(id, { verifiedBy: userDoc?.name || "admin", method: "manual", verified: true });
    await Swal.fire({ icon: "success", title: "Marked as verified" });
  });

  const handleFalse = doCloseAnd(async () => {
    const res = await Swal.fire({
      title: "Remarks for false alarm (optional)",
      input: "text",
      showCancelButton: true,
      inputPlaceholder: "Remarks",
    });
    if (!res.isConfirmed) return;
    const remarks = res.value ?? "";
    await markFalseAlarm(id, { remarks, actedBy: "admin" });
    await Swal.fire({ icon: "success", title: "Marked false alarm" });
  });

  const handleNotify = doCloseAnd(async () => {
    const defaultMsg = `SOS ${id} at ${row?.location?.lat ?? ""},${row?.location?.lng ?? ""} - ${row?.type ?? ""}`;
    const res = await Swal.fire({
      title: "Notification message to responders",
      input: "text",
      showCancelButton: true,
      inputValue: defaultMsg,
    });
    if (!res.isConfirmed) return;
    const msg = res.value ?? "";
    await sendNotification(id, {
      target: "responders",
      message: msg,
      meta: { sosRow: row },
    });
    await Swal.fire({ icon: "success", title: "Notification queued (logged)." });
  });

  const handleCall = () => {
    handleClose();
    const contact = row?.contact ?? row?.phone;
    if (!contact) {
      Swal.fire({ icon: "error", title: "No contact available" });
      return;
    }
    window.open(`tel:${contact}`);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="more">
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {!isVerified && !row?.falseAlarm && (
          <MenuItem onClick={handleVerify}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Verify</ListItemText>
          </MenuItem>
        )}
        {!row?.falseAlarm && (
          <MenuItem onClick={handleFalse}>
            <ListItemIcon>
              <ReportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark False Alarm</ListItemText>
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={handleNotify}>
          <ListItemIcon>
            <NotificationsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Notify Responders</ListItemText>
        </MenuItem>

        {(row?.contact || row?.phone) && (
          <MenuItem onClick={handleCall}>
            <ListItemIcon>
              <CallIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Call</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default SosActionsMenu;
