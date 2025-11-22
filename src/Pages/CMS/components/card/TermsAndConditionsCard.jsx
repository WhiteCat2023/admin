import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Icon,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export function TermsAndConditionsCard({
  key,
  item,
  edit,
  deleteItem,
  view,
}) {
  return (
    <Card key={key} elevation={0} shadow={0} sx={{display: "flex"}}>
      <CardActionArea
        onClick={(e) => {
          e.stopPropagation();
          view(item);
        }}
      >
        <CardContent
          sx={{
            display: "block",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {item.tc_title.substring(0, 50)}...
            </Typography>
          </Box>

          <Typography variant="body1">
            {item.tc_content.substring(0, 250)}...
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions
        sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1, mb: 2 }}
      >
        <Tooltip title="Edit Terms and Conditions">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              edit(item);
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Delete Terms and Conditions">
          <IconButton onClick={(e) => {
            e.stopPropagation();
            deleteItem(item);
          }}>
            <DeleteIcon />
        </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
