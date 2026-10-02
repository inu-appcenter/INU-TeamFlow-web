import { LucideIcon } from 'lucide-react';
interface MyPageListProps {
  items: {
    icon: LucideIcon;
    title: string;
    path: string;
  }[];
}

export default function ProfileMenu({ items }: MyPageListProps) {
  return (
    //하드코딩 수정하기
    <nav className="w-full text-[16px] sm:mb-60 sm:h-10 sm:w-[50%] sm:shrink-0 sm:pt-60">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.title}
            href={item.path}
            className="mt-3 mb-3 flex w-full items-center gap-2 place-self-center rounded-2xl border border-[#D6DDE5] bg-white p-4 text-[#2C2C2C] sm:h-20"
          >
            <Icon size={20} />
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}
