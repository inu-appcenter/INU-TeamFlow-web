import Header from '@/components/common/Header';
import { communityGuidelines } from '@moimi/core/constants/policies/index';
import { Suspense } from 'react';

// 글 검색 기능
const isSearch = false;

// 글 작성 기능
const isCreate = false;

// 카테고리 기능
const isCategory = false;

export default function CommunityGuidelines() {
  const prohibitedSection = communityGuidelines.sections.find(
    (section) => section.id === 'prohibited'
  );

  const recommendedSection = communityGuidelines.sections.find(
    (section) => section.id === 'recommended'
  );

  const restrictionSection = communityGuidelines.sections.find(
    (section) => section.id === 'restriction'
  );

  const appealSection = communityGuidelines.sections.find(
    (section) => section.id === 'appeal'
  );

  const changesSection = communityGuidelines.sections.find(
    (section) => section.id === 'changes'
  );

  const contactSection = communityGuidelines.sections.find(
    (section) => section.id === 'contact'
  );

  const prohibitedRulesBlock = prohibitedSection?.blocks.find(
    (block) =>
      block.type === 'ordered-list' &&
      'variant' in block &&
      block.variant === 'cards'
  );

  const emergencyBlock = prohibitedSection?.blocks.find(
    (block) => block.type === 'card'
  );

  const recommendedRulesBlock = recommendedSection?.blocks.find(
    (block) => block.type === 'ordered-list'
  );

  const restrictionParagraphs =
    restrictionSection?.blocks.filter((block) => block.type === 'paragraph') ??
    [];

  const appealParagraphs =
    appealSection?.blocks.filter((block) => block.type === 'paragraph') ?? [];

  const changesParagraphs =
    changesSection?.blocks.filter((block) => block.type === 'paragraph') ?? [];

  const contactCard = contactSection?.blocks.find(
    (block) => block.type === 'card'
  );

  const contactKeyValueBlock = contactCard?.blocks.find(
    (block) => block.type === 'key-value'
  );

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <Suspense fallback={<div className="mt-12 mb-4 h-8" />}>
          <Header
            pageName={communityGuidelines.pageName}
            isSearch={isSearch}
            isCreate={isCreate}
            isCategory={isCategory}
            isBack={false}
          />
        </Suspense>

        <article className="mt-6 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white px-5 py-8 sm:px-10 sm:py-12">
          {/* 소개 */}
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {communityGuidelines.title}
          </h1>

          <div className="mt-6 space-y-3 leading-7 text-gray-700">
            {communityGuidelines.intro.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>

          {/* 금지 사항 */}
          {prohibitedSection && (
            <section className="py-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {prohibitedSection.title}
                </h2>

                {prohibitedSection.blocks[0]?.type === 'paragraph' && (
                  <p className="mt-2 leading-7 text-gray-600">
                    {prohibitedSection.blocks[0].text}
                  </p>
                )}
              </div>

              {prohibitedRulesBlock && (
                <ol className="space-y-4">
                  {prohibitedRulesBlock.items.map((rule, index) => {
                    if (typeof rule === 'string' || !('title' in rule)) {
                      return null;
                    }

                    return (
                      <li
                        key={rule.title}
                        className="rounded-xl border border-gray-200 p-5"
                      >
                        <div className="flex gap-4">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                            {index + 1}
                          </span>

                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {rule.title}
                            </h3>

                            <p className="mt-2 leading-7 text-gray-700">
                              {rule.text}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              {/* 긴급 예외 */}
              {emergencyBlock && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                      13
                    </span>

                    <div>
                      {'title' in emergencyBlock && emergencyBlock.title && (
                        <h3 className="font-semibold text-gray-900">
                          {emergencyBlock.title}
                        </h3>
                      )}

                      {emergencyBlock.blocks.map((block, index) => {
                        if (block.type !== 'paragraph') {
                          return null;
                        }

                        return (
                          <p
                            key={`${block.text}-${index}`}
                            className={
                              block.emphasis
                                ? 'mt-3 leading-7 font-medium text-gray-900'
                                : 'mt-2 leading-7 text-gray-700'
                            }
                          >
                            {block.text}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {prohibitedSection.blocks
                .filter(
                  (block) =>
                    block.type === 'paragraph' &&
                    block !== prohibitedSection.blocks[0]
                )
                .map((block, index) => {
                  if (block.type !== 'paragraph') {
                    return null;
                  }

                  return (
                    <p
                      key={`${block.text}-${index}`}
                      className={
                        'emphasis' in block && block.emphasis
                          ? 'mt-6 leading-7 font-medium text-gray-900'
                          : 'mt-2 leading-7 text-gray-700'
                      }
                    >
                      {block.text}
                    </p>
                  );
                })}
            </section>
          )}

          {/* 권장 행동 */}
          {recommendedSection && (
            <section className="border-t border-gray-200 py-8">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {recommendedSection.title}
              </h2>

              {recommendedSection.blocks[0]?.type === 'paragraph' && (
                <p className="mt-2 leading-7 text-gray-600">
                  {recommendedSection.blocks[0].text}
                </p>
              )}

              {recommendedRulesBlock && (
                <ol className="mt-6 space-y-3">
                  {recommendedRulesBlock.items.map((rule, index) => {
                    const text = typeof rule === 'string' ? rule : rule.text;

                    return (
                      <li
                        key={text}
                        className="flex gap-3 rounded-xl bg-gray-50 px-5 py-4"
                      >
                        <span className="font-semibold text-gray-500">
                          {index + 1}.
                        </span>

                        <span className="leading-7 text-gray-700">{text}</span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          )}

          {/* 이용 제한 */}
          {restrictionSection && (
            <section className="border-t border-gray-200 py-8">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {restrictionSection.title}
              </h2>

              <div className="mt-5 space-y-3 leading-7 text-gray-700">
                {restrictionParagraphs.map((block) => (
                  <p key={block.text}>{block.text}</p>
                ))}
              </div>
            </section>
          )}

          {/* 제재 문의 */}
          {appealSection && (
            <section className="border-t border-gray-200 py-8">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {appealSection.title}
              </h2>

              <div className="mt-5 space-y-3 leading-7 text-gray-700">
                {appealParagraphs.map((block) => (
                  <p key={block.text}>{block.text}</p>
                ))}
              </div>
            </section>
          )}

          {/* 규칙 변경 */}
          {changesSection && (
            <section className="border-t border-gray-200 py-8">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {changesSection.title}
              </h2>

              <div className="mt-5 space-y-3 leading-7 text-gray-700">
                {changesParagraphs.map((block) => (
                  <p key={block.text}>{block.text}</p>
                ))}
              </div>
            </section>
          )}

          {/* 시행일 및 문의 */}
          {contactSection && (
            <footer className="border-t border-gray-200 pt-8">
              <div className="rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-700 sm:text-base">
                {contactKeyValueBlock?.items.map((item) => (
                  <p key={item.label}>
                    <span className="font-medium text-gray-900">
                      {item.label}
                    </span>
                    : {item.value}
                  </p>
                ))}
              </div>
            </footer>
          )}
        </article>
      </div>
    </main>
  );
}
