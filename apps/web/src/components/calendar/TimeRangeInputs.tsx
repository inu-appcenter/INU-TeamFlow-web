'use client';

type TimeRangeInputsProps = {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
};

export default function TimeRangeInputs({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeRangeInputsProps) {
  return (
    <div className="mb-3 flex gap-3">
      <input
        type="time"
        value={startTime}
        onChange={(e) => onStartTimeChange(e.target.value)}
        className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none"
      />
      <input
        type="time"
        value={endTime}
        onChange={(e) => onEndTimeChange(e.target.value)}
        className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none"
      />
    </div>
  );
}
