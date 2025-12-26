import { useCallback, useMemo } from 'react';
import DEFAULT_USER from '../constants/default-user';

const STORAGE_KEY = 'user_profile';

export default function useAccountProfile() {
  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_USER, ...JSON.parse(raw) } : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  }, []);

  const save = useCallback((data) => {
    const toSave = { ...DEFAULT_USER, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return toSave;
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const initial = useMemo(load, [load]);

  return { initial, load, save, clear, STORAGE_KEY };
}
