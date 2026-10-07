const IMG = '/images/mobile-notice';

// 4각 반짝이
function Sparkle({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`absolute aspect-square ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z"
        fill="#9DB9F2"
      />
    </svg>
  );
}

export default function MobileNoticePage() {
  return (
    <main className="fixed inset-0 overflow-y-auto bg-[#E3ECFB]">
      <div className="relative h-full min-h-[640px] w-full overflow-hidden">
        {/* 배경 원
        <div className="absolute top-[-3%] right-[-18%] aspect-square w-[58%] rounded-full bg-[#DBE8FF]" />
        <div className="absolute top-[52%] left-[-22%] aspect-square w-[50%] rounded-full bg-[#DBE8FF]" />
        <div className="absolute right-[-15%] bottom-[6%] aspect-square w-[40%] rounded-full bg-[#DBE8FF]" /> */}

        {/* 일러스트 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/people.webp`}
          alt=""
          className="absolute top-[4%] left-[45%] w-[31%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/calendar.webp`}
          alt=""
          className="absolute top-[11%] left-[-2%] w-[35%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/checklist.webp`}
          alt=""
          className="absolute top-[20%] right-[-1%] w-[33%]"
        />

        {/* 반짝이: 캘린더 아래 */}
        <Sparkle className="top-[33%] left-[15%] w-[3.5%]" />
        <Sparkle className="top-[35%] left-[10%] w-[5%]" />

        {/* 반짝이: 사람 아이콘과 체크리스트 사이 */}
        <Sparkle className="top-[20%] left-[82.5%] w-[3.5%]" />
        <Sparkle className="top-[22%] left-[86.5%] w-[5%]" />

        {/* 문구 */}
        <div className="absolute top-[38%] left-0 flex w-full flex-col items-center px-6 text-center">
          <div className="mb-5 flex items-end justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.svg" alt="Moimi" className="h-7" />
          </div>
          <p className="text-[22px] font-bold text-[#2C2C2C]">
            PC 또는 태블릿으로 접속해주세요
          </p>
          <p className="mt-10 text-[20px] font-bold text-[#4F80D9]">
            모바일 앱은 곧 출시 예정이에요
          </p>
        </div>

        {/* 캐릭터 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${IMG}/moa.webp`}
          alt="moa"
          className="absolute bottom-[-8%] left-1/2 w-[75%] -translate-x-1/2"
        />
      </div>
    </main>
  );
}
