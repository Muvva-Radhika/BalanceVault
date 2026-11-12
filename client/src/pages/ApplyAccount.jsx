
import { useEffect, useState } from "react";
import api from "../services/api";

const ApplyAccount = () => {
    const [accountType, setAccountType] = useState("SAVINGS");
    const [applicationNote, setApplicationNote] = useState("");
    const [application, setApplication] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get("/onboarding/me")
            .then((response) => {
                const current = response.data.application || null;
                setApplication(current);
                if (current) {
                    setAccountType(current.accountType);
                    setApplicationNote(current.applicationNote || "");
                }
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Could not load application");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setSubmitting(true);

        try {
            const response = await api.post("/onboarding", {
                accountType,
                applicationNote
            });

            setApplication(response.data.application);
            setMessage(response.data.message || "Application submitted successfully");
        } catch (err) {
            setError(err.response?.data?.message || "Application submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="page-loading">Loading application...</p>;

    const isPending = application?.status === "PENDING";

    return (
        <div className="page narrow-page">
            <div className="page-heading">
                <div>
                    <h1>Apply for an Account</h1>
                    <p>Choose the account you want to open.</p>
                </div>
            </div>

            {message && <div className="alert success">{message}</div>}
            {error && <div className="alert error">{error}</div>}

            {application && (
                <div className="content-card application-status-card">
                    <h3>Current application</h3>
                    <p>Account type: <strong>{application.accountType}</strong></p>
                    <p>Status: <span className="status-badge">{application.status}</span></p>
                    {application.remarks && <p>Admin remarks: {application.remarks}</p>}
                    {isPending && (
                        <p>Your application is waiting for administrator review.</p>
                    )}
                    {application.status === "APPROVED" && (
                        <p>Your application was approved. Check My Accounts for your account.</p>
                    )}
                    {application.status === "REJECTED" && (
                        <p>Your application was rejected. You may submit a new application.</p>
                    )}
                </div>
            )}

            {!isPending && application?.status !== "APPROVED" && (
                <form className="content-card form-card" onSubmit={handleSubmit}>
                    <h2>{application?.status === "REJECTED" ? "Submit a New Application" : "Account Details"}</h2>

                    <label>Choose Account Type</label>

                    <div className="account-options">
                        <label className={`account-option ${accountType === "SAVINGS" ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="accountType"
                                value="SAVINGS"
                                checked={accountType === "SAVINGS"}
                                onChange={(e) => setAccountType(e.target.value)}
                            />
                            <span>
                                <strong>Savings Account</strong>
                                <small>For personal savings and everyday banking.</small>
                            </span>
                        </label>

                        <label className={`account-option ${accountType === "CURRENT" ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="accountType"
                                value="CURRENT"
                                checked={accountType === "CURRENT"}
                                onChange={(e) => setAccountType(e.target.value)}
                            />
                            <span>
                                <strong>Current Account</strong>
                                <small>For business and frequent transactions.</small>
                            </span>
                        </label>
                    </div>

                    <label>Application Note (Optional)</label>
                    <textarea
                        rows="4"
                        maxLength="500"
                        value={applicationNote}
                        onChange={(e) => setApplicationNote(e.target.value)}
                        placeholder="Enter any additional information"
                    />

                    <button className="primary-button" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ApplyAccount;
