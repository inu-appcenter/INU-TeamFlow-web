'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useSchoolVerificationGuard } from '@/hooks/useSchoolVerificationGuard';
import { ChevronLeft, Search, ChevronDown, Plus } from 'lucide-react';
import { useErrorToast } from '@/hooks/useErrorToast';

// //이걸 복붙해서 사용해주세요
// //Header 연결을 위한 입력 공간
// //1. 페이지 이름을 입력해주세요
// const pageName = '스크랩';

// //2. 글 검색 기능 있어야돼요? 답변은 true와 false로 해주세요
// const isSearch = true;
// //검색 필터를 입력해주세요
// const searchFilter = [
//   //예시 { value: 'title', label: '제목' },
// ];

// //3. 글 작성 기능 있어야돼요? 답변은 true와 false로 해주세요
// const isCreate = true;

// //4. 카테고리 기능 있어야돼요? 답변은 true와 false로 해주세요
// const isCategory = true;
// // 메인 함수 안에 넣어주세요
// const [keyword, setKeyword] = useState('');
// const [searchType, setSearchType] = useState('title');
// const [selectedCategory, setSelectedCategory] = useState('ALL');
// // 헤더 위치에 넣어주세요
/* <Header
  pageName={pageName}
  isSearch={isSearch}
  isCreate={isCreate}
  isCategory={isCategory}
  searchFilter={searchFilter}
  categories={categoryFilterOptions}
  keyword={keyword}
  searchType={searchType}
  selectedCategory={selectedCategory}
  onKeywordChange={setKeyword}
  onSearchTypeChange={setSearchType}
  onCategoryChange={setSelectedCategory}
/>; */

interface Category {
  value: string;
  label: string;
}
interface DetailTopBarProps {
  pageName?: string;
  categories?: Category[];
  isCreate?: boolean;
  isSearch?: boolean;
  searchFilter?: Category[];
  isCategory?: boolean;

  keyword?: string;
  searchType?: string;
  selectedCategory?: string;

  onKeywordChange?: (keyword: string) => void;
  onSearchTypeChange?: (searchType: string) => void;
  onCategoryChange?: (category: string) => void;
}

export default function Header({
  categories = [],
  pageName,
  isCreate,
  isSearch,
  searchFilter = [],
  isCategory,
  keyword = '',
  searchType = 'title',
  selectedCategory = 'ALL',
  onKeywordChange,
  onSearchTypeChange,
  onCategoryChange,
}: DetailTopBarProps) {
  const pathname = usePathname();
  const parentRoute = pathname.split('/').filter(Boolean).at(-2) ?? '';

  const router = useRouter();
  const searchParams = useSearchParams();

  const { showErrorMessage } = useErrorToast(
    1800,
    searchParams.get('error') === 'school-verification-required'
      ? '학교 인증 후 이용 가능합니다'
      : ''
  );
  const { checkVerified } = useSchoolVerificationGuard(showErrorMessage);

  return (
    <main>
      {/* 헤더 */}
      <header className="mt-12 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${parentRoute}`)}
            className="cursor-pointer text-[#2C2C2C]"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>

          <h1 className="text-2xl font-bold text-[#2C2C2C]">{pageName}</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {isSearch && (
            <div className="flex h-10 flex-1 items-center overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-white md:w-100 md:flex-none">
              <div className="relative h-full">
                <select
                  value={searchType}
                  onChange={(e) => onSearchTypeChange?.(e.target.value)}
                  className="h-full appearance-none rounded-l-xl border-r-[0.5px] border-[#D6DDE5]/60 px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
                >
                  {searchFilter?.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#2C2C2C]">
                  <ChevronDown size={14} />
                </span>
              </div>
              <div className="flex flex-1 items-center gap-3 px-3">
                <Search size={18} className="text-[#b0b0b0]" />

                <input
                  value={keyword}
                  onChange={(e) => onKeywordChange?.(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="w-full bg-transparent text-[#2C2C2C] outline-none placeholder:text-[#b0b0b0]"
                />
              </div>
            </div>
          )}
          {isCreate && (
            <button
              type="button"
              onClick={() => {
                if (!checkVerified()) return;
                router.push(`${pathname}/create`);
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center gap-1 rounded-full bg-[#5E92F0] text-white transition-all duration-150 active:scale-95 sm:w-auto sm:rounded-lg sm:px-4"
            >
              <Plus size={16} strokeWidth={2.5} />

              <span className="hidden sm:inline">{pageName}글 작성</span>
            </button>
          )}
        </div>
      </header>
      {isCategory && (
        <div className="mb-4 rounded-t-2xl bg-white pt-4">
          {/* 카테고리 */}
          <div className="relative flex">
            {categories?.map((category) => {
              const isActive = selectedCategory === category.value;

              return (
                <button
                  key={category.value}
                  onClick={() => onCategoryChange?.(category.value)}
                  className={`relative z-50 flex-1 cursor-pointer pb-4 text-center text-lg font-bold whitespace-nowrap transition sm:text-xl ${
                    isActive
                      ? 'text-[#5E92F0]'
                      : 'text-[#CBD2DA] hover:text-[#5E92F0]'
                  }`}
                >
                  {category.label}
                  {isActive && (
                    <motion.div
                      layoutId="categoryIndicator"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-[#5E92F0]"
                      transition={{
                        type: 'spring',
                        stiffness: 600,
                        damping: 50,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
