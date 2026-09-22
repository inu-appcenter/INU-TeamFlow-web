import { Suspense } from 'react';
import Header from '@/components/common/Header';

const pageName = '서비스 이용약관';
const isSearch = false;
const isCreate = false;
const isCategory = false;

const sectionTitleClass =
  'mb-4 text-xl font-semibold text-gray-900 sm:text-2xl';

const prohibitedActions = [
  '과도한 욕설, 잔혹하거나 폭력적인 표현·이미지 등 다른 이용자에게 심각한 불쾌감, 공포 또는 위협을 줄 수 있는 콘텐츠를 게시·공유하는 행위',
  '신체 부위 또는 성적 행위를 노골적으로 묘사하거나, 불법촬영물·허위영상물·아동·청소년성착취물 등을 게시·공유·유포하는 행위, 관계 법령에 따른 조치 없이 청소년유해매체물을 유통하는 행위, 성매매 또는 불건전한 만남을 알선·유도·조장하는 행위',
  '특정 이용자를 지속적으로 비난·조롱·모욕·협박하거나 원하지 않는 연락을 반복하는 행위, 집단적인 공격·괴롭힘·따돌림을 유도하거나 이에 참여하는 행위',
  '특정 개인 또는 집단에 대한 혐오·차별·폭력을 조장하거나 이용자 간 갈등을 고의적으로 유발·확산하는 행위',
  '타인의 개인정보를 정당한 권한 없이 수집·이용·공개·유포하는 행위, 타인의 계정 또는 신원을 도용·사칭하는 행위, 타인의 명예·사생활·저작권·상표권 등 권리를 침해하는 행위',
  '존재하지 않는 팀·공모전·활동 등에 대해 허위 모집을 진행하거나, 실제 활동 목적·조건 등을 고의로 사실과 다르게 안내하는 행위, 허위 정보를 이용하여 다른 이용자에게 개인정보 또는 금전 등을 요구하는 행위',
  '동일하거나 유사한 내용을 반복적으로 게시하는 행위, 서비스의 목적과 관계없는 광고·홍보·스팸성 정보를 반복적으로 게시하는 행위, 불법 상품·서비스의 거래 또는 판매를 유도하거나 사기성 금전거래를 제안·유도하는 행위',
  '프로그램·스크립트·매크로·봇 등 운영팀이 허용하지 않은 자동화 수단을 이용하거나, 서비스 또는 서버에 비정상적인 부하를 발생시키는 행위, 서비스의 취약점을 탐색·악용하거나 악성코드를 유포하는 등 서비스의 정상적인 운영 또는 보안을 방해하는 행위',
  '운영팀의 허가 없이 회원정보·게시물 등 서비스 내 정보를 대량으로 크롤링·수집하거나, 수집한 정보를 서비스의 목적과 관계없이 이용·제공·판매하는 행위',
  '이용 제한을 회피하기 위하여 다른 계정 또는 타인의 계정을 이용하는 행위, 복수의 계정을 이용하여 투표·추천·신고 등의 결과를 인위적으로 조작하는 행위, 허위 또는 악의적인 신고를 반복하여 서비스 운영을 방해하는 행위',
  '범죄 또는 관계 법령에 위반되는 행위를 모집·알선·조장하거나, 다른 사람의 생명·신체·재산에 위해를 가할 수 있는 행위를 직접적으로 유도·조장하는 행위',
  '그 밖에 관계 법령, 본 약관 또는 커뮤니티 이용규칙을 위반하거나, 위 각 호와 유사한 수준으로 다른 이용자의 권리·안전 또는 서비스의 정상적인 운영을 현저히 침해하는 행위',
];

