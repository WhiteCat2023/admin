import {
  Box,
  Typography,
  Skeleton,
  Fade,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
  Menu,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  getAllReportsFromFirebase,
  updateReportStatus,
  deleteReport,
} from "../utils/services/firebase/report.service";
import CustomToolbar from "../utils/components/CustomToolbar";
import ReportDetailDialog from "../utils/components/ReportDetailDialog";
import Swal from "sweetalert2";
import { getTierColor } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

function Report() {
  const { user, userDoc } = useAuth();
  const [showContent, setShowContent] = useState(true);
  const [selectedRows, setSelectedRows] = useState({
    type: "include",
    ids: new Set(),
  });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const paginationModel = { page: 0, pageSize: 20 };
  const dummyRows = Array(5)
    .fill({})
    .map((_, i) => ({ id: i }));

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => console.log(selectedRows), [setSelectedRows]);

  const fetchData = async () => {
    setIsLoading(true);
    setShowContent(false);
    try {
      const reportsData = await getAllReportsFromFirebase();
      setReports(reportsData);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setIsLoading(false);
      setShowContent(true);
    }
  };

  // useEffect(() => {[...selectedRows.ids].map(id => console.log(id));}, [selectedRows.ids])

  const handleRespond = async () => {
    if (selectedRows.ids?.size === 0) return;
    try {
      await Promise.all(
        [...selectedRows.ids].map((id) =>
          updateReportStatus({
            docId: id,
            status: "responded",
            respondedBy: {
              userId: user?.uid,
              userName: userDoc?.firstName || user?.displayName || "Unknown",
              email: user?.email,
              respondedAt: new Date(),
              timestamp: new Date(),
            },
          })
        )
      );
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error("Error responding to reports:", error);
    }
  };

  const handleRespondRow = async () => {
    if (!selectedRow.id) return;
    try {
      await updateReportStatus({
        docId: selectedRow.id,
        status: "responded",
        respondedBy: {
          userId: user?.uid,
          userName: userDoc?.firstName || user?.displayName || "Unknown",
          email: user?.email,
          respondedAt: new Date(),
          timestamp: new Date(),
        },
      });
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error("Error responding to reports:", error);
    }
  };

  const handleIgnore = async () => {
    if (selectedRows.ids?.size === 0) return;
    try {
      await Promise.all(
        [...selectedRows.ids].map((id) =>
          updateReportStatus({
            docId: id,
            status: "ignored",
            ignoredBy: {
              userId: user?.uid,
              userName: userDoc?.firstName || user?.displayName || "Unknown",
              email: user?.email,
              ignoredAt: new Date(),
              timestamp: new Date(),
            },
          })
        )
      );
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error("Error ignoring reports:", error);
    }
  };

  const handleIgnoreRow = async () => {
    if (!selectedRow.id) return;
    try {
      await updateReportStatus({
        docId: selectedRow.id,
        status: "ignored",
        ignoredBy: {
          userId: user?.uid,
          userName: userDoc?.firstName || user?.displayName || "Unknown",
          email: user?.email,
          ignoredAt: new Date(),
          timestamp: new Date(),
        },
      });
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error("Error ignoring reports:", error);
    }
  };

  const handleDelete = () => {
    if (selectedRows.ids?.size === 0) return;
    try {
      Swal.fire({
        title: "Warning",
        text: `Are you sure you want to delete ${selectedRows.ids?.size} reports?`,
        icon: "warning",
        confirmButtonText: "Delete",
        topLayer: true,
        confirmButtonColor: "#2ED573",
        showCancelButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await Promise.all(
            [...selectedRows.ids].map((id) => deleteReport(id))
          );
          Swal.fire({
            title: "Success",
            text: `Report Deleted Permanently!`,
            icon: "success",
            confirmButtonText: "Ok",
            confirmButtonColor: "#2ED573",
          });

          setSelectedRows([]);
          fetchData();
        }
      });
    } catch (error) {
      console.error("Error deleting reports:", error);
    }
  };

  const handleDeleteRow = () => {
    if (!selectedRow) return;
    try {
      Swal.fire({
        title: "Warning",
        text: `Are you sure you want to delete this ${selectedRow?.tier} report?`,
        icon: "warning",
        confirmButtonText: "Delete",
        confirmButtonColor: "#2ED573",
        topLayer: true,
        showCancelButton: true,
        topLayer: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const result = await deleteReport(selectedRow?.id);
          if (result) {
            Swal.fire({
              title: "Success",
              text: `Report Deleted Permanently!`,
              icon: "success",
              confirmButtonText: "Ok",
              confirmButtonColor: "#2ED573",
            });
          }
          setSelectedRow(null);
          fetchData();
        }
      });
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      renderCell: (params) => {
        if (params.row.isLoading)
          return <Skeleton variant="text" width="80%" />;
        return params.value;
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 3,
      renderCell: (params) => {
        if (params.row.isLoading)
          return <Skeleton variant="text" width="90%" />;
        return params.value;
      },
    },
    {
      field: "tier",
      headerName: "Tier",
      flex: 1,
      renderCell: (params) => {
        if (params.row.isLoading)
          return <Skeleton variant="circular" width={8} height={8} />;
        return (
          <Box sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              height: "100%",
          }}>
            <Typography
              variant="body1"
              style={{
                display: "flex",
                alignItems: "center",
              }}
              fontSize={12}
            >
              <Typography
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: getTierColor(params.row),
                  marginRight: 1,
                  verticalAlign: "middle",
                }}
              ></Typography>
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        if (params.row.isLoading)
          return <Skeleton variant="text" width="60%" />;
        return params.value;
      },
    },
    {
      field: "respondedBy",
      headerName: "Responded By",
      flex: 1.5,
      renderCell: (params) => {
        if (params.row.isLoading)
          return <Skeleton variant="text" width="70%" />;
        if (params.row.status?.toLowerCase() === "responded" && params.row.respondedBy?.userName) {
          return params.row.respondedBy.userName;
        }
        return "-";
      },
    },
    {
      field: "ignoredBy",
      headerName: "Ignored By",
      flex: 1.5,
      renderCell: (params) => {
        if (params.row.isLoading)
          return <Skeleton variant="text" width="70%" />;
        if (params.row.status?.toLowerCase() === "ignored" && params.row.ignoredBy?.userName) {
          return params.row.ignoredBy.userName;
        }
        return "-";
      },
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1.5,
      renderCell: (params) => {
        if (params.row.isLoading)
          return <Skeleton variant="text" width="70%" />;
        return params.value;
      },
      valueGetter: (value, row) =>
        row.timestamp
          ? new Date(row.timestamp.seconds * 1000).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
    },
    {
      field: "time",
      headerName: "Time",
      flex: 1,
      renderCell: (params) => {
        if (params.row.isLoading)
          return <Skeleton variant="text" width="50%" />;
        return params.value;
      },
      valueGetter: (value, row) =>
        row.timestamp
          ? new Date(row.timestamp.seconds * 1000).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "",
    },
    {
      field: "actions",
      headerName: "",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (params.row.isLoading)
          return (
            <Skeleton
              variant="rectangular"
              width={40}
              height={40}
              sx={{ borderRadius: 4 }}
            />
          );
        return (
          <>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setAnchorEl(event.currentTarget);
                setSelectedRow(params.row);
              }}
              size="small"
              sx={{ p: 0.5 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              elevation={1}
              sx={{
                boxShadow: "100px 100px 100px #888",
              }}
              onClose={() => {
                setAnchorEl(null);
                setSelectedRow(null);
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {selectedRow?.status.toLowerCase() === "pending" && (
                <>
                  <MenuItem
                    onClick={() => {
                      console.log("Respond to row:", selectedRow);
                      handleRespondRow();
                      setAnchorEl(null);
                      setSelectedRow(null);
                    }}
                  >
                    Respond
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      console.log("Ignore row:", selectedRow);
                      handleIgnoreRow();
                      setAnchorEl(null);
                      setSelectedRow(null);
                    }}
                  >
                    Ignore
                  </MenuItem>
                </>
              )}

              <MenuItem
                onClick={() => {
                  handleDeleteRow();
                  console.log("Delete row:", selectedRow);

                  setAnchorEl(null);
                  setSelectedRow(null);
                }}
              >
                Delete
              </MenuItem>
            </Menu>
          </>
        );
      },
    },
  ];

  const filteredReports = reports
    .filter(
      (report) =>
        (report.title || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (report.description || "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
    )
    .filter(
      (report) =>
        statusFilter === "all" || report.status?.toLowerCase() === statusFilter
    );

  const displayRows = isLoading
    ? dummyRows.map((row) => ({ ...row, isLoading: true }))
    : filteredReports;

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
          <Typography variant="h2" sx={{ fontWeight: "bold" }}>
            Reports
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
        </Box>
        <Paper sx={{ height: "auto", width: "100%", overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <DataGrid
              showToolbar
              rows={displayRows}
              columns={columns}
              initialState={{
                pagination: { paginationModel },
              }}
              pageSizeOptions={[20, 50]}
              checkboxSelection
              disableRowSelectionExcludeModel
              onRowSelectionModelChange={(newSelection, e) => {
                setSelectedRows(newSelection);
                console.log(newSelection);
              }}
              onRowClick={(params) => {
                
                setSelectedReport(params.row);
                setOpenDialog(true);
              }}
              slots={{
                toolbar: CustomToolbar,
              }}
              slotProps={{
                toolbar: {
                  selectedRows,
                  onRespond: handleRespond,
                  onIgnore: handleIgnore,
                  onDelete: handleDelete,
                  statusFilter,
                  setStatusFilter,
                },
              }}
              // autoHeight
              sx={{
                border: 0,

                height: 800,
                minWidth: 700,
                "& .MuiCheckbox-root": {
                  color: "#084518",
                  "&.Mui-checked": {
                    color: "#084518",
                  },
                  "&:not(.Mui-checked)": {
                    color: "#084518",
                  },
                },
                "& .MuiDataGrid-row.Mui-selected": {
                  backgroundColor: "#effff5ff",
                  outline: "none",
                },
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-columnHeader .MuiCheckbox-root:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#effaefff",
                },
                "& .MuiDataGrid-row.Mui-selected:hover": {
                  backgroundColor: "#dcffdcff",
                },
              }}
            />
          </Box>
        </Paper>

        <ReportDetailDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          report={selectedReport}
          onRespond={() => {
            handleRespond()
            setOpenDialog(false);
          }}
        />
      </Box>
    </Fade>
  );
}

export default Report;
