'use client';

type AllDayToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function AllDayToggle({ checked, onChange }: AllDayToggleProps) {
  return (
    <label className="mb-3 flex items-center gap-2">
      <span className="text-[14px] font-medium text-[#2C2C2C]">하루종일</span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors duration-300 ease-in-out ${
          checked ? 'bg-[#5E92F0]' : 'bg-[#D6DDE5]'
        }`}
      >
        <span
          className={`absolute top-1 left-0 h-5 w-5 rounded-full bg-white transition-all duration-300 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}
