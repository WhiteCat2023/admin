import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { useEffect, useState } from "react";
import { CircleLoader } from "react-spinners";
import Swal from "sweetalert2";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

function  ProtectedRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const override = {
    display: "block",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderColor: "red",
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // Firebase restores session here
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <CircleLoader cssOverride={override} />;
  }

  // if (!user) {
  //   // 🚫 no replace → user can still go back after logging in
  //   // Use replace to prevent navigation flooding
  //   return <Navigate to="/login" replace />;
  // }

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
