import { Link, useRouteError } from 'react-router-dom';
import Layout from '../layout/Layout';
import './Error.css';

export default function Error() {
  const error = useRouteError() as any;

  return (
    <Layout>
      <div className="error-page">
        <div className="container">
          <div className="error-content">
            <h1 className="error-code">404</h1>
            <h2 className="error-title">Oops! Page not found</h2>
            <p className="error-message">
              {error?.statusText || error?.message || 'The page you are looking for does not exist.'}
            </p>
            <Link to="/" className="btn-primary">Go Back Home</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}