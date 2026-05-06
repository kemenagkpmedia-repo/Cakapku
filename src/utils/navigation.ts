import { Role } from '../store/authStore';

export const getDashboardPath = (role: Role | string | undefined): string => {
  const normalizedRole = (role || '').toUpperCase();
  
  switch (normalizedRole) {
    case 'ADMIN':
      return '/admin/users';
    case 'OPERATOR':
      return '/operator/perkin';
    case 'USER':
      return '/user/kinerja';
    case 'PIMPINAN':
      return '/pimpinan/dashboard';
    default:
      return '/user/kinerja';
  }
};
