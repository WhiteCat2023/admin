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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const result = await getUserInfoFromFirestore(currentUser.uid);
        if (result.status === 200) {
          console.log(result);
          setUserDoc(result.data);
          setLoading(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    userDoc,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
