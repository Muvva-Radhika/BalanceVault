
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, ShieldCheck, ArrowRight } from "lucide-react";
import api from "../services/api";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersResponse, applicationsResponse] = await Promise.all([
                    api.get("/admin/users"),
                    api.get("/onboarding/admin/all")
                ]);

                setUsers(usersResponse.data.users || []);
                setApplications(applicationsResponse.data.applications || []);
            } catch (err) {
                setError(err.response?.data?.message || "Could not load admin dashboard");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <p className="page-loading">Loading admin dashboard...</p>;

    const pending = applications.filter(
        (application) => application.status === "PENDING"
    ).length;

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage users and review account applications.</p>
                </div>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><Users /></div>
                    <span>Total Users</span>
                    <h2>{users.length}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange"><FileText /></div>
                    <span>Total Applications</span>
                    <h2>{applications.length}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green"><ShieldCheck /></div>
                    <span>Pending Applications</span>
                    <h2>{pending}</h2>
                </div>
            </div>

            <div className="quick-links">
                <Link to="/admin/applications" className="quick-link">
                    <FileText />
                    <span>
                        <strong>Review Applications</strong>
                        <small>Approve or reject customer applications</small>
                    </span>
                    <ArrowRight />
                </Link>

                <Link to="/admin/users" className="quick-link">
                    <Users />
                    <span>
                        <strong>Manage Users</strong>
                        <small>View registered customers</small>
                    </span>
                    <ArrowRight />
                </Link>

                <Link to="/admin/audit-logs" className="quick-link">
                    <ShieldCheck />
                    <span>
                        <strong>Audit Logs</strong>
                        <small>Review recorded administrative actions</small>
                    </span>
                    <ArrowRight />
                </Link>
            </div>

            <section className="content-card">
                <div className="section-heading">
                    <h2>Recent Applications</h2>
                    <Link to="/admin/applications">View all <ArrowRight size={15} /></Link>
                </div>

                {applications.length === 0 ? (
                    <div className="empty-state">
                        <p>No applications have been submitted.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Account Type</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.slice(0, 5).map((application) => (
                                    <tr key={application.id}>
                                        <td>{application.user?.name || "Customer"}</td>
                                        <td>{application.accountType}</td>
                                        <td>{new Date(application.createdAt).toLocaleDateString("en-IN")}</td>
                                        <td><span className="status-badge">{application.status}</span></td>
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

export default AdminDashboard;
