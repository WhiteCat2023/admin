import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../utils/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserInfoFromFirestore } from "../utils/controller/users.controller";
import { getUserDoc } from "../utils/services/firebase/users.services";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const result = await getUserInfoFromFirestore(currentUser.uid);
        if (result.status === 200) {
          console.log(result);
          setUserDoc(result.data);
          setRole(result.data.role); // Set the role from userDoc data
          setLoading(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("User role updated:", userDoc);
  }, [userDoc]);

  const refetchUserDoc = async () => {
    if (user) {
      const result = await getUserInfoFromFirestore(user.uid);
      if (result.status === 200) {
        setUserDoc(result.data);
        setRole(result.data.role); // Update the role if userDoc is refetched
      }
    }
  };

  const clearSession = () => {
    setUser(null);
    setUserDoc(null);
    setRole(null);
    setLoading(false);
  };

  const value = {
    user,
    loading,
    userDoc,
    role, // Expose the role
    refetchUserDoc,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
