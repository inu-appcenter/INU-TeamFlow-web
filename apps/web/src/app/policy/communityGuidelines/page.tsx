import Header from '@/components/common/Header';
import { Suspense } from 'react';

// Header 연결을 위한 입력 공간
const pageName = '커뮤니티 이용규칙';

// 글 검색 기능
const isSearch = false;

// 글 작성 기능
const isCreate = false;

// 카테고리 기능
const isCategory = false;

const prohibitedRules = [
  {
    title: '유해하거나 부적절한 콘텐츠',
    description:
      '과도한 욕설, 잔혹하거나 폭력적인 표현·이미지 등 다른 이용자에게 심각한 불쾌감이나 위협을 줄 수 있는 콘텐츠를 게시하는 행위',
  },
  {
    title: '성적·불법 콘텐츠',
    description:
      '신체 부위 또는 성적 행위를 노골적으로 묘사하는 행위, 불법촬영물·허위영상물·아동·청소년성착취물 등을 게시·공유·유포하는 행위, 관련 법령을 위반하여 청소년유해매체물을 유통하는 행위, 성매매 또는 불건전한 만남을 알선·유도·조장하는 행위',
  },
  {
    title: '타인을 괴롭히거나 공격하는 행위',
    description:
      '특정 이용자를 지속적으로 비난·조롱·모욕·위협하거나 원치 않는 연락을 반복하는 행위, 집단적으로 특정 이용자를 공격하거나 따돌림을 유도하는 행위',
  },
  {
    title: '혐오·차별·갈등을 조장하는 행위',
    description:
      '특정 개인 또는 집단의 특성을 이유로 혐오·차별·폭력을 조장하거나, 이용자 간 갈등을 의도적으로 유발·확산하는 행위',
  },
  {
    title: '타인의 개인정보와 권리를 침해하는 행위',
    description:
      '다른 사람의 개인정보를 당사자의 동의 없이 공개·수집·유포하는 행위, 타인의 계정이나 신원을 도용·사칭하는 행위, 타인의 사진·글·이미지·프로그램 등 저작권 또는 기타 권리를 침해하는 행위',
  },
  {
    title: '허위·사기·부정한 모집 활동',
    description:
      '존재하지 않는 팀·공모전·활동을 모집하는 행위, 모집 목적과 실제 활동 내용을 고의로 다르게 안내하는 행위, 허위 정보를 이용하여 이용자의 개인정보·금전 등을 요구하는 행위',
  },
  {
    title: '광고·홍보·거래 관련 금지 행위',
    description:
      '동일하거나 유사한 게시물을 반복해서 등록하는 행위, 서비스 목적과 관계없는 광고·홍보성 게시물을 반복적으로 게시하는 행위, 불법 상품·서비스의 거래 또는 판매를 유도하는 행위, 사기성 금전 거래를 제안하거나 유도하는 행위',
  },
  {
    title: '서비스의 정상적인 운영을 방해하는 행위',
    description:
      '서버 또는 서비스에 비정상적인 부하를 발생시키는 행위, 취약점을 탐색·악용하는 행위, 악성코드를 배포하는 행위, 허가받지 않은 매크로·봇·자동화 프로그램 등을 이용하는 행위',
  },
  {
    title: '서비스 정보를 부정하게 수집·이용하는 행위',
    description:
      '운영팀의 허가 없이 서비스의 회원정보·게시물 등을 대량으로 크롤링·수집하는 행위, 수집한 데이터를 서비스 목적과 무관하게 이용·제공·판매하는 행위',
  },
  {
    title: '서비스 운영 및 제재를 방해하는 행위',
    description:
      '이용 제한을 회피하기 위해 다른 계정이나 타인의 계정을 사용하는 행위, 여러 계정을 이용하여 투표·추천·신고 결과 등을 인위적으로 조작하는 행위, 허위 또는 악의적인 신고를 반복하는 행위',
  },
  {
    title: '불법행위 또는 위험한 행위를 조장하는 행위',
    description:
      '범죄 또는 법령 위반 행위를 구체적으로 모집·알선·조장하는 행위, 타인의 생명·신체·재산에 위해를 줄 수 있는 행위를 직접적으로 유도하는 행위',
  },
  {
    title: '기타 서비스 이용질서를 현저히 해치는 행위',
    description:
      '위 항목에 정확히 명시되지 않았더라도 관계 법령을 위반하거나, 위 항목과 유사한 수준으로 다른 이용자의 권리·안전 또는 서비스의 정상적인 운영을 현저히 침해하는 행위',
  },
];

const recommendedRules = [
  '상대방을 존중하는 표현을 사용해요.',
  '의견이 다르더라도 사람 자체를 비난하거나 공격하지 말아요.',
  '서로의 생각과 경험을 자유롭게 공유해요.',
  '함께할 사람을 찾아 다양한 활동에 도전해봐요.',
  '팀원들과 협력하고 서로 도움을 주고받아요.',
  '잘못된 정보가 있다면 공격하기보다 알려주고 함께 수정해요.',
  '서로 성장할 수 있는 커뮤니티를 만들어가요.',
];

