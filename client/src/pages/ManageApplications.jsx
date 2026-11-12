
import { useEffect, useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import api from "../services/api";

const ManageApplications = () => {
    const [applications, setApplications] = useState([]);
    const [remarks, setRemarks] = useState({});
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState(null);

    const loadApplications = async () => {
        try {
            const response = await api.get("/onboarding/admin/all");
            setApplications(response.data.applications || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Could not load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, []);

    const review = async (id, status) => {
        setError("");
        setMessage("");
        setProcessingId(id);

        try {
            const response = await api.patch(`/onboarding/admin/${id}/review`, {
                status,
                remarks: remarks[id] || ""
            });

            setMessage(response.data.message || `Application ${status.toLowerCase()}`);
            await loadApplications();
        } catch (err) {
            setError(err.response?.data?.message || "Could not review application");
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = filter === "ALL"
        ? applications
        : applications.filter((item) => item.status === filter);

    if (loading) return <p className="page-loading">Loading applications...</p>;

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <h1>Manage Applications</h1>
                    <p>Review customer requests for Savings and Current Accounts.</p>
                </div>

                <button className="secondary-button" onClick={loadApplications}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {message && <div className="alert success">{message}</div>}
            {error && <div className="alert error">{error}</div>}

            <div className="filter-row">
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                    <button
                        key={status}
                        className={`filter-button ${filter === status ? "selected" : ""}`}
                        onClick={() => setFilter(status)}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="content-card empty-state">
                    <h3>No applications found</h3>
                    <p>There are no applications under this filter.</p>
                </div>
            ) : (
                <div className="application-list">
                    {filtered.map((application) => (
                        <div className="content-card application-card" key={application.id}>
                            <div className="application-top">
                                <div>
                                    <h3>{application.user?.name || "Customer"}</h3>
                                    <p>{application.user?.email || "Email unavailable"}</p>
                                </div>
                                <span className="status-badge">{application.status}</span>
                            </div>

                            <div className="application-details">
                                <p><strong>Account Type:</strong> {application.accountType}</p>
                                <p><strong>Applied:</strong> {new Date(application.createdAt).toLocaleString("en-IN")}</p>
                                <p><strong>Note:</strong> {application.applicationNote || "No additional note"}</p>
                                {application.remarks && (
                                    <p><strong>Previous remarks:</strong> {application.remarks}</p>
                                )}
                            </div>

                            {application.status === "PENDING" && (
                                <>
                                    <label>Review Remarks</label>
                                    <textarea
                                        rows="2"
                                        value={remarks[application.id] || ""}
                                        onChange={(e) => setRemarks({
                                            ...remarks,
                                            [application.id]: e.target.value
                                        })}
                                        placeholder="Enter remarks for the applicant"
                                    />

                                    <div className="action-row">
                                        <button
                                            className="approve-button"
                                            disabled={processingId === application.id}
                                            onClick={() => review(application.id, "APPROVED")}
                                        >
                                            <Check size={16} /> Approve
                                        </button>

                                        <button
                                            className="reject-button"
                                            disabled={processingId === application.id}
                                            onClick={() => review(application.id, "REJECTED")}
                                        >
                                            <X size={16} /> Reject
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageApplications;
