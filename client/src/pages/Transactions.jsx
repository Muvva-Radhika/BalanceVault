
import { useEffect, useState } from "react";
import {
    ArrowDownLeft,
    ArrowUpRight,
    Wallet,
    History,
    RefreshCw,
    CreditCard,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

import api from "../services/api";
import "./Transactions.css";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [amount, setAmount] = useState("");

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const activeAccounts = accounts.filter(
        (account) => account.status === "ACTIVE"
    );

    const selectedAccount = activeAccounts.find(
        (account) => account.id === selectedAccountId
    );

    const money = (paise) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number(paise || 0) / 100);

    const loadData = async () => {
        try {
            setError("");

            const [accountResponse, transactionResponse] =
                await Promise.all([
                    api.get("/accounts/my"),
                    api.get("/transactions/my")
                ]);

            const accountList = accountResponse.data.accounts || [];

            setAccounts(accountList);
            setTransactions(
                transactionResponse.data.transactions || []
            );

            setSelectedAccountId((currentId) => {
                const currentAccount = accountList.find(
                    (account) =>
                        account.id === currentId &&
                        account.status === "ACTIVE"
                );

                if (currentAccount) return currentId;

                return (
                    accountList.find(
                        (account) => account.status === "ACTIVE"
                    )?.id || ""
                );
            });
        } catch (err) {
            console.error("Transaction page error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load your transaction information."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleTransaction = async (type) => {
        setError("");
        setSuccess("");

        if (!selectedAccountId) {
            setError("Please select an active account.");
            return;
        }

        if (
            !amount.trim() ||
            !/^(0|[1-9]\d{0,9})(\.\d{1,2})?$/.test(amount) ||
            Number(amount) <= 0
        ) {
            setError("Enter a valid amount greater than zero.");
            return;
        }

        try {
            setProcessing(true);

            const endpoint =
                type === "CREDIT"
                    ? `/transactions/${selectedAccountId}/deposit`
                    : `/transactions/${selectedAccountId}/withdraw`;

            const response = await api.post(endpoint, {
                amount: amount.trim()
            });

            setSuccess(
                response.data.message ||
                `${type === "CREDIT" ? "Deposit" : "Withdrawal"} completed successfully.`
            );

            setAmount("");

            await loadData();
        } catch (err) {
            console.error(`${type} error:`, err);

            setError(
                err.response?.data?.message ||
                `${type === "CREDIT" ? "Deposit" : "Withdrawal"} failed. Please try again.`
            );
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="page bv-transactions">
                <div className="bv-loading">
                    Loading transaction information...
                </div>
            </div>
        );
    }

    return (
        <div className="page bv-transactions">

            {/* Heading */}
            <div className="bv-page-heading">
                <div>
                    <span className="bv-eyebrow">
                        ACCOUNT MANAGEMENT
                    </span>
                    <h1>Transactions</h1>
                    <p>
                        Manage your money and track all your account activity.
                    </p>
                </div>

                <button
                    className="bv-refresh-btn"
                    onClick={loadData}
                    disabled={processing}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Account overview */}
            <div className="bv-overview-card">
                <div className="bv-overview-icon">
                    <Wallet size={25} />
                </div>

                <div className="bv-overview-info">
                    <span>Selected account balance</span>

                    <h2>
                        {selectedAccount
                            ? money(selectedAccount.balance)
                            : "₹0.00"}
                    </h2>

                    <p>
                        {selectedAccount
                            ? `${selectedAccount.accountType} Account • ${selectedAccount.accountNumber}`
                            : "No active account available"}
                    </p>
                </div>

                <div className="bv-account-status">
                    <span className="bv-status-dot"></span>
                    {selectedAccount ? "Active" : "Unavailable"}
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="bv-message bv-error">
                    <AlertCircle size={19} />
                    {error}
                </div>
            )}

            {success && (
                <div className="bv-message bv-success">
                    <CheckCircle2 size={19} />
                    {success}
                </div>
            )}

            {/* Transaction actions */}
            <div className="bv-section-heading">
                <div>
                    <h2>Manage your money</h2>
                    <p>Choose an account and enter the amount.</p>
                </div>
            </div>

            <div className="bv-action-grid">

                {/* Deposit */}
                <section className="bv-action-card">
                    <div className="bv-action-top">
                        <div className="bv-action-icon bv-deposit-icon">
                            <ArrowDownLeft size={23} />
                        </div>

                        <div>
                            <h3>Deposit Money</h3>
                            <p>Add money to your account.</p>
                        </div>
                    </div>

                    <div className="bv-form-group">
                        <label htmlFor="deposit-account">
                            Select Account
                        </label>

                        <select
                            id="deposit-account"
                            value={selectedAccountId}
                            onChange={(e) =>
                                setSelectedAccountId(e.target.value)
                            }
                            disabled={processing}
                        >
                            <option value="">Select account</option>

                            {activeAccounts.map((account) => (
                                <option
                                    key={account.id}
                                    value={account.id}
                                >
                                    {account.accountNumber} - {account.accountType}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bv-form-group">
                        <label htmlFor="deposit-amount">
                            Deposit Amount (₹)
                        </label>

                        <input
                            id="deposit-amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={processing}
                        />
                    </div>

                    <button
                        className="bv-action-btn bv-deposit-btn"
                        onClick={() => handleTransaction("CREDIT")}
                        disabled={processing || !selectedAccountId}
                    >
                        <ArrowDownLeft size={18} />
                        {processing ? "Processing..." : "Deposit Money"}
                    </button>
                </section>

                {/* Withdraw */}
                <section className="bv-action-card">
                    <div className="bv-action-top">
                        <div className="bv-action-icon bv-withdraw-icon">
                            <ArrowUpRight size={23} />
                        </div>

                        <div>
                            <h3>Withdraw Money</h3>
                            <p>Withdraw from your account balance.</p>
                        </div>
                    </div>

                    <div className="bv-form-group">
                        <label htmlFor="withdraw-account">
                            Select Account
                        </label>

                        <select
                            id="withdraw-account"
                            value={selectedAccountId}
                            onChange={(e) =>
                                setSelectedAccountId(e.target.value)
                            }
                            disabled={processing}
                        >
                            <option value="">Select account</option>

                            {activeAccounts.map((account) => (
                                <option
                                    key={account.id}
                                    value={account.id}
                                >
                                    {account.accountNumber} - {account.accountType}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bv-form-group">
                        <label htmlFor="withdraw-amount">
                            Withdrawal Amount (₹)
                        </label>

                        <input
                            id="withdraw-amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={processing}
                        />
                    </div>

                    <button
                        className="bv-action-btn bv-withdraw-btn"
                        onClick={() => handleTransaction("DEBIT")}
                        disabled={processing || !selectedAccountId}
                    >
                        <ArrowUpRight size={18} />
                        {processing ? "Processing..." : "Withdraw Money"}
                    </button>
                </section>

            </div>

            {/* Transaction history */}
            <section className="bv-history-card">

                <div className="bv-history-heading">
                    <div className="bv-history-title">
                        <div className="bv-history-icon">
                            <History size={21} />
                        </div>

                        <div>
                            <h2>Transaction History</h2>
                            <p>View your recent account transactions.</p>
                        </div>
                    </div>

                    <span className="bv-count">
                        {transactions.length} Records
                    </span>
                </div>

                {transactions.length === 0 ? (
                    <div className="bv-empty-state">
                        <div className="bv-empty-icon">
                            <CreditCard size={30} />
                        </div>

                        <h3>No transactions yet</h3>

                        <p>
                            Your deposits and withdrawals will appear here
                            after a successful transaction.
                        </p>
                    </div>
                ) : (
                    <div className="bv-table-wrapper">
                        <table className="bv-table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Reference</th>
                                    <th>Account</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th className="bv-amount-heading">
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>
                                            {new Date(
                                                transaction.createdAt
                                            ).toLocaleString("en-IN")}
                                        </td>

                                        <td>
                                            {transaction.referenceId || "—"}
                                        </td>

                                        <td>
                                            {transaction.account?.accountNumber || "—"}
                                        </td>

                                        <td>
                                            {transaction.description || "—"}
                                        </td>

                                        <td>
                                            <span
                                                className={`bv-type-badge ${transaction.type === "CREDIT"
                                                    ? "bv-credit"
                                                    : "bv-debit"
                                                    }`}
                                            >
                                                {transaction.type}
                                            </span>
                                        </td>

                                        <td className={
                                            transaction.type === "CREDIT"
                                                ? "bv-credit-amount"
                                                : "bv-debit-amount"
                                        }>
                                            {transaction.type === "CREDIT"
                                                ? "+"
                                                : "-"}
                                            {money(transaction.amount)}
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

export default Transactions;


