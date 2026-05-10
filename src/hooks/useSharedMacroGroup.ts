import { useEffect, useState } from 'react';
import { ALL_MACRO_GROUPS, normalizeMacroGroup } from '../data/macroGroups';

const STORAGE_KEY = 'agri_terminal_shared_macro_group';

export function useSharedMacroGroup(initialValue: string = ALL_MACRO_GROUPS) {
  const [macroGroup, setMacroGroup] = useState<string>(() => {
    if (typeof window === 'undefined') return normalizeMacroGroup(initialValue);
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return normalizeMacroGroup(saved || initialValue);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, normalizeMacroGroup(macroGroup));
  }, [macroGroup]);

  return [macroGroup, setMacroGroup] as const;
}
