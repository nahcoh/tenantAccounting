import api from '../api';

export async function resolvePostLoginRoute() {
  try {
    const response = await api.get('/contracts');
    const contracts = Array.isArray(response.data) ? response.data : [];
    return contracts.length > 0 ? '/cost/calendar' : '/before/documents';
  } catch {
    return '/cost/calendar';
  }
}
