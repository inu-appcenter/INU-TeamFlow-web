import { Suspense } from 'react';
import Header from '@/components/common/Header';
import { privacyPolicy } from '@moimi/core/constants/policies/index';

const isSearch = false;
const isCreate = false;
const isCategory = false;

const sectionTitleClass =
  'mb-4 text-xl font-semibold text-gray-900 sm:text-2xl';

const subsectionTitleClass =
  'mb-2 mt-6 text-base font-semibold text-gray-900 sm:text-lg';

const listClass =
  'mt-3 list-disc space-y-2 pl-5 leading-7 text-gray-700 marker:text-gray-400';

export default function PrivacyPolicy() {
  const purposeSection = privacyPolicy.sections.find(
    (section) => section.id === 'purpose'
  );

  const itemsAndRetentionSection = privacyPolicy.sections.find(
    (section) => section.id === 'items-and-retention'
  );

  const thirdPartySection = privacyPolicy.sections.find(
    (section) => section.id === 'third-party'
  );

  const outsourcingSection = privacyPolicy.sections.find(
    (section) => section.id === 'outsourcing'
  );

  const destructionSection = privacyPolicy.sections.find(
    (section) => section.id === 'destruction'
  );

  const rightsSection = privacyPolicy.sections.find(
    (section) => section.id === 'rights'
  );

  const securitySection = privacyPolicy.sections.find(
    (section) => section.id === 'security'
  );

  const operatorAccessSection = privacyPolicy.sections.find(
    (section) => section.id === 'operator-access'
  );

  const childrenSection = privacyPolicy.sections.find(
    (section) => section.id === 'children'
  );

  const privacyContactSection = privacyPolicy.sections.find(
    (section) => section.id === 'privacy-contact'
  );

  const changesSection = privacyPolicy.sections.find(
    (section) => section.id === 'changes'
  );

  const outsourcingIntro = outsourcingSection?.blocks.find(
    (block) => block.type === 'paragraph'
  );

  const outsourcingCards =
    outsourcingSection?.blocks.filter((block) => block.type === 'card') ?? [];

  const outsourcingNote = outsourcingSection?.blocks.find(
    (block) => block.type === 'note'
  );

  const contactCard = privacyContactSection?.blocks.find(
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
            pageName={privacyPolicy.pageName}
            isSearch={isSearch}
            isCreate={isCreate}
            isCategory={isCategory}
            isBack={false}
          />
        </Suspense>

        <article className="mt-6 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white px-5 py-8 sm:px-10 sm:py-12">
          {/* 문서 상단 */}
          <header className="border-b border-gray-200 pb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {privacyPolicy.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>시행일: {privacyPolicy.effectiveDate}</span>
              <span>버전: {privacyPolicy.version}</span>
            </div>

            <div className="mt-6 space-y-3 leading-7 text-gray-700">
              {privacyPolicy.intro.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          </header>

          <div className="divide-y divide-gray-200">
            {/* 1 */}
            {purposeSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{purposeSection.title}</h2>

                {purposeSection.blocks.map((block) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p key={block.text} className="leading-7 text-gray-700">
                        {block.text}
                      </p>
                    );
                  }

                  if (block.type === 'unordered-list') {
                    return (
                      <ul key="purpose-list" className={listClass}>
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  return null;
                })}
              </section>
            )}

            {/* 2 */}
            {itemsAndRetentionSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>
                  {itemsAndRetentionSection.title}
                </h2>

                {itemsAndRetentionSection.blocks.map((block, index) => {
                  if (block.type === 'subheading') {
                    return (
                      <h3
                        key={`${block.text}-${index}`}
                        className={subsectionTitleClass}
                      >
                        {block.text}
                      </h3>
                    );
                  }

                  if (block.type === 'unordered-list') {
                    return (
                      <ul key={`list-${index}`} className={listClass}>
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={`${block.text}-${index}`}
                        className="mt-4 leading-7 text-gray-700"
                      >
                        {block.text}
                      </p>
                    );
                  }

                  return null;
                })}
              </section>
            )}

            {/* 3 */}
            {thirdPartySection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{thirdPartySection.title}</h2>

                {thirdPartySection.blocks.map((block, index) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={`${block.text}-${index}`}
                        className={
                          index === 0
                            ? 'leading-7 text-gray-700'
                            : 'mt-4 leading-7 text-gray-700'
                        }
                      >
                        {block.text}
                      </p>
                    );
                  }

                  if (block.type === 'unordered-list') {
                    return (
                      <ul key={`third-party-${index}`} className={listClass}>
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  return null;
                })}
              </section>
            )}

            {/* 4 */}
            {outsourcingSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>
                  {outsourcingSection.title}
                </h2>

                {outsourcingIntro && (
                  <p className="leading-7 text-gray-700">
                    {outsourcingIntro.text}
                  </p>
                )}

                <div className="mt-5 space-y-5">
                  {outsourcingCards.map((card, index) => (
                    <div
                      key={
                        'title' in card && card.title
                          ? card.title
                          : `outsourcing-${index}`
                      }
                      className="rounded-xl bg-gray-50 p-5"
                    >
                      {'title' in card && card.title && (
                        <h3 className="font-semibold text-gray-900">
                          {card.title}
                        </h3>
                      )}

                      {card.blocks.map((block, blockIndex) => {
                        if (block.type !== 'unordered-list') {
                          return null;
                        }

                        return (
                          <ul
                            key={`outsourcing-list-${blockIndex}`}
                            className={listClass}
                          >
                            {block.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {outsourcingNote && (
                  <p className="mt-5 text-sm leading-6 text-gray-500">
                    {outsourcingNote.text}
                  </p>
                )}
              </section>
            )}

            {/* 5 */}
            {destructionSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>
                  {destructionSection.title}
                </h2>

                {destructionSection.blocks.map((block, index) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={`${block.text}-${index}`}
                        className="leading-7 text-gray-700"
                      >
                        {block.text}
                      </p>
                    );
                  }

                  if (block.type === 'unordered-list') {
                    return (
                      <ul key={`destruction-${index}`} className={listClass}>
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  return null;
                })}
              </section>
            )}

            {/* 6 */}
            {rightsSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{rightsSection.title}</h2>

                {rightsSection.blocks.map((block, index) => {
                  if (block.type === 'unordered-list') {
                    return (
                      <ul key={`rights-${index}`} className={listClass}>
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={`${block.text}-${index}`}
                        className={
                          index === 0
                            ? 'leading-7 text-gray-700'
                            : 'mt-4 leading-7 text-gray-700'
                        }
                      >
                        {block.text}
                      </p>
                    );
                  }

                  return null;
                })}
              </section>
            )}

            {/* 7 */}
            {securitySection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{securitySection.title}</h2>

                {securitySection.blocks.map((block, index) => {
                  if (block.type !== 'unordered-list') {
                    return null;
                  }

                  return (
                    <ul key={`security-${index}`} className={listClass}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  );
                })}
              </section>
            )}

            {/* 8 */}
            {operatorAccessSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>
                  {operatorAccessSection.title}
                </h2>

                {operatorAccessSection.blocks.map((block, index) => {
                  if (block.type === 'unordered-list') {
                    return (
                      <ul
                        key={`operator-access-${index}`}
                        className={listClass}
                      >
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={`${block.text}-${index}`}
                        className={
                          index === 0
                            ? 'leading-7 text-gray-700'
                            : 'mt-4 leading-7 text-gray-700'
                        }
                      >
                        {block.text}
                      </p>
                    );
                  }

                  return null;
                })}
              </section>
            )}

            {/* 9 */}
            {childrenSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{childrenSection.title}</h2>

                {childrenSection.blocks.map((block) => {
                  if (block.type !== 'paragraph') {
                    return null;
                  }

                  return (
                    <p key={block.text} className="leading-7 text-gray-700">
                      {block.text}
                    </p>
                  );
                })}
              </section>
            )}

            {/* 10 */}
            {privacyContactSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>
                  {privacyContactSection.title}
                </h2>

                {privacyContactSection.blocks.map((block) => {
                  if (block.type !== 'paragraph') {
                    return null;
                  }

                  return (
                    <p key={block.text} className="leading-7 text-gray-700">
                      {block.text}
                    </p>
                  );
                })}

                {contactKeyValue && (
                  <div className="mt-4 rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-700 sm:text-base">
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
                )}
              </section>
            )}

            {/* 11 */}
            {changesSection && (
              <section className="py-8">
                <h2 className={sectionTitleClass}>{changesSection.title}</h2>

                <div className="space-y-3 leading-7 text-gray-700">
                  {changesSection.blocks.map((block, index) => {
                    if (block.type !== 'paragraph') {
                      return null;
                    }

                    return (
                      <p
                        key={`${block.text}-${index}`}
                        className={
                          'emphasis' in block && block.emphasis
                            ? 'font-medium text-gray-900'
                            : undefined
                        }
                      >
                        {block.text}
                      </p>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
