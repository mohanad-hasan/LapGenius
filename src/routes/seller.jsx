import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/seller")({
  component: SellerLayout,
});

function SellerLayout() {
  const { user, isUserLoaded } = useApp();
  if (!isUserLoaded) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "seller" && user.role !== "admin") return <Navigate to="/" />;
  return <Outlet />;
}
