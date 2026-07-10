'use client';

type ScheduleType = 'NORMAL' | 'PERIOD' | 'REPEAT';

type ScheduleTypeToggleProps = {
  value: ScheduleType;
  onChange: (type: ScheduleType) => void;
};

const LABELS: Record<ScheduleType, string> = {
  NORMAL: '일반',
  PERIOD: '기간',
  REPEAT: '반복',
};

export default function ScheduleTypeToggle({
  value,
  onChange,
}: ScheduleTypeToggleProps) {
  return (
    <div className="mb-5 flex gap-2">
      {(['NORMAL', 'PERIOD', 'REPEAT'] as ScheduleType[]).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            value === type
              ? 'border-[0.5px] border-[#5E92F0] bg-[#5E92F0] text-white'
              : 'border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] text-[#2C2C2C]'
          }`}
        >
          {LABELS[type]}
        </button>
      ))}
    </div>
  );
}
