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

  const contactSection = youthProtectionPolicy.sections.find(
    (section) => section.id === 'contact'
  );

  const contactCard = contactSection?.blocks.find(
    (block) => block.type === 'card'
  );

  const contactKeyValue = contactCard?.blocks.find(
    (block) => block.type === 'key-value'
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

            <p className="mt-3 text-sm text-gray-500">
              시행일: {youthProtectionPolicy.effectiveDate}
            </p>
          </header>

          <div className="divide-y divide-gray-200">
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

            {contactSection && contactKeyValue && (
              <section className="pt-8">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">
                  {contactSection.title}
                </h2>

                <div className="rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-700 sm:text-base">
                  {contactKeyValue.items.map((item) => (
                    <p key={item.label}>
                      <span className="font-medium text-gray-900">
                        {item.label}
                      </span>
                      :{' '}
                      {'href' in item && item.href ? (
                        <a
                          href={item.href}
                          className="underline underline-offset-4"
                        >
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
