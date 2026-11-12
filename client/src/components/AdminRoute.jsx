
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                Loading Admin Dashboard...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const role = user.role?.toUpperCase();

    if (role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;

