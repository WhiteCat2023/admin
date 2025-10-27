import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function ForumHeader({ searchQuery, onSearchChange }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        mb: 3,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: "bold",
          fontFamily: '"Poppins", sans-serif',
        }}
      >
        Forum
      </Typography>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
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
  );
}

export default ForumHeader;
