import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AdminRequired({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}