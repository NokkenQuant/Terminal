export const MACRO_GROUP_OPTIONS = [
  'SOJA',
  'MILHO',
  'TRIGO',
  'CAFE',
  'ALGODAO',
  'BOI',
  'ACUCAR',
  'ARROZ',
  'ETANOL',
  'FEIJAO',
  'FRANGO',
  'MANDIOCA',
  'OVOS',
  'SUINO',
  'TILAPIA',
  'LEITE',
  'OUTROS',
] as const;

export type MacroGroup = (typeof MACRO_GROUP_OPTIONS)[number];

export const ALL_MACRO_GROUPS = 'TODOS';

export function normalizeMacroGroup(value: string | null | undefined): MacroGroup | typeof ALL_MACRO_GROUPS {
  if (!value) return ALL_MACRO_GROUPS;
  const upper = value.toUpperCase();
  if (upper === ALL_MACRO_GROUPS) return ALL_MACRO_GROUPS;
  const match = MACRO_GROUP_OPTIONS.find((group) => group === upper);
  return match || ALL_MACRO_GROUPS;
}
