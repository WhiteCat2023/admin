import { Box, Tooltip } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { formattedDate } from "../helpers";
import SosActionsMenu from "./SosActionsMenu";

export const getSosColumns = (onViewData) => [
  {
    field: "name",
    headerName: "Resident",
    width: 130,
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
    width: 140,
    renderCell: (params) => {
      return formattedDate(params?.value);
    },
  },
  {
    field: "contact",
    headerName: "Contact",
    width: 120,
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
    width: 100,
    valueGetter: (params) =>
      params?.row?.type ?? params?.row?.emergencyType ?? "",
    renderCell: (params) => {
      const type = params?.row?.type ?? params?.row?.emergencyType ?? "";
      return <Box>{type}</Box>;
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 110,
    renderCell: (params) => {
      return params?.value;
    },
  },
  {
    field: "location",
    headerName: "Location",
    width: 160,
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
    width: 110,
    valueGetter: (params) =>
      params?.row?.response?.responderName ??
      params?.row?.response?.responder ??
      "-",
    renderCell: (params) => {
      const responder =
        params?.row?.response?.responderName ??
        params?.row?.response?.responder ??
        "-";
      return <Box>{responder}</Box>;
    },
  },
  {
    field: "verifiedBy",
    headerName: "Verified By",
    width: 120,
    valueGetter: (params) =>
      params?.row?.verifiedBy ?? params?.row?.verification?.verifiedBy ?? "-",
    renderCell: (params) => {
      const verifiedBy =
        params?.row?.verifiedBy ?? params?.row?.verification?.verifiedBy ?? "-";
      return <Box>{verifiedBy}</Box>;
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 80,
    sortable: false,
    renderCell: (params) => {
      const row = params?.row || {};
      return <SosActionsMenu row={row} onViewData={onViewData} />;
    },
  },
];
