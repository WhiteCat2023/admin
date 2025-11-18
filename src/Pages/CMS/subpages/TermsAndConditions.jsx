import {
  Box,
  Fade,
  Typography,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from "react-router-dom";

function TermsAndConditions() {
  const navigate = useNavigate();
  return (
    <Fade in={true} timeout={500}>
     <Box sx={{ height: "100dvh", p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <IconButton
          onClick={()=> navigate(-1)}>
            <ChevronLeftIcon sx={{
              fontSize: 80,
              color: "black"
            }} />
          </IconButton>
          <Typography
            variant="h2"
            sx={{ fontWeight: "bold", fontFamily: '"Poppins", sans-serif' }}
          >
            
            Terms and Conditions
          </Typography>
        </Box>
      </Box>
    </Fade>
  )
}

export default TermsAndConditions