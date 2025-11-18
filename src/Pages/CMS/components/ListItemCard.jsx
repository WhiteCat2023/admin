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
  Icon,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function ListItemCard({ key, item }) {
  const navigate = useNavigate();
  console.log("ListItemCard item:", item);
  return (
    <Card
    key={key}
    elevation={0}
    shadow={0}
      sx={{
        }}>
      <CardActionArea
        onClick={() => navigate(item.path)}>  
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}>
          <Icon>
            {item.icon}
          </Icon>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {item.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
  
export default ListItemCard;