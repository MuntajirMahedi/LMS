import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Module, Action, Role } from '../../config/roles';
import { hasAnyPermission } from '../../config/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: Module;
  action?: Action;
  roles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  module, 
  action = 'view',
  roles 
}) => {
  const { user, activeRole, checkPermission, permissions, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // Layout handles the main loader, but this prevents flickering
  }

  if (!user || !activeRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if specific roles are required
  if (roles && !roles.includes(activeRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check module-based access if specified
  const hasModuleAccess = module
    ? checkPermission(module, action) || (action === 'view' && activeRole ? hasAnyPermission(activeRole, module, permissions) : false)
    : true;

  if (module && !hasModuleAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
