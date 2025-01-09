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
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "/admin",
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "/admin/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/admin/workflow",
        element: <Workflow />,
      },
      {
        path: "/admin/bookmarks",
        element: <Bookmarks />,
      },
      {
        path: "/admin/crawler",
        element: <Crawler />,
      },
      {
        path: "/admin/credentials",
        element: <Credentials />,
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
]);

export default router;
