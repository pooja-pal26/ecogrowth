import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific role restrictions, allow all authenticated users
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  const userRoleKey = user.role_key || '';
  const userRoleId = String(user.role || '');

  // Admin has access to all routes
  if (userRoleKey === 'admin' || userRoleId === '1' || userRoleId === '17') {
    return children;
  }

  const isAllowed = allowedRoles.some(r => {
    const target = String(r).toLowerCase();
    return target === userRoleKey.toLowerCase() || target === userRoleId;
  });

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="p-8 max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl font-bold border border-red-100">
            &times;
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Your current role (<span className="font-semibold text-gray-800 uppercase text-xs tracking-wider bg-gray-100 px-2.5 py-1 rounded-md">{user.role_name || user.role_key || 'User'}</span>) does not have permission to view this module.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center justify-center w-full px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
