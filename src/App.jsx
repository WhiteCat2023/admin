import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login";
import ProtectedRoute from "./utils/ProtectedRoute/ProtectedRoute";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import DashboardLayout from "./utils/Layout/DashboardLayout";
import Dashboard from "./Pages/Dashboard";
import Map from "./Pages/Map";
import Report from "./Pages/Report";
import Forum from "./Pages/Forum";
import PublicRoute from "./utils/PublicRoute/PublicRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import Profile from "./Pages/Profile.jsx";
import ForumPost from "./Pages/ForumPost.jsx";
import AdminUser from "./Pages/AdminUser.jsx";

function App() {
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
          ],
        },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
