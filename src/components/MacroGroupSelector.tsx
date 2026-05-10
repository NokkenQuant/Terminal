import React from 'react';
import { Layers } from 'lucide-react';
import { ALL_MACRO_GROUPS, MACRO_GROUP_OPTIONS } from '../data/macroGroups';

type Props = {
  value: string;
  onChange: (value: string) => void;
  includeAll?: boolean;
  label?: string;
  className?: string;
};

export default function MacroGroupSelector({
  value,
  onChange,
  includeAll = true,
  label = 'Macro grupo',
  className = '',
}: Props) {
  const options = includeAll ? [ALL_MACRO_GROUPS, ...MACRO_GROUP_OPTIONS] : [...MACRO_GROUP_OPTIONS];

  return (
    <div className={className}>
      <label className="block text-[10px] uppercase text-[#c3c8c1] mb-1 font-bold">{label}</label>
      <div className="relative">
        <Layers size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9da39d]" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#0d0f0d] border border-[#434843]/20 rounded-lg py-2 pl-8 pr-3 text-xs text-[#e2e3df] min-w-[160px]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
