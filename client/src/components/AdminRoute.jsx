
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return user.role === "ADMIN"
        ? <Outlet />
        : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
