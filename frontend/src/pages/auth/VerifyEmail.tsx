import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../Features/auth/authAPI';
import './VerifyEmail.css';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authAPI.verify(email, code);
      setSuccess(res.message || 'Email verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-sub">Enter the 6-digit verification code sent to your email</p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Verification Code</label>
              <input
                type="text"
                className="auth-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., 123456"
                maxLength={6}
                required
              />
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <p className="auth-footer">
              <Link to="/register" className="auth-link">Resend code</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}