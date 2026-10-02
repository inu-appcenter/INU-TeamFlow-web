import type {
  PolicyBlock,
  PolicyDocument,
  PolicyListItem,
} from '@moimi/core/types/policy';

interface PolicyContentProps {
  policy: PolicyDocument;
}

export default function PolicyContent({ policy }: PolicyContentProps) {
  return (
    <div>
      {policy.effectiveDate || policy.version ? (
        <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#989898]">
          {policy.effectiveDate && <span>시행일: {policy.effectiveDate}</span>}

          {policy.version && <span>버전: {policy.version}</span>}
        </div>
      ) : null}

      {policy.intro && policy.intro.length > 0 && (
        <div className="mb-7 space-y-3">
          {policy.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[14px] leading-6 break-keep text-[#6B7684]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <div className="divide-y divide-[#ECEFF2]">
        {policy.sections.map((section) => (
          <section key={section.id} className="py-6 first:pt-0 last:pb-0">
            <h3 className="mb-4 text-[16px] font-semibold break-keep text-[#2C2C2C]">
              {section.title}
            </h3>

            <div className="space-y-4">
              {section.blocks.map((block, index) => (
                <PolicyBlockRenderer
                  key={`${section.id}-${index}`}
                  block={block}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function PolicyBlockRenderer({ block }: { block: PolicyBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p
          className={`text-[14px] leading-6 break-keep ${
            block.emphasis ? 'font-semibold text-[#2C2C2C]' : 'text-[#6B7684]'
          }`}
        >
          {block.text}
        </p>
      );

    case 'subheading':
      return (
        <h4 className="mt-5 text-[15px] font-semibold break-keep text-[#2C2C2C]">
          {block.text}
        </h4>
      );

    case 'unordered-list':
      return (
        <ul className="list-disc space-y-2 pl-5 text-[14px] leading-6 break-keep text-[#6B7684] marker:text-[#A0A7B2]">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case 'ordered-list':
      if (block.variant === 'cards') {
        return (
          <ol className="space-y-3">
            {block.items.map((item, index) => (
              <li
                key={`${index}-${item.text}`}
                className="rounded-xl border border-[#ECEFF2] p-4"
              >
                <div className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F0F2F5] text-[12px] font-semibold text-[#6B7684]">
                    {(block.start ?? 1) + index}
                  </span>

                  <div className="min-w-0">
                    {item.title && (
                      <p className="mb-1.5 text-[14px] font-semibold break-keep text-[#2C2C2C]">
                        {item.title}
                      </p>
                    )}

                    <p className="text-[14px] leading-6 break-keep text-[#6B7684]">
                      {item.text}
                    </p>

                    {item.children && (
                      <NestedOrderedList items={item.children} />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        );
      }

      return (
        <ol
          start={block.start}
          className="list-decimal space-y-2.5 pl-5 text-[14px] leading-6 break-keep text-[#6B7684]"
        >
          {block.items.map((item, index) => (
            <li key={`${index}-${item.text}`}>
              {item.title && (
                <span className="mr-1 font-semibold text-[#2C2C2C]">
                  {item.title}
                </span>
              )}

              {item.text}

              {item.children && <NestedOrderedList items={item.children} />}
            </li>
          ))}
        </ol>
      );

    case 'card':
      return (
        <div className="rounded-xl bg-[#F6F8FA] p-4">
          {block.title && (
            <h4 className="mb-3 text-[14px] font-semibold break-keep text-[#2C2C2C]">
              {block.title}
            </h4>
          )}

          <div className="space-y-3">
            {block.blocks.map((child, index) => (
              <PolicyBlockRenderer key={index} block={child} />
            ))}
          </div>
        </div>
      );

    case 'note':
      return (
        <p className="text-[12px] leading-5 break-keep text-[#989898]">
          {block.text}
        </p>
      );

    case 'key-value':
      return (
        <div className="space-y-1 text-[14px] leading-6 text-[#6B7684]">
          {block.items.map((item) => (
            <p key={item.label}>
              <span className="font-medium text-[#2C2C2C]">{item.label}</span>:{' '}
              {item.href ? (
                <a
                  href={item.href}
                  className="underline underline-offset-4 transition-colors hover:text-[#5E92F0]"
                >
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </p>
          ))}
        </div>
      );
  }
}

function NestedOrderedList({ items }: { items: PolicyListItem[] }) {
  return (
    <ol className="mt-2 list-decimal space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={`${index}-${item.text}`}>
          {item.title && (
            <span className="mr-1 font-semibold text-[#2C2C2C]">
              {item.title}
            </span>
          )}

          {item.text}

          {item.children && <NestedOrderedList items={item.children} />}
        </li>
      ))}
    </ol>
  );
}
