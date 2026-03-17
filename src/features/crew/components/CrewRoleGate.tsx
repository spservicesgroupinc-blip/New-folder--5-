import React, { ReactNode } from 'react';
import { useCrewRole } from '../hooks/useCrewRole';
import { CrewRole } from '../types/crew.types';

interface CrewRoleGateProps {
  role: 'supervisor' | 'technician';
  children: ReactNode;
  fallback?: ReactNode;
}

export function CrewRoleGate({ role, children, fallback = null }: CrewRoleGateProps) {
  const { crewRole } = useCrewRole();

  const allowed: CrewRole[] =
    role === 'supervisor'
      ? ['supervisor']
      : ['supervisor', 'technician'];

  if (!allowed.includes(crewRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
