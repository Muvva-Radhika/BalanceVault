
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, FileText, History, ArrowRight } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const UserDashboard = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const accountResponse = await api.get("/accounts/my");
                setAccounts(accountResponse.data.accounts || []);
            } catch (err) {
                console.error("Accounts API error:", err.response?.data || err);
                setError(err.response?.data?.message || "Could not load accounts");
            }

            try {
                const applicationResponse = await api.get("/onboarding/me");
                setApplication(applicationResponse.data.application || null);
            } catch (err) {
                console.error("Onboarding API error:", err.response?.data || err);
            }

            setLoading(false);
        };

        loadDashboard();
    }, []);

    const totalBalance = accounts.reduce(
        (sum, account) => sum + Number(account.balance || 0),
        0
    );

    const money = (paise) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(Number(paise || 0) / 100);

    if (loading) return <p className="page-loading">Loading dashboard...</p>;

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <h1>Welcome, {user?.name}</h1>
                    <p>Here is an overview of your BalanceVault activity.</p>
                </div>
                <Link to="/apply-account" className="primary-button">
                    Apply for Account
                </Link>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><CreditCard /></div>
                    <span>Total Accounts</span>
                    <h2>{accounts.length}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green"><CreditCard /></div>
                    <span>Total Balance</span>
                    <h2>{money(totalBalance)}</h2>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange"><FileText /></div>
                    <span>Application Status</span>
                    <h2 className="status-text">
                        {application?.status || "Not Applied"}
                    </h2>
                </div>
            </div>

            <section className="content-card">
                <div className="section-heading">
                    <h2>My Accounts</h2>
                    <Link to="/accounts">View all <ArrowRight size={15} /></Link>
                </div>

                {accounts.length === 0 ? (
                    <div className="empty-state">
                        <CreditCard size={35} />
                        <h3>No accounts available</h3>
                        <p>Apply for a Savings or Current Account to get started.</p>
                        <Link to="/apply-account" className="primary-button">
                            Apply Now
                        </Link>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Account Number</th>
                                    <th>Account Type</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.slice(0, 5).map((account) => (
                                    <tr key={account.id}>
                                        <td>{account.accountNumber}</td>
                                        <td>{account.accountType}</td>
                                        <td>{money(account.balance)}</td>
                                        <td><span className="status-badge">{account.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <div className="quick-links">
                <Link to="/apply-account" className="quick-link">
                    <FileText />
                    <span><strong>Apply for an account</strong><small>Submit a new application</small></span>
                    <ArrowRight />
                </Link>

                <Link to="/transactions" className="quick-link">
                    <History />
                    <span><strong>Transaction history</strong><small>View your account activity</small></span>
                    <ArrowRight />
                </Link>
            </div>
        </div>
    );
};

export default UserDashboard;
