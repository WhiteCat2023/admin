import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { useEffect, useState } from "react";
import { CircleLoader } from "react-spinners";

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

  if (!user) {
    // 🚫 no replace → user can still go back after logging in
    // Use replace to prevent navigation flooding
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
