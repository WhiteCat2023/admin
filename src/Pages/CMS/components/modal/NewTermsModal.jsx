import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import { newTermsAndConditions, updateTermsAndConditions } from "../../service/cms.service";
import { NewAlert } from "../alert/NewAlert";

/**
 *
 * tc-title = Terms and Conditions Title
 * tc-content = Terms and Conditions Content
 * tc-author = Terms and Conditions Author
 * tc-date = Terms and Conditions Date
 *
 * By: Berndt
 */

export default function NewTermsModal({ open, handleClose, isEdit = null, editItem = null, setIsEdit }) {

    const {userDoc} = useAuth()
    const [input, setInput] = useState({
        "tc_title": "",
        "tc_content": "",
        "tc_author": userDoc?.name,
        "tc_authorId": userDoc?.id,
        "tc_date": serverTimestamp(),
    });

    useEffect(() => {
        if (editItem && isEdit) {
            setInput({
                ...editItem,
                "tc_author": userDoc?.name,
                "tc_authorId": userDoc?.id,
            });
        } else {
            setInput({
                "tc_title": "",
                "tc_content": "",
                "tc_author": userDoc?.name,
                "tc_authorId": userDoc?.id,
                "tc_date": serverTimestamp(),
            });
        }
    }, [editItem, open, userDoc]);
    
  // alert state
    const [alert, setAlert] = useState({
        open: false,
        msg: "",
        title: "",
        severity: "info",
    });

    const [loading, setLoading] = useState(false);

    const handleSnackBarClose = (event, reason) => {
        if (reason === "clickaway") return;
        setAlert((prev) => ({ ...prev, open: false }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const isThisEdited = async () => {
        if (!isEdit) {
            return await newTermsAndConditions(input);
        } else{
            return await updateTermsAndConditions(editItem.id, input);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (!input.tc_title || !input.tc_content) {
            setAlert({
                open: true,
                msg: "Please fill in all required fields.",
                title: "Warning",
                severity: "warning",
            });
            setLoading(false);
            return;
        }

        try {
            const res = isThisEdited();
            if (res !== false) {
                isEdit ? console.log("Updated") : console.log("Created");
                setIsEdit(false)
                setAlert({
                open: true,
                msg: isEdit ? "Terms and Conditions updated successfully." : "Terms and Conditions added successfully.",
                title: "Success",
                severity: "success",
                });
            } else {
                setAlert({
                open: true,
                msg: isEdit ? "Failed to update Terms and Conditions." : "Failed to add Terms and Conditions.",
                title: "Error",
                severity: "error",
                });
            }
        } catch (err) {
            setAlert({
                open: true,
                msg: isEdit ? "Failed to update Terms and Conditions." : "Failed to add Terms and Conditions.",
                title: "Error",
                severity: "error",
            });
        } finally {
            setLoading(false);
            handleClose();
        }
    };


    return (
        <>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle color="success">{isEdit ? "Edit" : "Create New"}  Terms and Conditions</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    To {isEdit ? "edit" : "add new"} terms and conditions, to further manage your applications
                    terms and policies.
                    </DialogContentText>
                    <form onSubmit={handleSubmit} id="subscription-form">
                    <TextField
                        required
                        color="success"
                        margin="dense"
                        id="tc_title"
                        name="tc_title"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={input.tc_title}
                        onChange={handleChange}
                    />
                    <TextField
                        autoFocus
                        required
                        color="success"
                        margin="dense"
                        id="tc_content"
                        name="tc_content"
                        label="Content"
                        type="text"
                        fullWidth
                        variant="standard"
                        multiline
                        rows={8}
                        value={input.tc_content}
                        onChange={handleChange}
                        
                    />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button color="success" onClick={handleClose}>Cancel</Button>
                    <Button color="success" type="submit" form="subscription-form">
                        {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update" : "Create")}
                    </Button>
                </DialogActions>
            </Dialog>
            <NewAlert
                open={alert.open}
                msg={alert.msg}
                title={alert.title}
                severity={alert.severity}
                onClose={handleSnackBarClose}
            />
        </>
    );
}