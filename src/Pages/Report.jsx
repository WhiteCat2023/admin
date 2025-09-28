import {
  Box,
  Typography,
  Skeleton,
  Fade,
  TextField,
  InputAdornment,
  MenuItem,
  ListItemIcon,
  IconButton,
  Menu,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
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

const getTierColor = (item) => {
  const tier = item.tier?.toLowerCase();
  if (tier === "emergency") return "#ff0000";
  if (tier === "high") return "#ffbb00";
  if (tier === "medium") return "#fffb00";
  if (tier === "low") return "#00ff22";
  return "#666666"; // default color
};

const paginationModel = { page: 0, pageSize: 20 };

const dummyRows = Array(5)
  .fill({})
  .map((_, i) => ({ id: i }));

function Report() {
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

  const handleRespond = async () => {
    if (selectedRows.length === 0) return;
    try {
      await Promise.all(
        selectedRows.map((id) =>
          updateReportStatus({ docId: id, status: "responded" })
        )
      );
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error("Error responding to reports:", error);
    }
  };

  const handleIgnore = async () => {
    if (selectedRows.length === 0) return;
    try {
      await Promise.all(
        selectedRows.map((id) =>
          updateReportStatus({ docId: id, status: "ignored" })
        )
      );
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error("Error ignoring reports:", error);
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) return;
    try {
      await Promise.all(selectedRows.map((id) => deleteReport(id)));
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error("Error deleting reports:", error);
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
          <span style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: params.row
                  ? getTierColor(params.row)
                  : "#666666",
                marginRight: 4,
              }}
            ></span>
            {params.value}
          </span>
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
              <MenuItem
                onClick={() => {
                  console.log("Respond to row:", selectedRow);
                  setAnchorEl(null);
                  setSelectedRow(null);
                }}
              >
                Respond
              </MenuItem>
              <MenuItem
                onClick={() => {
                  console.log("Ignore row:", selectedRow);
                  setAnchorEl(null);
                  setSelectedRow(null);
                }}
              >
                <ListItemIcon>
                  <BlockIcon fontSize="small" />
                </ListItemIcon>
                Ignore
              </MenuItem>
              <MenuItem
                onClick={() => {
                  console.log("Delete row:", selectedRow);
                  setAnchorEl(null);
                  setSelectedRow(null);
                }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                Delete
              </MenuItem>
            </Menu>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setShowContent(false);
    try {
      const reportsData = await getAllReportsFromFirebase();
      setReports(reportsData);
      console.log(reportsData);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setIsLoading(false);
      setShowContent(true);
    }
  };

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
          <Typography variant="h3" sx={{ fontWeight: "bold" }}>
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
                  borderRadius: "15px",
                  "&.Mui-focused fieldset": {
                    borderColor: "#2ED573",
                  },
                  "&:hover fieldset": {
                    borderColor: "#2ED573",
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
              isRowSelectable={(params) =>
                params.row.status?.toLowerCase() !== "responded" &&
                params.row.status?.toLowerCase() !== "ignored"
              }
              onRowSelectionModelChange={(newSelection) => {
                setSelectedRows(newSelection);
                console.log(selectedRows.ids);
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
                  color: "#2ED573",
                  "&.Mui-checked": {
                    color: "#2ED573",
                  },
                  "&:not(.Mui-checked)": {
                    color: "#2ED573",
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
          onRespond={(report) => console.log("Respond to report:", report)}
        />
      </Box>
    </Fade>
  );
}

export default Report;
