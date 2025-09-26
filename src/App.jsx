import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login";
import ProtectedRoute from "./utils/ProtectedRoute/ProtectedRoute";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import DashboardLayout from "./utils/Layout/DashboardLayout";
import Dashboard from "./Pages/Dashboard";
import Map from "./Pages/Map";
import Notification from "./Pages/Notification";
import Report from "./Pages/Report";
import PublicRoute from "./utils/PublicRoute/PublicRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import Profile from "./Pages/Profile.jsx";

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
            { path: "notification", element: <Notification /> },
            { path: "report", element: <Report /> },
            { path: "profile", element: <Profile /> },
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
