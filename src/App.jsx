import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login";
import ProtectedRoute from "./utils/ProtectedRoute/ProtectedRoute";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import DashboardLayout from "./utils/Layout/DashboardLayout";
import Dashboard from "./Pages/Dashboard";
import Map from "./Pages/Map";
import Report from "./Pages/Report";
import Forum from "./Pages/Forum/Forum.jsx";
import PublicRoute from "./utils/PublicRoute/PublicRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import Profile from "./Pages/Profile.jsx";
import ForumPost from "./Pages/Forum/ForumPost.jsx";
import AdminUser from "./Pages/Admin/AdminUser.jsx";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./utils/theme/theme.js";
import { useEffect } from "react";
import SignUpAdmin from "./Pages/Admin/SignUpAdmin.jsx";
import Sos from "./Pages/Sos.jsx";
import Cms from "./Pages/CMS/Cms.jsx";
import TermsAndConditions from "./Pages/CMS/subpages/TermsAndConditions.jsx";

function App() {
  useEffect(() => {
    const id = "poppins-font-stylesheet";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: "/signup",
      element: (
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      ),
    },

    // ✅ all protected routes
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          element: <DashboardLayout />,
          children: [
            { index: true, element: <Dashboard /> },
            // { path: "dashboard", element: <Dashboard /> },
            { path: "map", element: <Map /> },
            { path: "report", element: <Report /> },
            { path: "forum", element: <Forum /> },
            { path: "profile", element: <Profile /> },
            { path: "/forum/:id", element: <ForumPost /> },
            { path: "admin-users", element: <AdminUser /> },
            { path: "cms", element: <Cms />,},
            { path: "cms/terms-and-conditions", element: <TermsAndConditions />},
            { path: "/admin-users/signup-admin", element: <SignUpAdmin /> },
            { path: "sos", element: <Sos /> }
          ],
        },
      ],
    },
  ]);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
