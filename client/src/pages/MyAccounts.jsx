
import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import api from "../services/api";

const MyAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/accounts/my")
            .then((response) => setAccounts(response.data.accounts || []))
            .catch((err) => setError(err.response?.data?.message || "Could not load accounts"))
            .finally(() => setLoading(false));
    }, []);

    const money = (paise) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(Number(paise || 0) / 100);

    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <h1>My Accounts</h1>
                    <p>View your approved bank accounts and balances.</p>
                </div>
            </div>

            {error && <div className="alert error">{error}</div>}

            {loading ? (
                <p className="page-loading">Loading accounts...</p>
            ) : accounts.length === 0 ? (
                <div className="content-card empty-state">
                    <CreditCard size={38} />
                    <h3>No accounts found</h3>
                    <p>Your approved accounts will appear here.</p>
                </div>
            ) : (
                <div className="account-grid">
                    {accounts.map((account) => (
                        <div className="bank-card" key={account.id}>
                            <div className="bank-card-top">
                                <span>BalanceVault</span>
                                <CreditCard />
                            </div>
                            <p className="bank-label">{account.accountType} ACCOUNT</p>
                            <h3>{account.accountNumber}</h3>
                            <div className="bank-card-bottom">
                                <div>
                                    <small>Available Balance</small>
                                    <strong>{money(account.balance)}</strong>
                                </div>
                                <span className="bank-status">{account.status}</span>
                            </div>
                            <small className="currency-label">{account.currency || "INR"}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAccounts;
