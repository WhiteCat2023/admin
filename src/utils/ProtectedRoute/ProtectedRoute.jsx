import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { use, useEffect, useState } from "react";
import { CircleLoader } from "react-spinners";
import Swal from "sweetalert2";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { updateAdminActivity } from "../services/firebase/users.services";
import { getUserInfoFromFirestore } from "../controller/users.controller";

function  ProtectedRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState(null);

  const override = {
    display: "block",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderColor: "red",
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser); // Firebase restores session here

       if (firebaseUser) {
              const result = await getUserInfoFromFirestore(firebaseUser.uid);
              if (result.status === 200) {
                setUserDoc(result.data);
                setLoading(false);
              }
            }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      updateAdminActivity(user?.uid, true);
    } 
  }, [user]);

  if (loading) {
    return <CircleLoader cssOverride={override} />;
  }

  //For restricting users if restricted by admin

  if (userDoc?.restricted) {
    signOut(auth);
    return(
    <Dialog open={userDoc?.restricted} aria-labelledby="alert-dialog-restricted-title" aria-describedby="alert-dialog-restricted-description">
        <DialogTitle>Account Restricted</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your account has been restricted by the administrator. Please contact support for more information.
          </DialogContentText>
      </DialogContent>  
      <DialogActions>
        <Button
          variant="contained"
        sx={{
          background: "linear-gradient(90deg, #2ED573 0%, #7BED9F 100%)",
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #7BED9F 0%, #2ED573 100%)",
                },
        }} onClick={() => window.location.href = "/login"} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
    );
  }

  if (!user?.uid) {
    return(
      <Dialog open={!user?.uid} aria-labelledby="alert-dialog-no-user-id-title" aria-describedby="alert-dialog-no-user-id-description">
        <DialogTitle>An Error Occurred</DialogTitle>
        <DialogContent>
          <DialogContentText>
            An unexpected error occurred. Please log in again.          </DialogContentText>
      </DialogContent>  
      <DialogActions>
        <Button
          variant="contained"
        sx={{
          background: "linear-gradient(90deg, #2ED573 0%, #7BED9F 100%)",
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #7BED9F 0%, #2ED573 100%)",
                },
        }} onClick={() => window.location.href = "/login"} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
    );
  }

  if(!user?.emailVerified){
    signOut(auth);
    return (
    <Dialog open={!user?.emailVerified} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle>Email Not Verified</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your email address has not been verified. Please check your inbox for a verification email and follow the instructions to verify your account.
          </DialogContentText>
      </DialogContent>  
      <DialogActions>
        <Button
          variant="contained"
        sx={{
          background: "linear-gradient(90deg, #2ED573 0%, #7BED9F 100%)",
                color: "#fff",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #7BED9F 0%, #2ED573 100%)",
                },
        }} onClick={() => window.location.href = "/login"} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>);
  }

  return <Outlet />;
}

export default ProtectedRoute;