export default function CommunityGuidelines() {
  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      <div className="mx-auto mb-10 max-w-[1180px]">
        <Suspense fallback={<div className="mt-12 mb-4 h-8" />}>
          <Header
            pageName={pageName}
            isSearch={isSearch}
            isCreate={isCreate}
            isCategory={isCategory}
            isBack={false}
          />
        </Suspense>

        <article className="mt-6 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white px-5 py-8 sm:px-10 sm:py-12">
          {/* 소개 */}
          <header className="border-b border-gray-200 pb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              모이미 커뮤니티 이용규칙
            </h1>

            <div className="mt-6 space-y-3 leading-7 text-gray-700">
              <p>
                커뮤니티 이용규칙은 누구나 즐겁고 안전하게 모이미를 이용할 수
                있도록 모아가 만들어봤어요!
              </p>

              <p>관리는 모이미 운영팀분들이 하지만, 소개는 모아가 해줄게요.</p>

              <p>
                몇 가지 약속만 지켜주시면 더 좋은 서비스를 만들 수 있을 것
                같아요.
              </p>
            </div>
          </header>

          {/* 금지 사항 */}
          <section className="py-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                NO! 이런 건 하지 말아주세요!!!
              </h2>

              <p className="mt-2 leading-7 text-gray-600">
                모두가 안전하고 즐겁게 이용할 수 있도록 아래 행위는 삼가주세요.
              </p>
            </div>

            <ol className="space-y-4">
              {prohibitedRules.map((rule, index) => (
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
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* 긴급 예외 */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                  13
                </span>

                <div>
                  <h3 className="font-semibold text-gray-900">긴급예외 상황</h3>

                  <p className="mt-2 leading-7 text-gray-700">
                    불법촬영물·허위영상물·아동·청소년성착취물 유포, 개인정보의
                    악의적인 유포, 사기·범죄 목적의 이용, 서비스 공격·악성코드
                    유포·취약점 악용, 중대한 괴롭힘·협박, 기존 이용 제한 조치의
                    고의적 회피 등 이용자 또는 서비스에 즉각적이고 중대한 피해를
                    초래할 수 있는 행위
                  </p>

                  <p className="mt-3 leading-7 font-medium text-gray-900">
                    해당 행위는 별도의 경고 없이 콘텐츠 삭제·숨김 또는 즉시 이용
                    제한이 이루어질 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 leading-7 font-medium text-gray-900">
              위에 적혀 있는 것만큼은 꼭 하지 말아주세요!
            </p>

            <p className="mt-2 leading-7 text-gray-700">
              서로를 존중하는 건전한 인천대 학생의 모습을 보여주세요.
            </p>
          </section>

          {/* 권장 행동 */}
          <section className="border-t border-gray-200 py-8">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              이런 건 어때요?
            </h2>

            <p className="mt-2 leading-7 text-gray-600">
              모아는 이런 모습의 커뮤니티가 되었으면 좋겠어요.
            </p>

            <ol className="mt-6 space-y-3">
              {recommendedRules.map((rule, index) => (
                <li
                  key={rule}
                  className="flex gap-3 rounded-xl bg-gray-50 px-5 py-4"
                >
                  <span className="font-semibold text-gray-500">
                    {index + 1}.
                  </span>
                  <span className="leading-7 text-gray-700">{rule}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 이용 제한 */}
          <section className="border-t border-gray-200 py-8">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              이용 제한 조치
            </h2>

            <div className="mt-5 space-y-3 leading-7 text-gray-700">
              <p>
                제재 사항은 위반 내용과 정도에 따라 경고, 콘텐츠 삭제·숨김, 일정
                기간 이용 정지, 최대 영구 이용 정지까지 이루어질 수 있어요.
              </p>

              <p>
                특히 이용자나 서비스에 즉각적이고 중대한 피해가 발생할 수 있는
                경우에는 별도의 경고 없이 즉시 조치될 수 있습니다.
              </p>
            </div>
          </section>

          {/* 제재 문의 */}
          <section className="border-t border-gray-200 py-8">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              제재에 대한 문의
            </h2>

            <div className="mt-5 space-y-3 leading-7 text-gray-700">
              <p>
                늘 조심하지만 운영팀도 가끔은 실수를 할 수 있어요. 운영팀의
                조치에 대해 의문이 있거나 잘못된 제재라고 판단되는 경우 문의
                기능 또는 이메일을 통해 알려주세요.
              </p>

              <p>운영팀이 내용을 확인하고 정성껏 답변해드릴게요!</p>

              <p>
                궁금한 사항이 있다면 언제든 문의 기능이나 이메일을 이용해주세요.
              </p>
            </div>
          </section>

          {/* 규칙 변경 */}
          <section className="border-t border-gray-200 py-8">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              커뮤니티 이용규칙의 변경
            </h2>

            <div className="mt-5 space-y-3 leading-7 text-gray-700">
              <p>
                커뮤니티 이용규칙은 서비스 운영 상황에 따라 개정될 수 있으며,
                변경되는 경우 모이미를 통해 안내할게요.
              </p>

              <p>모두가 즐거운 커뮤니티를 만들 수 있도록 함께 노력해봐요!</p>
            </div>
          </section>

          {/* 시행일 및 문의 */}
          <footer className="border-t border-gray-200 pt-8">
            <div className="rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-700 sm:text-base">
              <p>
                <span className="font-medium text-gray-900">시행일</span>:{' '}
                [시행일]
              </p>

              <p>
                <span className="font-medium text-gray-900">문의</span>: 모이미
                운영팀
              </p>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}
