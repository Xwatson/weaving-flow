import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { trpc } from "@/utils/trpc";
import { Spin } from "antd";

const PrivateRoute = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return <Spin />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