export default function TermsPage() {
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
          <header className="border-b border-gray-200 pb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              모이미 서비스 이용약관
            </h1>

            <p className="mt-3 text-sm text-gray-500">시행일: [시행일]</p>
          </header>

          <div className="divide-y divide-gray-200">
            <section className="py-8">
              <h2 className={sectionTitleClass}>제1조(목적)</h2>

              <p className="leading-7 text-gray-700">
                본 약관은 모이미 운영팀(이하 &quot;운영팀&quot;)이 제공하는
                모이미 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여
                운영팀과 이용자의 권리, 의무 및 책임사항을 정하는 것을 목적으로
                합니다.
              </p>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>제2조(서비스)</h2>

              <p className="leading-7 text-gray-700">
                서비스는 대학생 및 팀 구성원이 팀을 생성·운영하고, 팀원 모집,
                일정 관리, 투표, 공지, 채팅 및 알림 기능을 이용할 수 있도록
                제공하는 협업 서비스입니다.
              </p>

              <p className="mt-4 leading-7 text-gray-700">
                운영팀은 다음과 같은 서비스를 제공합니다.
              </p>

              <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-gray-700">
                <li>모집글, 정보글 및 스크랩</li>
                <li>공지사항</li>
                <li>팀 생성 및 관리</li>
                <li>팀 투표</li>
                <li>1:1 및 그룹 채팅</li>
                <li>캘린더 및 일정 관리</li>
                <li>그 밖에 운영팀이 정하는 서비스</li>
              </ol>

              <p className="mt-4 leading-7 text-gray-700">
                서비스는 인천대학교 학생 및 구성원을 주된 대상으로 제공하며,
                일부 기능은 학적 인증 여부에 따라 이용 범위가 달라질 수
                있습니다.
              </p>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>
                제3조(약관 명시와 설명 및 개정)
              </h2>

              <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                <li>
                  운영팀은 이 약관을 서비스 초기 화면 또는 로그인 화면 등에
                  게시합니다.
                </li>

                <li>
                  운영팀은 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할
                  수 있습니다.
                </li>

                <li>
                  약관을 개정하는 경우, 적용일자와 개정 사유를 명시하여 적용일
                  7일 전부터 서비스 내 공지사항 또는 알림을 통해 공지합니다.
                  다만 이용자의 권리·의무에 중대한 영향을 미치는 개정은 적용일
                  30일 전부터 공지합니다.
                </li>

                <li>
                  이용자가 개정약관에 동의하지 않는 경우 제12조(회원 탈퇴 및
                  이용계약 종료)에 따라 탈퇴할 수 있으며, 공지된 적용일 이후에도
                  서비스를 계속 이용하는 경우 개정약관에 동의한 것으로
                  간주합니다.
                </li>
              </ol>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>
                제4조(회원가입 및 서비스 이용계약의 성립)
              </h2>

              <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                <li>
                  이용자는 회원가입 화면에서 요구하는 정보를 정확하게 입력하고
                  본 약관에 동의하여 회원가입을 신청합니다.
                </li>

                <li>
                  개인정보 처리와 관련된 사항은 개인정보 처리방침에 따르며,
                  별도의 동의가 필요한 개인정보 처리에 대해서는 필요한 동의
                  절차를 진행합니다.
                </li>

                <li>
                  운영팀은 부정 이용 방지 및 학적 확인을 위해 이용자에게 학교
                  인증을 요청할 수 있습니다.
                </li>

                <li>서비스는 만 14세 이상 이용자만 회원가입할 수 있습니다.</li>

                <li>
                  운영팀은 다음 각 호에 해당하는 경우 회원가입 또는 서비스
                  이용계약의 성립을 거부하거나 이용을 제한할 수 있습니다.
                  <ol className="mt-3 list-decimal space-y-2 pl-5">
                    <li>타인의 정보를 도용한 경우</li>
                    <li>허위 정보를 등록한 경우</li>
                    <li>학교 인증에 실패하거나 타인의 계정을 도용한 경우</li>
                    <li>
                      제6조(금지행위)에 해당하는 행위를 하였거나 기존 이용 제한
                      조치를 회피하기 위한 가입인 경우
                    </li>
                    <li>관계 법령 또는 본 약관을 위반한 경우</li>
                    <li>
                      서비스의 안정적인 운영 또는 관계 법령 준수를 위해 가입
                      제한이 객관적으로 필요한 경우
                    </li>
                  </ol>
                </li>

                <li>
                  이용자가 만 14세 미만인 사실이 확인된 경우 운영팀은 회원가입을
                  거부하거나 해당 계정의 이용을 제한 또는 종료할 수 있습니다.
                </li>
              </ol>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>제5조(이용자의 의무)</h2>

              <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                <li>
                  이용자는 자신의 계정 정보를 안전하게 관리하여야 하며, 계정을
                  타인에게 양도·대여·판매하거나 부정하게 공유하여서는 안 됩니다.
                </li>

                <li>
                  이용자는 관계 법령, 본 약관 및 커뮤니티 이용규칙을 준수하여야
                  합니다.
                </li>

                <li>
                  이용자는 서비스 내에서 타인의 개인정보, 저작권, 명예, 사생활
                  등 권리를 침해하거나 불법·유해한 콘텐츠를 게시하여서는 안
                  됩니다.
                </li>

                <li>
                  이용자는 자신이 게시하거나 전송한 게시물, 모집글, 공지, 채팅
                  등 콘텐츠에 대해 관계 법령 및 본 약관을 준수할 책임이
                  있습니다.
                </li>
              </ol>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>제6조(금지행위)</h2>

              <p className="leading-7 text-gray-700">
                이용자는 서비스를 이용함에 있어 다음 각 호의 행위를 해서는 안
                됩니다. 구체적인 판단 기준 및 세부 사항은 커뮤니티 이용규칙을
                따릅니다.
              </p>

              <ol className="mt-5 space-y-4">
                {prohibitedActions.map((action, index) => (
                  <li
                    key={action}
                    className="flex gap-4 rounded-xl border border-gray-200 p-5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                      {index + 1}
                    </span>

                    <p className="leading-7 text-gray-700">{action}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-6 space-y-4 rounded-xl bg-gray-50 p-5 leading-7 text-gray-700">
                <p>
                  위 행위 중 불법촬영물·허위영상물·아동·청소년성착취물의 유포,
                  개인정보의 악의적인 유포, 사기·범죄 목적의 이용, 서비스
                  공격·악성코드 유포·취약점 악용, 중대한 괴롭힘·협박, 기존 이용
                  제한 조치의 고의적인 회피 등 이용자 또는 서비스에 즉각적이고
                  중대한 피해를 초래하거나 그 우려가 있는 행위에 대해서는
                  운영팀이 별도의 사전 경고 없이 콘텐츠의 삭제·숨김 또는 서비스
                  이용 제한 등의 조치를 할 수 있습니다.
                </p>

                <p>
                  해당 행위가 관계 법령을 위반한 것으로 판단되는 경우 운영팀은
                  필요한 범위에서 관련 자료를 보존하고, 관계기관에 신고하거나
                  관계기관의 적법한 요청에 협조할 수 있습니다.
                </p>
              </div>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>제7조(게시물 및 저작권)</h2>

              <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                <li>
                  이용자가 서비스에 게시한 게시물의 저작권은 해당 이용자에게
                  귀속됩니다.
                </li>

                <li>
                  이용자는 서비스에 게시물을 게시함으로써 서비스의 제공·운영 및
                  게시물의 정상적인 노출에 필요한 범위에서 운영팀이 해당
                  게시물을 저장·복제·전송·표시할 수 있도록 허용합니다.
                </li>

                <li>
                  운영팀은 이용자의 게시물을 서비스 외부의 광고·홍보 등 본래의
                  서비스 제공 목적과 다른 용도로 이용하려는 경우 필요한 절차를
                  거칩니다.
                </li>

                <li>
                  이용자는 자신이 작성한 게시물에 대해 서비스 내에서 제공하는
                  관리 기능 또는 문의처를 통해 수정·삭제를 요청할 수 있습니다.
                </li>

                <li>
                  팀 공동 일정, 채팅 메시지·첨부 이미지 등 여러 이용자가
                  공동으로 이용하는 콘텐츠는 팀 운영 및 대화 기록의 연속성을
                  위해 회원 탈퇴 후에도 유지될 수 있습니다. 이 경우 탈퇴한
                  이용자의 식별정보는 개인정보 처리방침에서 정한 기준에 따라
                  처리합니다.
                </li>
              </ol>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>
                제8조(게시물의 삭제 및 접근 제한)
              </h2>

              <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                <li>
                  운영팀은 게시물이 관계 법령, 본 약관 또는 커뮤니티 이용규칙을
                  위반하거나 다른 이용자의 권리를 침해한다고 판단되는 경우 해당
                  게시물을 삭제·숨김 또는 접근 제한할 수 있습니다.
                </li>

                <li>
                  이용자는 게시물로 인해 자신의 권리를 침해당했다고 판단되는
                  경우 신고 기능 또는 문의처를 통해 해당 게시물의 삭제 또는 접근
                  제한을 요청할 수 있습니다.
                </li>

                <li>
                  운영팀은 신고 또는 요청 내용을 확인한 후 필요한 조치를 취하며,
                  필요한 경우 처리 결과를 요청인에게 안내합니다.
                </li>

                <li>
                  권리 침해 여부가 불분명하거나 즉시 판단하기 어려운 경우 확인이
                  완료될 때까지 해당 게시물에 대한 접근을 임시로 제한할 수
                  있습니다.
                </li>
              </ol>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>
                제9조(서비스의 제공·변경 및 중단)
              </h2>

              <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                <li>운영팀은 안정적인 서비스 제공을 위해 노력합니다.</li>

                <li>
                  운영팀은 서비스 개선, 기능 변경, 시스템 점검, 서버 증설·교체,
                  장애 대응 또는 운영상·기술상 필요한 경우 서비스의 전부 또는
                  일부를 변경하거나 중단할 수 있습니다.
                </li>

                <li>
                  이용자에게 중요한 영향을 미치는 서비스 변경 또는 중단이 예정된
                  경우 운영팀은 서비스 내 공지 등을 통해 사전에 안내하는 것을
                  원칙으로 합니다.
                </li>

                <li>
                  장애, 보안 사고, 천재지변 등 사전 안내가 어려운 긴급한 사유가
                  있는 경우 사후에 안내할 수 있습니다.
                </li>
              </ol>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>제10조(책임의 제한)</h2>

              <p className="leading-7 text-gray-700">
                운영팀의 고의 또는 과실이 없고 운영팀이 합리적으로 통제하기
                어려운 다음 각 호의 사유로 발생한 피해에 대해서는 관계 법령에서
                달리 정하는 경우를 제외하고 운영팀이 책임을 부담하지 않습니다.
              </p>

              <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-gray-700">
                <li>
                  시스템 정기점검, 서버 증설·교체 또는 예측하기 어려운 네트워크
                  장애
                </li>
                <li>천재지변, 통신장애 등 불가항력으로 인한 서비스 중단</li>
                <li>이용자 상호 간에 이루어진 합의·거래 또는 분쟁</li>
                <li>
                  게시물의 외부 링크 등 운영팀이 직접 제공하지 않는 서비스에서
                  발생한 피해
                </li>
                <li>이용자의 귀책사유로 발생한 피해</li>
              </ol>

              <p className="mt-4 leading-7 text-gray-700">
                운영팀의 책임을 관계 법령에 반하여 부당하게 제한하거나 면제하지
                않습니다.
              </p>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>
                제11조(서비스 이용 제한 및 이용계약의 해지)
              </h2>

              <p className="leading-7 text-gray-700">
                이용자가 제6조(금지행위), 본 약관 또는 관계 법령을 위반한 경우
                운영팀은 위반의 정도에 따라 다음 각 호의 조치를 취할 수
                있습니다.
              </p>

              <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-gray-700">
                <li>경고 처리</li>
                <li>게시물의 삭제 또는 비공개 처리</li>
                <li>서비스 이용의 일부 또는 전부 제한</li>
                <li>이용계약의 해지 및 재가입 제한</li>
              </ol>

              <ol
                start={2}
                className="mt-5 list-decimal space-y-3 pl-5 leading-7 text-gray-700"
              >
                <li>
                  운영팀은 제1항의 조치를 취하는 경우 위반 내용, 반복 여부,
                  피해의 정도 등을 고려합니다.
                </li>

                <li>
                  긴급한 보호조치가 필요한 경우를 제외하고 운영팀은 서비스 내부
                  알림 등을 통해 조치의 사유를 이용자에게 통지합니다.
                </li>

                <li>
                  이용자는 조치 사실을 통지받은 날로부터 7일 이내에 문의처를
                  통해 이의를 제기할 수 있습니다.
                </li>

                <li>
                  운영팀은 이용자의 이의제기 내용을 확인한 후 조치의 유지·변경
                  또는 해제 여부를 결정할 수 있습니다.
                </li>

                <li>
                  운영팀은 이용자의 귀책사유로 인한 서비스 이용 제한 또는
                  이용계약의 해지로 발생한 피해에 대해 관계 법령에서 달리 정하는
                  경우를 제외하고 책임을 부담하지 않습니다.
                </li>
              </ol>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>
                제12조(회원 탈퇴 및 이용계약 종료)
              </h2>

              <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                <li>
                  이용자는 [마이페이지 &gt; 탈퇴하기]를 통해 언제든지 회원 탈퇴
                  및 서비스 이용계약의 종료를 요청할 수 있습니다.
                </li>

                <li>
                  이용자가 팀장인 경우 다른 팀원에게 팀장 권한을 위임하거나 팀을
                  삭제한 후 탈퇴할 수 있으며, 진행 중인 투표를 생성한 경우 해당
                  투표를 종료하는 등 다른 이용자의 서비스 이용에 영향을 미치는
                  사항을 정리한 후 탈퇴할 수 있습니다.
                </li>

                <li>
                  회원 탈퇴 후 개인정보의 처리에 관한 사항은 개인정보 처리방침을
                  따릅니다.
                </li>

                <li>
                  회원 탈퇴 후 팀 공동 일정, 채팅 등 공동 콘텐츠의 처리에 관한
                  사항은 제7조(게시물 및 저작권)에 따릅니다.
                </li>
              </ol>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>제13조(이용자에 대한 통지)</h2>

              <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                <li>
                  운영팀이 이용자에게 통지할 필요가 있는 경우 서비스 내부 알림,
                  이용자가 등록한 이메일 등을 이용할 수 있습니다.
                </li>

                <li>
                  전체 이용자에 대한 통지는 서비스 내 공지사항 게시로 갈음할 수
                  있습니다.
                </li>

                <li>
                  다만 이용자의 권리·의무에 중대한 영향을 미치는 사항은 개별
                  통지를 원칙으로 합니다.
                </li>
              </ol>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>제14조(문의 및 분쟁)</h2>

              <div className="space-y-4 leading-7 text-gray-700">
                <p>
                  서비스 이용 및 본 약관과 관련된 문의는 아래 연락처를 통해 할
                  수 있습니다.
                </p>

                <p>
                  이메일:{' '}
                  <a
                    href="mailto:moimi.official@gmail.com"
                    className="font-medium underline underline-offset-4"
                  >
                    moimi.official@gmail.com
                  </a>
                </p>

                <p>
                  운영팀과 이용자 사이에 분쟁이 발생한 경우 상호 협의를 통해
                  해결하도록 노력합니다.
                </p>

                <p>
                  협의로 해결되지 않는 경우 운영팀과 이용자 간에 발생한 분쟁에
                  관한 소송은 민사소송법 등 관계 법령에 따른 관할 법원에
                  제기합니다.
                </p>

                <p>
                  본 약관 및 서비스 이용과 관련된 사항에는 대한민국 법을
                  적용합니다.
                </p>
              </div>
            </section>

            <section className="py-8">
              <h2 className={sectionTitleClass}>제15조(기타)</h2>

              <ol className="list-decimal space-y-3 pl-5 leading-7 text-gray-700">
                <li>
                  본 약관에서 정하지 않은 사항은 관계 법령 및 일반적인 관례에
                  따릅니다.
                </li>

                <li>
                  커뮤니티 내 게시물 및 이용행위에 관한 구체적인 판단 기준은
                  별도로 게시된 커뮤니티 이용규칙을 따릅니다.
                </li>

                <li>
                  개인정보 처리에 관한 사항은 개인정보 처리방침을 따릅니다.
                </li>
              </ol>

              <p className="mt-6 leading-7 font-medium text-gray-900">
                본 약관은 [시행일]부터 적용됩니다.
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
