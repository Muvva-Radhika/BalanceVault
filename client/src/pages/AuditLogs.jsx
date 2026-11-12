
import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import api from "../services/api";

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadLogs = async () => {
        try {
            const response = await api.get("/admin/audit-logs");
            setLogs(response.data.logs || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Could not load audit logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <h1>Audit Logs</h1>
                    <p>Track administrative and account-related activities.</p>
                </div>

                <button className="secondary-button" onClick={loadLogs}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}

            <section className="content-card">
                {loading ? (
                    <p className="page-loading">Loading audit logs...</p>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <ShieldCheck size={38} />
                        <h3>No audit records found</h3>
                        <p>Recorded system actions will appear here.</p>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Actor</th>
                                    <th>Action</th>
                                    <th>Entity</th>
                                    <th>Entity ID</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.createdAt).toLocaleString("en-IN")}</td>
                                        <td>{log.actor?.email || "System"}</td>
                                        <td>{log.action}</td>
                                        <td>{log.entityType}</td>
                                        <td>{log.entityId || "—"}</td>
                                        <td>
                                            <pre className="metadata">
                                                {JSON.stringify(log.metadata || {}, null, 2)}
                                            </pre>
                                        </td>
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

export default AuditLogs;
