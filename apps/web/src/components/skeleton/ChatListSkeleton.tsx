export const ChatRoomListSkeleton = () => {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-2xl bg-[#F8F9FB] p-4"
        >
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[#D6DDE5]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-[#D6DDE5]" />
            <div className="h-3 w-40 animate-pulse rounded bg-[#D6DDE5]" />
          </div>
        </li>
      ))}
    </ul>
  );
};
