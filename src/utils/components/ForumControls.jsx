import { Box, Button, IconButton } from "@mui/material";
import { Add, FilterList } from "@mui/icons-material";

function ForumControls({
  filter,
  onFilterChange,
  sortOrder,
  onSortToggle,
  onNewDiscussion,
  pillButton,
  pillButtonFilled,
  pillIconButton,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <Button
        startIcon={<Add />}
        onClick={onNewDiscussion}
        sx={{
          borderRadius: "5px",
          textTransform: "none",
          fontWeight: 600,
          padding: "12px 16px",
          border: "1px solid #084518",
          color: "#084518",
          backgroundColor: "transparent",
          fontFamily: '"Poppins", sans-serif',
          minHeight: 40,
          "& .MuiButton-startIcon": {
            color: "inherit",
          },
          "&:hover": {
            backgroundColor: "rgba(46,213,115,0.06)",
          },
        }}
      >
        Add Discussion
      </Button>

      <Box
        sx={{
          padding: 0.5,
          display: "flex",
          gap: 1,
          border: "1px solid #084518",
          borderRadius: "6px",
        }}
      >
        <Button
          onClick={() => onFilterChange("newest")}
          sx={filter === "newest" ? pillButtonFilled : pillButton}
        >
          Newest
        </Button>
        <Button
          onClick={() => onFilterChange("ongoing")}
          sx={filter === "ongoing" ? pillButtonFilled : pillButton}
        >
          Ongoing
        </Button>
      </Box>

      <IconButton
        size="small"
        onClick={onSortToggle}
        sx={pillIconButton}
        aria-label="filter"
      >
        <FilterList />
      </IconButton>
    </Box>
  );
}

export default ForumControls;
