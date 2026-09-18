import Header from '@/components/common/Header';

// Header 연결을 위한 입력 공간
const pageName = '청소년 보호정책';

// 글 검색 기능
const isSearch = false;

// 글 작성 기능
const isCreate = false;

// 카테고리 기능
const isCategory = false;

export default function YouthProtectionPolicy() {
  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <Header
          pageName={pageName}
          isSearch={isSearch}
          isCreate={isCreate}
          isCategory={isCategory}
          isBack={false}
        />

        <article className="mt-6 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white px-5 py-8 sm:px-10 sm:py-12">
          <header className="border-b border-gray-200 pb-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              모이미 청소년 보호정책
            </h1>
          </header>

          <section className="py-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">
              만 14세 미만 이용자 보호
            </h2>

            <div className="space-y-4 leading-7 text-gray-700">
              <p>
                모이미 서비스는 만 14세 이상 이용자만 회원가입할 수 있습니다.
              </p>

              <p>
                회원가입 시 이용자는 본인이 만 14세 이상임을 확인해야 합니다.
              </p>

              <p>
                이용자가 만 14세 미만인 사실이 확인된 경우, 운영팀은 해당 계정의
                이용을 제한하거나 삭제할 수 있습니다.
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
