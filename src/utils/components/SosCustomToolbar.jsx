import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Stack,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

function SosCustomToolbar({
  searchText,
  setSearchText,
  stats,
  onBulkRespond,
  onBulkDelete,
  statusFilter = "all",
  setStatusFilter,
  selectedRowsCount = 0,
}) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusMenuTriggerRef = useRef(null);

  const statusLabels = {
    all: "All SOS",
    verified: "Verified",
    responded: "Responding",
    resolved: "Resolved",
    falseAlarms: "False Alarms",
  };

  const getStatusStats = () => {
    if (statusFilter === "all") return stats.total;
    if (statusFilter === "verified") return stats.verified;
    if (statusFilter === "responded") return stats.responding;
    if (statusFilter === "resolved") return stats.resolved;
    if (statusFilter === "falseAlarms") return stats.falseAlarms;
    return 0;
  };

  return (
    <Toolbar
      sx={{
        pl: 2,
        pr: 2,
        py: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Tooltip title="Status Filter">
          <IconButton
            ref={statusMenuTriggerRef}
            onClick={() => setStatusMenuOpen(true)}
            size="small"
          >
            <Badge badgeContent={1} color="primary" variant="dot">
              <FilterAltIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          id="status-menu"
          anchorEl={statusMenuTriggerRef.current}
          open={statusMenuOpen}
          onClose={() => setStatusMenuOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem
            onClick={() => {
              setStatusFilter("all");
              setStatusMenuOpen(false);
            }}
            selected={statusFilter === "all"}
          >
            All SOS ({stats.total})
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatusFilter("verified");
              setStatusMenuOpen(false);
            }}
            selected={statusFilter === "verified"}
          >
            Verified ({stats.verified})
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatusFilter("responded");
              setStatusMenuOpen(false);
            }}
            selected={statusFilter === "responded"}
          >
            Responding ({stats.responding})
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatusFilter("resolved");
              setStatusMenuOpen(false);
            }}
            selected={statusFilter === "resolved"}
          >
            Resolved ({stats.resolved})
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatusFilter("falseAlarms");
              setStatusMenuOpen(false);
            }}
            selected={statusFilter === "falseAlarms"}
          >
            False Alarms ({stats.falseAlarms})
          </MenuItem>
        </Menu>

        <Typography variant="body2" sx={{ fontWeight: 500, ml: 1 }}>
          {statusLabels[statusFilter]}: {getStatusStats()}
        </Typography>
      </Stack>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <Stack direction="row" spacing={1}>
        {onBulkRespond && (
          <Tooltip title="Start response for all verified SOS">
            <IconButton
              onClick={onBulkRespond}
              size="small"
              sx={{ color: "#2ED573", "&:hover": { color: "#00b347ff" } }}
            >
              <PlayArrowIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )}

        {onBulkDelete && selectedRowsCount > 0 && (
          <Tooltip title={`Delete ${selectedRowsCount} selected SOS`}>
            <IconButton
              onClick={onBulkDelete}
              size="small"
              sx={{ color: "#d32f2f", "&:hover": { color: "#b71c1c" } }}
            >
              <Badge badgeContent={selectedRowsCount} color="error">
                <DeleteIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Toolbar>
  );
}

export default SosCustomToolbar;
