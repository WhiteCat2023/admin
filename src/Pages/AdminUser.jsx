import {
  Box,
  Typography,
  Fade,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";


function AdminUser() {
    const [showContent, setShowContent] = useState(true);
    const [searchText, setSearchText] = useState("");
    
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
            Admin User
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
      </Box>
    </Fade>
  );
}

export default AdminUser;
