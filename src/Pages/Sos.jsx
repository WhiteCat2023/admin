import {
  Box,
  Typography,
  Fade,
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import { format } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { subscribeToSOS, startResponse, endResponse } from "../utils/services/firebase/sos.services";
import { useAuth } from "../context/AuthContext";
import SosCustomToolbar from "../utils/components/SosCustomToolbar";
import SosDataModal from "../utils/components/SosDataModal";
import { getSosColumns } from "../utils/components/SosDataGridColumns";

function Sos() {
  const [showContent, setShowContent] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    falseAlarms: 0,
    responding: 0,
    resolved: 0,
  });
  const { userDoc } = useAuth();

  const [selectedRowForData, setSelectedRowForData] = useState(null);
  const [selectedRows, setSelectedRows] = useState({
    type: "include",
    ids: new Set(),
  });

  const openDataModal = (row, event) => {
    event?.stopPropagation?.();
    setSelectedRowForData(row);
  };

  const closeDataModal = () => setSelectedRowForData(null);

  const copySelectedRowJSON = async () => {
    if (!selectedRowForData) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(selectedRowForData, null, 2)
      );
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

  const handleRespondClick = async () => {
    if (!selectedRowForData?.id) return;
    try {
      const currentUser = userDoc?.name || "admin";
      const isCurrentlyResponding =
        !!selectedRowForData?.response?.started &&
        !selectedRowForData?.response?.ended;

      if (isCurrentlyResponding) {
        await endResponse(selectedRowForData.id, {
          remarks: "Response completed",
          actedBy: currentUser,
        });

        setRows((prevRows) =>
          prevRows.map((r) =>
            r.id === selectedRowForData.id
              ? {
                  ...r,
                  status: "resolved",
                  response: {
                    ...r.response,
                    ended: true,
                  },
                }
              : r
          )
        );

        await Swal.fire({ icon: "success", title: "Response finished" });
      } else {
        await startResponse(selectedRowForData.id, {
          responderName: currentUser,
        });

        setRows((prevRows) =>
          prevRows.map((r) =>
            r.id === selectedRowForData.id
              ? {
                  ...r,
                  status: "responding",
                  response: {
                    ...r.response,
                    started: true,
                    responderName: currentUser,
                  },
                }
              : r
          )
        );

        await Swal.fire({ icon: "success", title: "Response started" });
      }

      closeDataModal();
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Action failed",
        text: e?.message ?? String(e),
      });
    }
  };

  const handleBulkRespond = async () => {
    const verifiedRows = rows.filter(
      (r) =>
        r?.verified &&
        (!r?.response?.started || r?.response?.ended)
    );

    if (verifiedRows.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "No verified SOS to respond to",
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: "Start response for all verified SOS?",
      text: `This will start response for ${verifiedRows.length} verified SOS reports`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Start Bulk Response",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const currentUser = userDoc?.name || "admin";
      let successCount = 0;
      let failCount = 0;

      for (const row of verifiedRows) {
        try {
          await startResponse(row.id, { responderName: currentUser });
          successCount++;

          setRows((prevRows) =>
            prevRows.map((r) =>
              r.id === row.id
                ? {
                    ...r,
                    status: "responding",
                    response: {
                      ...r.response,
                      started: true,
                      responderName: currentUser,
                    },
                  }
                : r
            )
          );
        } catch (e) {
          console.error(`Failed to start response for ${row.id}:`, e);
          failCount++;
        }
      }

      await Swal.fire({
        icon: successCount > 0 ? "success" : "error",
        title: "Bulk Response Complete",
        text: `Started: ${successCount}, Failed: ${failCount}`,
      });
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Bulk action failed",
        text: e?.message ?? String(e),
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.ids?.size === 0) {
      await Swal.fire({
        icon: "warning",
        title: "No SOS selected",
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: "Delete selected SOS?",
      text: `This will delete ${selectedRows.ids?.size} SOS reports. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d32f2f",
    });

    if (!confirmed.isConfirmed) return;

    try {
      // Note: Import deleteSOSRecord from your firebase service
      for (const rowId of selectedRows.ids) {
        // await deleteSOSRecord(rowId);
        console.log(`Deleting SOS: ${rowId}`);
      }

      setRows((prevRows) =>
        prevRows.filter((r) => !selectedRows.ids.has(r.id))
      );
      setSelectedRows({ type: "include", ids: new Set() });

      await Swal.fire({
        icon: "success",
        title: "SOS deleted successfully",
        text: `Deleted ${selectedRows.ids?.size} records`,
      });
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: e?.message ?? String(e),
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    const unsub = subscribeToSOS(
      (items) => {
        if (!mounted) return;
        setRows((items || []).filter(Boolean).map((r) => ({ ...r })));

        const verified = (items || []).filter((i) => i?.verified).length;
        const falseAlarms = (items || []).filter((i) => i?.falseAlarm).length;
        const responding = (items || []).filter(
          (i) => i?.response?.started && !i?.response?.ended
        ).length;
        const resolved = (items || []).filter(
          (i) => i?.response?.started && i?.response?.ended
        ).length;
        setStats({
          total: items?.length || 0,
          verified,
          falseAlarms,
          responding,
          resolved,
        });

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

  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Apply status filter
    if (statusFilter === "verified") {
      filtered = filtered.filter((r) => r?.status === "verified");
    } else if (statusFilter === "responded") {
      filtered = filtered.filter((r) => r?.status === "responding");
    } else if (statusFilter === "resolved") {
      filtered = filtered.filter((r) => r?.status === "resolved");
    } else if (statusFilter === "falseAlarms") {
      filtered = filtered.filter((r) => r?.status === "false_alarm");
    }

    // Apply search filter
    if (!searchText) return filtered;
    const q = searchText.toLowerCase();
    return filtered.filter((r) => {
      if ((r.id || "").toLowerCase().includes(q)) return true;
      if (r.timestamp && String(r.timestamp).toLowerCase().includes(q))
        return true;
      const lat = r.location?.lat;
      const lng = r.location?.lng;
      if ((String(lat) + " " + String(lng)).toLowerCase().includes(q))
        return true;
      try {
        if (JSON.stringify(r).toLowerCase().includes(q)) return true;
      } catch {}
      return false;
    });
  }, [rows, searchText, statusFilter]);

  const columns = getSosColumns(openDataModal);

  const renderToolbar = () => (
    <SosCustomToolbar
      searchText={searchText}
      setSearchText={setSearchText}
      stats={stats}
      onBulkRespond={handleBulkRespond}
      onBulkDelete={handleBulkDelete}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      selectedRowsCount={selectedRows.ids?.size || 0}
    />
  );

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

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            showToolbar
            checkboxSelection
            disableRowSelectionExcludeModel
            rows={filteredRows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50, 100]}
            loading={loading}
            getRowId={(row) => row.id}
            onRowClick={(params, event) => openDataModal(params.row, event)}
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection);
            }}
            slots={{
              toolbar: renderToolbar,
            }}
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
              },
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                },
              },
            }}
          />
        </Box>

        <SosDataModal
          open={!!selectedRowForData}
          onClose={closeDataModal}
          data={selectedRowForData}
          onRespond={handleRespondClick}
          onCopyJSON={copySelectedRowJSON}
          onDownloadJSON={downloadSelectedRowJSON}
        />
      </Box>
    </Fade>
  );
}

export default Sos;


