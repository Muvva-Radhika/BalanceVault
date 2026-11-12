
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <Link
                to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="brand"
            >
                <ShieldCheck size={27} />
                <span>BalanceVault</span>
            </Link>

            <div className="navbar-right">
                <span className="user-info">
                    <UserCircle size={19} />
                    {user?.name}
                    <small>{user?.role}</small>
                </span>

                <button className="logout-button" onClick={handleLogout}>
                    <LogOut size={17} />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;
