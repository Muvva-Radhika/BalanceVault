
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    CreditCard,
    FileText,
    History,
    Users,
    ClipboardCheck,
    ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const { user } = useAuth();

    const userLinks = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/apply-account", label: "Apply Account", icon: FileText },
        { to: "/accounts", label: "My Accounts", icon: CreditCard },
        { to: "/transactions", label: "Transactions", icon: History }
    ];

    const adminLinks = [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/applications", label: "Applications", icon: ClipboardCheck },
        { to: "/admin/users", label: "Manage Users", icon: Users },
        { to: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck }
    ];

    const links = user?.role === "ADMIN" ? adminLinks : userLinks;

    return (
        <aside className="sidebar">
            <p className="sidebar-heading">MAIN MENU</p>

            <nav>
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/dashboard" || to === "/admin"}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        <Icon size={19} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <ShieldCheck size={19} />
                <span>Secure Banking Portal</span>
            </div>
        </aside>
    );
};

export default Sidebar;
