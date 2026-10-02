import { Suspense } from 'react';
import Header from '@/components/common/Header';
import { termsPolicy } from '@moimi/core/constants/policies/index';

const isSearch = false;
const isCreate = false;
const isCategory = false;

const sectionTitleClass =
  'mb-4 text-xl font-semibold text-gray-900 sm:text-2xl';

type TermsBlock = (typeof termsPolicy.sections)[number]['blocks'][number];

type ParagraphBlock = Extract<TermsBlock, { type: 'paragraph' }>;
type OrderedListBlock = Extract<TermsBlock, { type: 'ordered-list' }>;
type CardBlock = Extract<TermsBlock, { type: 'card' }>;
type KeyValueBlock = Extract<TermsBlock, { type: 'key-value' }>;

const isParagraph = (block: TermsBlock): block is ParagraphBlock =>
  block.type === 'paragraph';

const isOrderedList = (block: TermsBlock): block is OrderedListBlock =>
  block.type === 'ordered-list';

const isCard = (block: TermsBlock): block is CardBlock => block.type === 'card';

const isKeyValue = (block: TermsBlock): block is KeyValueBlock =>
  block.type === 'key-value';

export default function TermsPage() {
  const purposeSection = termsPolicy.sections.find(
    (section) => section.id === 'purpose'
  );

  const serviceSection = termsPolicy.sections.find(
    (section) => section.id === 'service'
  );

  const amendmentSection = termsPolicy.sections.find(
    (section) => section.id === 'amendment'
  );

  const signupSection = termsPolicy.sections.find(
    (section) => section.id === 'signup'
  );

  const userObligationsSection = termsPolicy.sections.find(
    (section) => section.id === 'user-obligations'
  );

  const prohibitedSection = termsPolicy.sections.find(
    (section) => section.id === 'prohibited-actions'
  );

  const copyrightSection = termsPolicy.sections.find(
    (section) => section.id === 'copyright'
  );

  const contentRestrictionSection = termsPolicy.sections.find(
    (section) => section.id === 'content-restriction'
  );

  const serviceOperationSection = termsPolicy.sections.find(
    (section) => section.id === 'service-operation'
  );

  const liabilitySection = termsPolicy.sections.find(
    (section) => section.id === 'liability'
  );

  const restrictionSection = termsPolicy.sections.find(
    (section) => section.id === 'restriction'
  );

  const withdrawalSection = termsPolicy.sections.find(
    (section) => section.id === 'withdrawal'
  );

  const noticeSection = termsPolicy.sections.find(
    (section) => section.id === 'notice'
  );

  const disputeSection = termsPolicy.sections.find(
    (section) => section.id === 'dispute'
  );

  const etcSection = termsPolicy.sections.find(
    (section) => section.id === 'etc'
  );

  // 제1조
  const purposeParagraph = purposeSection?.blocks.find(isParagraph);

  // 제2조
  const serviceParagraphs = serviceSection?.blocks.filter(isParagraph) ?? [];

  const serviceList = serviceSection?.blocks.find(isOrderedList);

  // 제3조
  const amendmentList = amendmentSection?.blocks.find(isOrderedList);

  // 제4조
  const signupList = signupSection?.blocks.find(isOrderedList);

  // 제5조
  const userObligationsList =
    userObligationsSection?.blocks.find(isOrderedList);

  // 제6조
  const prohibitedIntro = prohibitedSection?.blocks.find(isParagraph);

  const prohibitedList = prohibitedSection?.blocks.find(isOrderedList);

  const prohibitedCard = prohibitedSection?.blocks.find(isCard);

  // 제7조
  const copyrightList = copyrightSection?.blocks.find(isOrderedList);

  // 제8조
  const contentRestrictionList =
    contentRestrictionSection?.blocks.find(isOrderedList);

  // 제9조
  const serviceOperationList =
    serviceOperationSection?.blocks.find(isOrderedList);

  // 제10조
  const liabilityParagraphs =
    liabilitySection?.blocks.filter(isParagraph) ?? [];

  const liabilityList = liabilitySection?.blocks.find(isOrderedList);

  // 제11조
  const restrictionParagraph = restrictionSection?.blocks.find(isParagraph);

  const restrictionLists =
    restrictionSection?.blocks.filter(isOrderedList) ?? [];

  // 제12조
  const withdrawalList = withdrawalSection?.blocks.find(isOrderedList);

  // 제13조
  const noticeList = noticeSection?.blocks.find(isOrderedList);

  // 제14조
  const disputeParagraphs = disputeSection?.blocks.filter(isParagraph) ?? [];

  const disputeContact = disputeSection?.blocks.find(isKeyValue);

  // 제15조
  const etcList = etcSection?.blocks.find(isOrderedList);

  const etcParagraph = etcSection?.blocks.find(isParagraph);

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <Suspense fallback={<div className="mt-12 mb-4 h-8" />}>
          <Header
            pageName={termsPolicy.pageName}
            isSearch={isSearch}
            isCreate={isCreate}
            isCategory={isCategory}
            isBack={false}
          />
        </Suspense>

        <article className="mt-6 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white px-5 py-8 sm:px-10 sm:py-12">
          <header className="border-b border-gray-200 pb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {termsPolicy.title}
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              시행일: {termsPolicy.effectiveDate}
            </p>
          </header>

          <div className="divide-y divide-gray-200">
            {/* 제1조 */}
            {purposeSection && purposeParagraph && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{purposeSection.title}</h2>

                <p className="leading-7 text-gray-700">
                  {purposeParagraph.text}
                </p>
              </section>
            )}

            {/* 제2조 */}
            {serviceSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{serviceSection.title}</h2>

                {serviceParagraphs[0] && (
                  <p className="leading-7 text-gray-700">
                    {serviceParagraphs[0].text}
                  </p>
                )}

                {serviceParagraphs[1] && (
                  <p className="mt-4 leading-7 text-gray-700">
                    {serviceParagraphs[1].text}
                  </p>
                )}

                {serviceList && (
                  <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-gray-700">
                    {serviceList.items.map((item) => (
                      <li key={item.text}>{item.text}</li>
                    ))}
                  </ol>
                )}

                {serviceParagraphs[2] && (
                  <p className="mt-4 leading-7 text-gray-700">
                    {serviceParagraphs[2].text}
                  </p>
                )}
              </section>
            )}

            {/* 제3조 */}
            {amendmentSection && amendmentList && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{amendmentSection.title}</h2>

                <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                  {amendmentList.items.map((item) => (
                    <li key={item.text}>{item.text}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* 제4조 */}
            {signupSection && signupList && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{signupSection.title}</h2>

                <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                  {signupList.items.map((item) => (
                    <li key={item.text}>
                      {item.text}

                      {'children' in item && Array.isArray(item.children) && (
                        <ol className="mt-3 list-decimal space-y-2 pl-5">
                          {item.children.map((child) => (
                            <li key={child.text}>{child.text}</li>
                          ))}
                        </ol>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* 제5조 */}
            {userObligationsSection && userObligationsList && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>
                  {userObligationsSection.title}
                </h2>

                <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                  {userObligationsList.items.map((item) => (
                    <li key={item.text}>{item.text}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* 제6조 */}
            {prohibitedSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{prohibitedSection.title}</h2>

                {prohibitedIntro && (
                  <p className="leading-7 text-gray-700">
                    {prohibitedIntro.text}
                  </p>
                )}

                {prohibitedList && (
                  <ol className="mt-5 space-y-4">
                    {prohibitedList.items.map((item, index) => (
                      <li
                        key={item.text}
                        className="flex gap-4 rounded-xl border border-gray-200 p-5"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                          {index + 1}
                        </span>

                        <p className="leading-7 text-gray-700">{item.text}</p>
                      </li>
                    ))}
                  </ol>
                )}

                {prohibitedCard && (
                  <div className="mt-6 space-y-4 rounded-xl bg-gray-50 p-5 leading-7 text-gray-700">
                    {prohibitedCard.blocks.map((block) => {
                      if (block.type !== 'paragraph') {
                        return null;
                      }

                      return <p key={block.text}>{block.text}</p>;
                    })}
                  </div>
                )}
              </section>
            )}

            {/* 제7조 */}
            {copyrightSection && copyrightList && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{copyrightSection.title}</h2>

                <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                  {copyrightList.items.map((item) => (
                    <li key={item.text}>{item.text}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* 제8조 */}
            {contentRestrictionSection && contentRestrictionList && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>
                  {contentRestrictionSection.title}
                </h2>

                <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                  {contentRestrictionList.items.map((item) => (
                    <li key={item.text}>{item.text}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* 제9조 */}
            {serviceOperationSection && serviceOperationList && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>
                  {serviceOperationSection.title}
                </h2>

                <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                  {serviceOperationList.items.map((item) => (
                    <li key={item.text}>{item.text}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* 제10조 */}
            {liabilitySection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{liabilitySection.title}</h2>

                {liabilityParagraphs[0] && (
                  <p className="leading-7 text-gray-700">
                    {liabilityParagraphs[0].text}
                  </p>
                )}

                {liabilityList && (
                  <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-gray-700">
                    {liabilityList.items.map((item) => (
                      <li key={item.text}>{item.text}</li>
                    ))}
                  </ol>
                )}

                {liabilityParagraphs[1] && (
                  <p className="mt-4 leading-7 text-gray-700">
                    {liabilityParagraphs[1].text}
                  </p>
                )}
              </section>
            )}

            {/* 제11조 */}
            {restrictionSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>
                  {restrictionSection.title}
                </h2>

                {restrictionParagraph && (
                  <p className="leading-7 text-gray-700">
                    {restrictionParagraph.text}
                  </p>
                )}

                {restrictionLists[0] && (
                  <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-gray-700">
                    {restrictionLists[0].items.map((item) => (
                      <li key={item.text}>{item.text}</li>
                    ))}
                  </ol>
                )}

                {restrictionLists[1] && (
                  <ol
                    start={
                      'start' in restrictionLists[1]
                        ? restrictionLists[1].start
                        : undefined
                    }
                    className="mt-5 list-decimal space-y-3 pl-5 leading-7 text-gray-700"
                  >
                    {restrictionLists[1].items.map((item) => (
                      <li key={item.text}>{item.text}</li>
                    ))}
                  </ol>
                )}
              </section>
            )}

            {/* 제12조 */}
            {withdrawalSection && withdrawalList && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{withdrawalSection.title}</h2>

                <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                  {withdrawalList.items.map((item) => (
                    <li key={item.text}>{item.text}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* 제13조 */}
            {noticeSection && noticeList && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{noticeSection.title}</h2>

                <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                  {noticeList.items.map((item) => (
                    <li key={item.text}>{item.text}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* 제14조 */}
            {disputeSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{disputeSection.title}</h2>

                <div className="space-y-4 leading-7 text-gray-700">
                  {disputeParagraphs[0] && <p>{disputeParagraphs[0].text}</p>}

                  {disputeContact?.items.map((item) => (
                    <p key={item.label}>
                      {item.label}:{' '}
                      {'href' in item && item.href ? (
                        <a
                          href={item.href}
                          className="font-medium underline underline-offset-4"
                        >
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </p>
                  ))}

                  {disputeParagraphs.slice(1).map((block) => (
                    <p key={block.text}>{block.text}</p>
                  ))}
                </div>
              </section>
            )}

            {/* 제15조 */}
            {etcSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{etcSection.title}</h2>

                {etcList && (
                  <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                    {etcList.items.map((item) => (
                      <li key={item.text}>{item.text}</li>
                    ))}
                  </ol>
                )}

                {etcParagraph && (
                  <p className="mt-6 leading-7 font-medium text-gray-900">
                    {etcParagraph.text}
                  </p>
                )}
              </section>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
