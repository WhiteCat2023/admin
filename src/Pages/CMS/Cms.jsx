import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Fade,
  TextField,
  InputAdornment,
  CardActionArea,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";

function Cms() {
  return (
    <Fade in={true} timeout={500}>
        <Box sx={{height: "100dvh", p: 3 }}>
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
                    CMS
                </Typography>
            </Box>
            <Box>
                
            </Box>  
        </Box>
    </Fade>
  )
}

export default Cms