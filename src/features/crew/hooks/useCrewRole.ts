import { useCalculator } from '../../../../context/CalculatorContext';
import { CrewRole } from '../types/crew.types';

interface UseCrewRoleResult {
  role: 'admin' | 'crew';
  isAdmin: boolean;
  isCrew: boolean;
  crewRole: CrewRole;
  username: string;
}

export function useCrewRole(): UseCrewRoleResult {
  const { state } = useCalculator();
  const session = state.session;

  const role: 'admin' | 'crew' = session?.role ?? 'crew';
  const isAdmin = role === 'admin';
  const isCrew = role === 'crew';
  const username = session?.username ?? '';

  // Default crew role is 'technician'; supervisors would need
  // a separate field in UserSession — fall back gracefully.
  const crewRole: CrewRole = isCrew ? 'technician' : 'supervisor';

  return { role, isAdmin, isCrew, crewRole, username };
}
