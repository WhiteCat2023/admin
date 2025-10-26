import {
  Box,
  Typography,
  Fade,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Grid,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import ReportIcon from "@mui/icons-material/Report";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BlockIcon from "@mui/icons-material/Block";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CallIcon from "@mui/icons-material/Call";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import InfoIcon from "@mui/icons-material/Info";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GetAppIcon from "@mui/icons-material/GetApp";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { format } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';
import { formattedDate } from "../utils/helpers";
import { subscribeToSOS, verifySOS, verifyIfYes, getSOSLogs, warnUser, suspendUser, sendNotification, getSOSStats, markFalseAlarm, startResponse, endResponse } from "../utils/services/firebase/sos.services";

function Sos() {
  const [showContent, setShowContent] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // New: state to hold selected row for data modal
  const [selectedRowForData, setSelectedRowForData] = useState(null);
  const openDataModal = (row) => setSelectedRowForData(row);
  const closeDataModal = () => setSelectedRowForData(null);

  // new helpers: copy and download JSON
  const copySelectedRowJSON = async () => {
    if (!selectedRowForData) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedRowForData, null, 2));
      await Swal.fire({ icon: "success", title: "Copied to clipboard" });
    } catch (e) {
      console.error(e);
      await Swal.fire({ icon: "error", title: "Copy failed" });
    }
  };

  const downloadSelectedRowJSON = () => {
    if (!selectedRowForData) return;
    try {
      const dataStr = JSON.stringify(selectedRowForData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sos-${selectedRowForData.id ?? "data"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Download failed" });
    }
  };

  useEffect(() => {
    let mounted = true;
    const unsub = subscribeToSOS(
      (items) => {
        if (!mounted) return;
        setRows((items || []).filter(Boolean).map((r) => ({ ...r })));
        setLoading(false);
      },
      (err) => {
        console.error("subscribe error", err);
        setLoading(false);
      }
    );
    return () => {
      mounted = false;
      if (typeof unsub === "function") unsub();
    };
  }, []);

  // New: actions menu component to manage dropdown state per row
  // NOTE: accept onViewData prop
  function ActionsMenu({ row, onViewData }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const id = row?.id;
    const userId = row?.userId ?? row?.uid ?? row?.user?.id;
    const isVerified = !!row?.verified;
    const isResponding = !!row?.response?.started && !row?.response?.ended;

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // sync view handler (no async)
    const handleView = () => {
      handleClose();
      if (typeof onViewData === "function") onViewData(row);
    };

    const doCloseAnd = (fn) => async (...args) => {
      handleClose();
      try {
        await fn(...args);
      } catch (e) {
        console.error(e);
        await Swal.fire({ icon: "error", title: "Action failed", text: e?.message ?? String(e) });
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
      await verifySOS(id, { verifiedBy: "admin", method: "manual" });
      await Swal.fire({ icon: "success", title: "Marked as verified" });
    });

    const handleAutoCheck = doCloseAnd(async () => {
      const res = await verifyIfYes(id);
      if (res?.autoVerified) {
        await Swal.fire({ icon: "success", title: "Auto-verified", text: "User replied YES." });
      } else {
        const text = JSON.stringify(res?.checked || [], null, 2).slice(0, 2000);
        await Swal.fire({
          title: "Auto-Check result",
          icon: "info",
          html: `<pre id="swal-autocheck" style="text-align:left;white-space:pre-wrap"></pre>`,
          didOpen: () => {
            const pre = document.getElementById("swal-autocheck");
            if (pre) pre.textContent = text;
          },
        });
      }
    });

    const handleLogs = doCloseAnd(async () => {
      const logs = await getSOSLogs(id, 100);
      const txt = JSON.stringify(logs, null, 2);
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (w) {
        w.document.title = `SOS Logs ${id}`;
        const pre = w.document.createElement("pre");
        pre.textContent = txt;
        w.document.body.appendChild(pre);
      } else {
        const text = txt.slice(0, 2000);
        await Swal.fire({
          title: "Logs (truncated)",
          icon: "info",
          html: `<pre id="swal-logs" style="text-align:left;white-space:pre-wrap"></pre>`,
          didOpen: () => {
            const pre = document.getElementById("swal-logs");
            if (pre) pre.textContent = text;
          },
        });
      }
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

    const handleStart = doCloseAnd(async () => {
      const res = await Swal.fire({
        title: "Responder name/ID (optional)",
        input: "text",
        showCancelButton: true,
        inputPlaceholder: "Responder",
      });
      if (!res.isConfirmed) return;
      const responder = res.value ?? "";
      await startResponse(id, { responderName: responder || "responder" });
      await Swal.fire({ icon: "success", title: "Response started" });
    });

    const handleEnd = doCloseAnd(async () => {
      const res = await Swal.fire({
        title: "End remarks (optional)",
        input: "text",
        showCancelButton: true,
        inputPlaceholder: "Remarks",
      });
      if (!res.isConfirmed) return;
      const remarks = res.value ?? "";
      await endResponse(id, { remarks, actedBy: "admin" });
      await Swal.fire({ icon: "success", title: "Response ended" });
    });

    const handleWarn = doCloseAnd(async () => {
      if (!userId) {
        await Swal.fire({ icon: "error", title: "No userId available for this SOS." });
        return;
      }
      const res = await Swal.fire({
        title: "Reason for warning (optional)",
        input: "text",
        showCancelButton: true,
        inputValue: "False alarm",
      });
      if (!res.isConfirmed) return;
      const reason = res.value ?? "";
      const r = await warnUser(userId, { reason, warnedBy: "admin" });
      await Swal.fire({ icon: "success", title: "User warned", text: `new warnCount: ${r?.warnCount ?? "-"}` });
    });

    const handleSuspend = doCloseAnd(async () => {
      if (!userId) {
        await Swal.fire({ icon: "error", title: "No userId available for this SOS." });
        return;
      }
      const confirmed = await Swal.fire({
        title: "Suspend this user's SOS access?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Suspend",
      });
      if (!confirmed.isConfirmed) return;
      const res = await Swal.fire({
        title: "Reason for suspension (optional)",
        input: "text",
        showCancelButton: true,
        inputValue: "Excessive false alarms",
      });
      if (!res.isConfirmed) return;
      const reason = res.value ?? "";
      await suspendUser(userId, { reason, suspendedBy: "admin" });
      await Swal.fire({ icon: "success", title: "User suspended." });
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
      await sendNotification(id, { target: "responders", message: msg, meta: { sosRow: row } });
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
          <MenuItem onClick={handleView}>
            <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
            <ListItemText>View Data</ListItemText>
          </MenuItem>

          {!isVerified && !row?.falseAlarm && (
            <MenuItem onClick={handleVerify}>
              <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Verify</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={handleAutoCheck}>
            <ListItemIcon><FactCheckIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Auto-Check</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleLogs}>
            <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Logs</ListItemText>
          </MenuItem>
          {!row?.falseAlarm && (
            <MenuItem onClick={handleFalse}>
              <ListItemIcon><ReportIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Mark False Alarm</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={handleWarn}>
            <ListItemIcon><WarningAmberIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Warn User</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSuspend}>
            <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Suspend User</ListItemText>
          </MenuItem>

          <Divider />

          {!isResponding ? (
            <MenuItem onClick={handleStart}>
              <ListItemIcon><PlayArrowIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Start Response</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={handleEnd}>
              <ListItemIcon><StopIcon fontSize="small" /></ListItemIcon>
              <ListItemText>End Response</ListItemText>
            </MenuItem>
          )}

          <MenuItem onClick={handleNotify}>
            <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Notify Responders</ListItemText>
          </MenuItem>

          {(row?.contact || row?.phone) && (
            <MenuItem onClick={handleCall}>
              <ListItemIcon><CallIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Call</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }

  const columns = [
    {
      field: "name",
      headerName: "Resident",
      width: 200,
      valueGetter: (params) =>
        params?.row?.firstName ?? params?.row?.userName ?? "",
      renderCell: (params) => {
        const name = params?.row?.firstName ?? params?.row?.userName ?? "";
        const userId =
          params?.row?.userId ?? params?.row?.uid ?? params?.row?.user?.id;
        if (userId) {
          return (
            <a
              href={`#/admin-users/${userId}`}
              style={{ textDecoration: "none" }}
            >
              {name}
            </a>
          );
        }
        return <Box>{name}</Box>;
      },
    },
    {
      field: "timestamp",
      headerName: "Time",
      width: 180,
      valueGetter: (params) => {
        const t = params?.row?.timestamp;
        return t ? formattedDate(t) : "";
      },
      renderCell: (params) => {
        const t = params?.row?.timestamp;
        if (!t) return <Box>-</Box>;
        return <Box>{formattedDate(t)}</Box>;
      },
    },

    {
      field: "contact",
      headerName: "Contact",
      width: 150,
      valueGetter: (params) =>
        params?.row?.contactNumber ?? params?.row?.phone ?? "",
      renderCell: (params) => {
        const contact = params?.row?.contactNumber ?? params?.row?.phone ?? "";
        if (!contact) return <Box>-</Box>;
        return (
          <a href={`tel:${contact}`} style={{ textDecoration: "none" }}>
            {contact}
          </a>
        );
      },
    },
    {
      field: "type",
      headerName: "Type",
      width: 130,
      valueGetter: (params) =>
        params?.row?.type ?? params?.row?.emergencyType ?? "",
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      valueGetter: (params) => {
        const r = params?.row || {};
        if (r.falseAlarm) return "False Alarm";
        if (r.verified) return "Verified";
        return "Unverified";
      },
    },
    {
      field: "location",
      headerName: "Location",
      width: 180,
      valueGetter: (params) => {
        const l = params?.row?.location;
        if (!l) return "";
        const lat = l?.lat ?? l?.latitude ?? "";
        const lng = l?.lng ?? l?.longitude ?? "";
        return `${lat ? lat : "-"}, ${lng ? lng : "-"}`;
      },
      renderCell: (params) => {
        const l = params?.row?.location;
        if (!l) return <Box>-</Box>;
        const lat = l?.lat ?? l?.latitude ?? "";
        const lng = l?.lng ?? l?.longitude ?? "";
        const q = `${lat},${lng}`;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {q}
            </Box>
            <Tooltip title="Open in maps">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  q
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                <OpenInNewIcon fontSize="small" />
              </a>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: "responder",
      headerName: "Responder",
      width: 140,
      valueGetter: (params) =>
        params?.row?.response?.responderName ??
        params?.row?.response?.responder ??
        "-",
    },
    {
      field: "verifiedBy",
      headerName: "Verified By",
      width: 160,
      valueGetter: (params) =>
        params?.row?.verifiedBy ?? params?.row?.verification?.by ?? "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const row = params?.row || {};
        return <ActionsMenu row={row} onViewData={openDataModal} />;
      },
    },
  ];

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const q = searchText.toLowerCase();
    return rows.filter((r) => {
      // search id, timestamp string, location coords and any other field content
      if ((r.id || "").toLowerCase().includes(q)) return true;
      if (r.timestamp && String(r.timestamp).toLowerCase().includes(q)) return true;
      const lat = r.location?.lat;
      const lng = r.location?.lng;
      if ((String(lat) + " " + String(lng)).toLowerCase().includes(q)) return true;
      try {
        if (JSON.stringify(r).toLowerCase().includes(q)) return true;
      } catch {}
      return false;
    });
  }, [rows, searchText]);

  return (
    <Fade in={showContent} timeout={600}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontWeight: "bold", fontFamily: '"Poppins", sans-serif' }}
          >
            SOS
          </Typography>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ borderRadius: 4 }}>
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

        {/* Data modal - improved layout */}
        <Dialog
          open={!!selectedRowForData}
          onClose={closeDataModal}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {`SOS ${selectedRowForData?.id ?? ""}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedRowForData ? (typeof selectedRowForData.timestamp === "string" ? selectedRowForData.timestamp : (selectedRowForData.timestamp ? format(new Date(selectedRowForData.timestamp), "yyyy-MM-dd HH:mm:ss") : "")) : ""}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Copy JSON">
                  <IconButton size="small" onClick={copySelectedRowJSON}><ContentCopyIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Download JSON">
                  <IconButton size="small" onClick={downloadSelectedRowJSON}><GetAppIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Button variant="outlined" size="small" onClick={closeDataModal}>Close</Button>
              </Stack>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            {/* compact details grid */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Resident</Typography>
                <Box>
                  {selectedRowForData?.firstName ?? selectedRowForData?.userName ?? "-"}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Contact</Typography>
                <Box>
                  {(selectedRowForData?.contactNumber ?? selectedRowForData?.phone) ? (
                    <a href={`tel:${selectedRowForData?.contactNumber ?? selectedRowForData?.phone}`} style={{ textDecoration: "none" }}>
                      {selectedRowForData?.contactNumber ?? selectedRowForData?.phone}
                    </a>
                  ) : (
                    "-"
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Type</Typography>
                <Box>{selectedRowForData?.type ?? selectedRowForData?.emergencyType ?? "-"}</Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box>
                  {selectedRowForData?.falseAlarm ? "False Alarm" : selectedRowForData?.verified ? "Verified" : "Unverified"}
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Responder</Typography>
                <Box>{selectedRowForData?.response?.responderName ?? selectedRowForData?.response?.responder ?? "-"}</Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Verified By</Typography>
                <Box>{selectedRowForData?.verifiedBy ?? selectedRowForData?.verification?.by ?? "-"}</Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Response</Typography>
                <Box>
                  {selectedRowForData?.response?.started
                    ? `Started: ${selectedRowForData?.response?.started ? (typeof selectedRowForData.response.started === "string" ? selectedRowForData.response.started : format(new Date(selectedRowForData.response.started), "yyyy-MM-dd HH:mm:ss")) : "-"}${selectedRowForData?.response?.ended ? ` • Ended: ${typeof selectedRowForData.response.ended === "string" ? selectedRowForData.response.ended : format(new Date(selectedRowForData.response.ended), "yyyy-MM-dd HH:mm:ss")}` : ""}`
                    : "-"
                  }
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Location</Typography>
                <Box>
                  {selectedRowForData?.location ? (() => {
                    const lat = selectedRowForData.location?.lat ?? selectedRowForData.location?.latitude ?? "";
                    const lng = selectedRowForData.location?.lng ?? selectedRowForData.location?.longitude ?? "";
                    const q = `${lat || "-"}, ${lng || "-"}`;
                    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
                    return (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q}</span>
                        {(lat || lng) ? <a href={maps} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Open</a> : null}
                      </span>
                    );
                  })() : "-"
                  }
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Verified Remarks</Typography>
                <Box>{selectedRowForData?.verification?.remarks ?? selectedRowForData?.remarks ?? "-"}</Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            <Typography variant="caption" color="text.secondary">Raw JSON</Typography>
            <Box
              component="pre"
              sx={{
                maxHeight: 320,
                overflow: "auto",
                backgroundColor: "#f7f7f7",
                p: 1,
                borderRadius: 1,
                fontSize: 12,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {selectedRowForData ? (() => {
                try {
                  return JSON.stringify(selectedRowForData, null, 2);
                } catch {
                  return String(selectedRowForData);
                }
              })() : "-"}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button size="small" onClick={copySelectedRowJSON}>Copy JSON</Button>
            <Button size="small" onClick={downloadSelectedRowJSON}>Download JSON</Button>
            <Button size="small" onClick={closeDataModal}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Data grid */}
        <Box sx={{ height: 640, width: "100%", mt: 2 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={25}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            getRowId={(r) => r.id ?? r._id ?? `${r?.userId ?? "row"}-${Math.random().toString(36).slice(2, 7)}`}
            disableSelectionOnClick
            onRowClick={(params) => openDataModal(params.row)}
            autoHeight={false}
            sortModel={[{ field: "timestamp", sort: "desc" }]}
          />
        </Box>
      </Box>
    </Fade>
  );
}

export default Sos;
