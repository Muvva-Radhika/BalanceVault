
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import api from "../services/api";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = async () => {
        try {
            const response = await api.get("/admin/users");
            setUsers(response.data.users || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Could not load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <h1>Manage Users</h1>
                    <p>View registered BalanceVault customers.</p>
                </div>

                <button className="secondary-button" onClick={loadUsers}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}

            <section className="content-card">
                {loading ? (
                    <p className="page-loading">Loading users...</p>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <h3>No users found</h3>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Account Status</th>
                                    <th>Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <span className="status-badge">
                                                {user.isActive ? "ACTIVE" : "INACTIVE"}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ManageUsers;
