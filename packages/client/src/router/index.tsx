import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Workflow from "@/pages/Workflow";
import Bookmarks from "@/pages/Bookmarks";
import Crawler from "@/pages/Crawler";
import Credentials from "@/pages/Credentials";
import PrivateRoute from "@/components/PrivateRoute";
import WorkflowEdit from "@/pages/Workflow/Edit";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/admin",
    element: <PrivateRoute />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          {
            path: "",
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "workflow",
            children: [
              {
                path: "",
                element: <Workflow />,
              },
              {
                path: "create",
                element: <WorkflowEdit />,
              },
              {
                path: "edit/:id",
                element: <WorkflowEdit />,
              },
            ],
          },
          {
            path: "bookmarks",
            element: <Bookmarks />,
          },
          {
            path: "crawler",
            element: <Crawler />,
          },
          {
            path: "credentials",
            element: <Credentials />,
          },
        ],
      },
    ],
  },
]);

export default router;
