
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";


const Login = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (user) {
        return (
            <Navigate
                to={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                replace
            />
        );
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await login(email, password);
            navigate(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <ShieldCheck size={35} />
                </div>

                <h1>Welcome Back</h1>
                <p className="auth-subtitle">
                    Sign in to access your BalanceVault account.
                </p>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button className="primary-button full-button" disabled={loading}>
                        <LockKeyhole size={17} />
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>

            </div>
        </div>
    );
};

export default Login;
