export default function TeamListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 pb-32 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl bg-[#F8F9FB]"
        >
          <div className="h-12 bg-[#E5E9EF]" />

          <div className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-5 w-2/5 rounded bg-[#E5E9EF]" />
              <div className="h-5 w-5 rounded bg-[#E5E9EF]" />
            </div>

            <div className="mb-6 h-4 w-3/4 rounded bg-[#E5E9EF]" />

            <div className="flex items-center justify-between">
              <div className="h-6 w-14 rounded-full bg-[#E5E9EF]" />
              <div className="h-4 w-8 rounded bg-[#E5E9EF]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
