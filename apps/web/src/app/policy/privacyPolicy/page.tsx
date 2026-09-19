import { Suspense } from 'react';
import Header from '@/components/common/Header';

const pageName = '개인정보처리방침';

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
          {/* 문서 상단 */}
          <header className="border-b border-gray-200 pb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              모이미 개인정보 처리방침
            </h1>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>시행일: [시행일]</span>
              <span>버전: v1.0</span>
            </div>

            <div className="mt-6 space-y-3 leading-7 text-gray-700">
              <p>
                모이미 운영팀(이하 &quot;운영팀&quot;)은 모이미 서비스(이하
                &quot;서비스&quot;)를 운영하며, 이용자의 개인정보를 중요하게
                생각하고 「개인정보 보호법」 등 관계 법령을 준수합니다.
              </p>

              <p>
                본 처리방침은 운영팀이 어떤 개인정보를 어떤 목적으로 처리하고
                어떻게 보호하는지 안내합니다.
              </p>

              <p>
                운영팀은 별도의 법인 또는 사업자가 아닌, 인천대학교 학생들이
                자발적으로 운영하는 개발 동아리(인천대 앱센터)의 모이미
                운영팀이며, 본 개인정보 처리방침은 모이미 서비스 운영 범위에
                적용됩니다.
              </p>
            </div>
          </header>

          <div className="divide-y divide-gray-200">
            {/* 1 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>1. 개인정보의 처리 목적</h2>

              <p className="leading-7 text-gray-700">
                운영팀은 모이미 서비스 제공을 위해 필요한 최소한의 개인정보만을
                처리합니다.
              </p>

              <ul className={listClass}>
                <li>
                  회원 가입 및 관리: 가입 의사 확인, 회원 식별, 계정 관리, 부정
                  이용 방지
                </li>
                <li>
                  서비스 제공: 팀 생성 및 참여, 팀원 모집, 일정 관리, 투표,
                  공지, 채팅 기능 제공, 부정 이용 방지
                </li>
                <li>학교 인증: 재학생 여부 확인 및 중복 인증 방지</li>
                <li>
                  알림 제공: 팀 초대, 일정, 공지, 채팅 등 서비스 이용에 필요한
                  알림 발송
                </li>
                <li>
                  서비스 운영 및 개선: 오류 대응, 이용 통계 분석, 보안 및 서비스
                  품질 개선
                </li>
                <li>민원 처리: 문의, 요청 및 분쟁 대응</li>
              </ul>
            </section>

            {/* 2 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>
                2. 처리하는 개인정보 항목 및 보유 기간
              </h2>

              <h3 className={subsectionTitleClass}>
                가. 회원가입 및 계정 관리
              </h3>
              <ul className={listClass}>
                <li>필수 항목: 아이디, 비밀번호, 이메일 주소, 이름, 학과</li>
                <li>선택 항목: 프로필 이미지</li>
                <li>
                  법적 근거: 「개인정보 보호법」 제15조제1항제4호(계약의 체결 및
                  이행을 위하여 필요한 경우)
                </li>
                <li>
                  보유 기간: 회원 탈퇴 시까지. 단, 관계 법령에 따라 보관이
                  필요한 경우에는 해당 기간 동안 보관합니다.
                </li>
              </ul>

              <h3 className={subsectionTitleClass}>나. 학교 인증</h3>
              <ul className={listClass}>
                <li>
                  처리 항목: 학번, 포털 인증을 위해 이용자가 입력한 포털 계정
                  정보
                </li>
                <li>이용 목적: 재학생 여부 확인 및 중복 인증 방지</li>
                <li>
                  보유 기간: 학번은 회원 탈퇴 시까지 보관하며, 포털 비밀번호는
                  인증 처리 후 저장하지 않습니다.
                </li>
              </ul>

              <h3 className={subsectionTitleClass}>
                다. 서비스 이용 과정에서 생성되는 정보
              </h3>
              <ul className={listClass}>
                <li>
                  처리 항목: 팀 정보, 팀원 정보, 일정 및 투표 정보, 모집글·지원
                  내용, 공지, 채팅 메시지, 첨부 이미지, 알림 내역, 스크랩 내역,
                  문의 내역
                </li>
                <li>이용 목적: 이용자가 요청한 서비스 기능 제공</li>
                <li>보유 기간: 회원 탈퇴 또는 해당 콘텐츠 삭제 시까지</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                다만, 팀 공동 일정과 채팅방의 메시지·첨부 이미지는 팀 운영 및
                대화 기록의 연속성을 위해 회원 탈퇴 후에도 해당 일정 또는
                채팅방이 삭제될 때까지 보관합니다. 회원 탈퇴 시 해당 이용자의
                계정 정보와 채팅방·팀 멤버 정보는 삭제하며, 보관되는 공동
                콘텐츠의 작성자 정보는 이용자를 직접 식별할 수 없도록
                처리합니다.
              </p>

              <h3 className={subsectionTitleClass}>라. 알림 기능</h3>
              <ul className={listClass}>
                <li>처리 항목: 기기 알림 토큰(FCM Token), 알림 설정 정보</li>
                <li>이용 목적: 서비스 이용에 필요한 푸시 알림 발송</li>
                <li>
                  보유 기간: 알림 토큰 삭제, 로그아웃, 회원 탈퇴 또는 토큰
                  유효성 상실 시까지
                </li>
              </ul>

              <h3 className={subsectionTitleClass}>
                마. 서비스 이용 및 접속 기록
              </h3>
              <ul className={listClass}>
                <li>
                  처리 항목: 접속 일시, 서비스 이용 기록, 오류 기록, IP 주소,
                  기기·브라우저 정보
                </li>
                <li>
                  이용 목적: 서비스 안정성 확보, 부정 이용 방지, 오류 분석 및
                  보안 대응
                </li>
                <li>보유 기간: [보유 기간]</li>
              </ul>
            </section>

            {/* 3 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>3. 개인정보의 제3자 제공</h2>

              <p className="leading-7 text-gray-700">
                운영팀은 원칙적으로 이용자의 개인정보를 제3자에게 제공하지
                않습니다. 다만 다음의 경우에는 예외로 합니다.
              </p>

              <ul className={listClass}>
                <li>이용자가 사전에 제3자 제공에 동의한 경우</li>
                <li>
                  법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여
                  필요한 경우
                </li>
                <li>
                  적법한 절차에 따라 수사기관 등 관계기관이 개인정보 제공을
                  요구하는 경우
                </li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                향후 개인정보를 제3자에게 제공하는 경우 제공받는 자, 제공 목적,
                제공 항목 및 보유·이용기간 등을 본 개인정보 처리방침을 통해
                안내합니다.
              </p>
            </section>

            {/* 4 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>
                4. 개인정보 처리의 위탁 및 국외 이전
              </h2>

              <p className="leading-7 text-gray-700">
                운영팀은 서비스 제공을 위해 다음 외부 서비스를 이용합니다.
              </p>

              <div className="mt-5 space-y-5">
                <div className="rounded-xl bg-gray-50 p-5">
                  <h3 className="font-semibold text-gray-900">
                    Amazon Web Services, Inc. (Amazon S3)
                  </h3>
                  <ul className={listClass}>
                    <li>
                      위탁 업무: 프로필 이미지 및 서비스 내 첨부 이미지 저장
                    </li>
                    <li>
                      처리 항목: 이용자가 업로드한 이미지 파일 및 파일 식별 정보
                    </li>
                    <li>보유 기간: 회원 탈퇴 또는 이미지 삭제 시까지</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-gray-50 p-5">
                  <h3 className="font-semibold text-gray-900">
                    Google LLC (Firebase Cloud Messaging)
                  </h3>
                  <ul className={listClass}>
                    <li>위탁 업무: 서비스 푸시 알림 발송</li>
                    <li>
                      처리 항목: 기기 알림 토큰, 알림 발송에 필요한 메시지 정보
                    </li>
                    <li>
                      보유 기간: 토큰 삭제, 회원 탈퇴 또는 서비스 제공 종료
                      시까지
                    </li>
                  </ul>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-gray-500">
                ※ 위 서비스의 실제 데이터 처리 국가, 이전 일시·방법 및 수탁자
                연락처는 운영 환경과 계약 내용을 확인한 뒤 본문에 구체적으로
                기재합니다.
              </p>
            </section>

            {/* 5 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>
                5. 개인정보의 파기 절차 및 방법
              </h2>

              <p className="leading-7 text-gray-700">
                운영팀은 개인정보의 보유 기간이 경과하거나 처리 목적이 달성된
                경우 지체 없이 해당 개인정보를 파기합니다.
              </p>

              <ul className={listClass}>
                <li>
                  전자적 파일 형태의 정보는 복구할 수 없는 방법으로 삭제합니다.
                </li>
                <li>이미지 파일은 저장소에서 삭제합니다.</li>
                <li>
                  법령에 따라 보존해야 하는 정보는 해당 법령이 정한 기간 동안
                  별도 보관한 후 파기합니다.
                </li>
              </ul>
            </section>

            {/* 6 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>
                6. 이용자의 권리 및 행사 방법
              </h2>

              <p className="leading-7 text-gray-700">
                회원 탈퇴는 서비스 내 회원 탈퇴 기능을 통해 요청할 수 있습니다.
                다만, 이용자가 팀장인 경우에는 다른 팀원에게 팀장 권한을
                위임하거나 팀을 삭제한 후 탈퇴할 수 있으며, 진행 중인 투표를
                생성한 경우에는 해당 투표를 종료한 후 탈퇴할 수 있습니다.
              </p>

              <ul className={listClass}>
                <li>회원정보 조회·수정: 마이페이지 &gt; 회원정보</li>
                <li>회원 탈퇴: 마이페이지 &gt; 설정 &gt; 회원탈퇴</li>
                <li>개인정보 관련 요청: 마이페이지 &gt; 문의하기</li>
              </ul>

              <div className="mt-4 space-y-3 leading-7 text-gray-700">
                <p>
                  운영팀은 이용자의 정당한 개인정보 관련 요청을 확인한 후 관계
                  법령에 따라 필요한 조치를 취합니다.
                </p>
                <p>
                  다른 법령에서 해당 개인정보의 보존을 요구하는 경우 등에는
                  개인정보 삭제 또는 처리정지 요청이 제한될 수 있습니다.
                </p>
              </div>
            </section>

            {/* 7 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>
                7. 개인정보의 안전성 확보 조치
              </h2>

              <ul className={listClass}>
                <li>비밀번호의 암호화 저장</li>
                <li>접근 권한 관리 및 최소 권한 부여</li>
                <li>개인정보 처리 시스템의 접근 기록 관리</li>
                <li>전송 구간 암호화 등 안전한 통신 환경 적용</li>
                <li>외부 저장소 및 알림 서비스의 접근 키 관리</li>
              </ul>
            </section>

            {/* 8 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>
                8. 서비스 운영진의 개인정보 접근
              </h2>

              <p className="leading-7 text-gray-700">
                운영팀의 관리자 및 개인정보 취급자는 서비스 운영에 필요한
                최소한의 범위에서만 이용자의 개인정보에 접근합니다.
              </p>

              <ul className={listClass}>
                <li>문의 및 신고 처리</li>
                <li>부정 이용 확인 및 이용 제한</li>
                <li>서비스 장애 및 오류 대응</li>
                <li>회원 관리</li>
                <li>서비스 운영에 필요한 업무 수행</li>
              </ul>

              <p className="mt-4 leading-7 text-gray-700">
                개인정보에 대한 접근 권한은 업무에 필요한 인원에게만 부여합니다.
              </p>
            </section>

            {/* 9 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>
                9. 만 14세 미만 아동의 개인정보
              </h2>

              <p className="leading-7 text-gray-700">
                서비스는 만 14세 이상 이용자만 회원가입할 수 있습니다. 이용자가
                만 14세 미만인 사실이 확인된 경우 운영팀은 해당 계정의 이용을
                제한하거나 삭제할 수 있습니다.
              </p>
            </section>

            {/* 10 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>
                10. 개인정보 보호책임자 및 문의처
              </h2>

              <p className="leading-7 text-gray-700">
                개인정보와 관련한 문의, 불만 처리 및 피해 구제는 아래로 연락할
                수 있습니다.
              </p>

              <div className="mt-4 rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-700 sm:text-base">
                <p>
                  <span className="font-medium text-gray-900">
                    개인정보 보호책임자
                  </span>
                  : 모이미 운영팀
                </p>
                <p>
                  <span className="font-medium text-gray-900">이메일</span>:{' '}
                  <a
                    href="mailto:moimi.official@gmail.com"
                    className="underline underline-offset-4"
                  >
                    moimi.official@gmail.com
                  </a>
                </p>
              </div>
            </section>

            {/* 11 */}
            <section className="py-8">
              <h2 className={sectionTitleClass}>
                11. 개인정보 처리방침의 변경
              </h2>

              <div className="space-y-3 leading-7 text-gray-700">
                <p>
                  본 처리방침은 법령, 서비스 또는 개인정보 처리 방식의 변경에
                  따라 수정될 수 있습니다.
                </p>

                <p>
                  중요한 변경이 있는 경우 시행일 7일 전부터 서비스 내 공지 또는
                  홈페이지를 통해 안내합니다. 이전 개인정보 처리방침이 있는 경우
                  이용자가 이전 내용을 확인할 수 있도록 공개합니다.
                </p>

                <p className="font-medium text-gray-900">
                  본 처리방침은 [시행일]부터 적용합니다.
                </p>
              </div>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
