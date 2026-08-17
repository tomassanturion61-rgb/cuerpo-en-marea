export function useAuth() {
  const ok = localStorage.getItem('cem_auth') === '1'
  return { session: ok ? true : null, loading: false }
}
