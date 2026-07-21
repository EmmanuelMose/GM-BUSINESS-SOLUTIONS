import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../Features/auth/authAPI';
import './ForgetPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authAPI.forgotPassword(email);
      setSuccess(res.message || 'Reset code sent to your email.');
      setTimeout(() => {
        navigate('/verify-code', { state: { email } });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-sub">Enter your email to receive a password reset code</p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>

            <p className="auth-footer">
              Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}