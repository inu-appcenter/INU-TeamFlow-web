import { Suspense } from 'react';
import Header from '@/components/common/Header';
import { youthProtectionPolicy } from '@moimi/core/constants/policies/index';

// 글 검색 기능
const isSearch = false;

// 글 작성 기능
const isCreate = false;

// 카테고리 기능
const isCategory = false;

export default function YouthProtectionPolicy() {
  const under14Section = youthProtectionPolicy.sections.find(
    (section) => section.id === 'under-14'
  );

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <Suspense fallback={<div className="mt-12 mb-4 h-8" />}>
          <Header
            pageName={youthProtectionPolicy.pageName}
            isSearch={isSearch}
            isCreate={isCreate}
            isCategory={isCategory}
            isBack={false}
          />
        </Suspense>

        <article className="mt-6 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white px-5 py-8 sm:px-10 sm:py-12">
          <header className="border-b border-gray-200 pb-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {youthProtectionPolicy.title}
            </h1>
          </header>

          {under14Section && (
            <section className="py-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">
                {under14Section.title}
              </h2>

              <div className="space-y-4 leading-7 text-gray-700">
                {under14Section.blocks.map((block) => {
                  if (block.type !== 'paragraph') {
                    return null;
                  }

                  return <p key={block.text}>{block.text}</p>;
                })}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}
