import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { useEffect, useState } from "react";

function PublicRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; // optional: add spinner here

  if (user) {
    // ✅ already logged in → send to dashboard
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicRoute;
