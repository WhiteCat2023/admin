import {
  Box,
  Fade,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from "react-router-dom";
import NewTermsModal from "../components/modal/NewTermsModal";
import { useEffect, useState } from "react";
import { deleteTermsAndConditions, getTermsAndConditions } from "../service/cms.service";
import { TermsAndConditionsCard } from "../components/card/TermsAndConditionsCard";
import ViewTermsModal from "../components/modal/ViewTermsModal";


export default function TermsAndConditions() {

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewItem, setViewItem] = useState(false);

  useEffect(() => {
    getTermsAndConditions(setTerms);
  }, []);

  useEffect(() => {
    console.log(editItem)
  }, [editItem]);

  useEffect(() => {
    console.log(terms)
  }, [terms]);

  const handleOpen = () => {
    setIsEdit(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  }

  const handleViewClose = () => {
    setViewItem(null);
    setViewItem(false)
  }

  const handleEdit = (item) => {
    setOpen(true);
    setIsEdit(true);
    setEditItem(item);
  }

  const handleDelete = (item) => {
    deleteTermsAndConditions(item.id);
    console.log("Deleted", item);
  }
  
  const handleView = (item) => {
    setSelectedItem(item);
    setViewItem(true);
  }

  const renderTerms = () => {
    if (terms.length === 0) {
      return (
        <Card sx={{ mt: 4, ps: 4}}>
          <CardContent>
          <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: "center" }}>
              No Terms and Conditions Found
          </Typography>
          </CardContent>
        </Card>
    );
    }
    return terms.map((item, index) => (
      <TermsAndConditionsCard key={index} item={item} edit={handleEdit} deleteItem={handleDelete} view={handleView}/>
    ));
  }
  return (
    <>
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
        <Box>
            <Button variant="contained" color="success" onClick={handleOpen}>
              Create New Terms and Conditions
            </Button>
        </Box>
        <Box sx={{pt: 4, gap: 2, display: 'flex', flexDirection: 'column', backgroundColor: "inherit"}}>         
          {renderTerms()}
        </Box>
      </Box>
    </Fade>
    <NewTermsModal 
      open={open} 
      handleClose={handleClose}
      isEdit={isEdit}
      editItem={editItem}
      setIsEdit={setIsEdit}/>
    <ViewTermsModal
      item={selectedItem}
      open={viewItem}
      handleClose={handleViewClose}
       />
    </>
  )
}
