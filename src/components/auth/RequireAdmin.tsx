import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';

type AuthorizationState = 'checking' | 'allowed' | 'denied';

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [authorization, setAuthorization] = useState<AuthorizationState>('checking');
  const [authorizedUid, setAuthorizedUid] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    if (loading) return () => { isCurrent = false; };
    if (!currentUser) {
      setAuthorization('denied');
      setAuthorizedUid(null);
      return () => { isCurrent = false; };
    }

    setAuthorization('checking');
    setAuthorizedUid(null);
    adminService.verifyAdminStatus(currentUser.uid).then(({ isAdmin }) => {
      if (isCurrent) {
        setAuthorization(isAdmin ? 'allowed' : 'denied');
        setAuthorizedUid(isAdmin ? currentUser.uid : null);
      }
    }).catch(() => {
      if (isCurrent) setAuthorization('denied');
    });

    return () => { isCurrent = false; };
  }, [currentUser?.uid, loading]);

  if (loading || (currentUser && (authorization === 'checking' || authorizedUid !== currentUser.uid))) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] text-stone-300 flex items-center justify-center px-4">
        <p role="status" className="text-sm font-semibold">Verifying administrator access…</p>
      </main>
    );
  }

  if (!currentUser) return <Navigate to="/admin" replace />;
  if (authorization !== 'allowed') return <Navigate to="/admin" replace />;
  return <>{children}</>;
};
