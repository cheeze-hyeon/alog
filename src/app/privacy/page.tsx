export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">알록 개인정보 처리방침</h1>

        <div className="prose prose-slate max-w-none space-y-8 text-black/80">
          <p className="text-base leading-relaxed">
            <strong>주식회사 알리</strong>(이하 '회사')은(는) 이용자의 개인정보를 중요시하며, "개인정보 보호법"을 준수하고 있습니다.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-base leading-relaxed">회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
              <li><strong>회원 관리:</strong> 본인 확인, 개인 식별, 부정이용 방지, 가입 의사 확인, 연령 확인</li>
              <li><strong>서비스 제공:</strong> 스마트 영수증 관리, 구매 내역 조회 및 관리, 알맹 히스토리 제공</li>
              <li><strong>메시지 발송:</strong> 서비스 이용 관련 중요 공지사항, 주문/배송/예약 정보, 정보성 메시지(알림톡) 발송</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">2. 수집하는 개인정보의 항목</h2>
            <p className="text-base leading-relaxed">회사는 카카오 간편 로그인을 통해 아래와 같은 개인정보를 수집합니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
              <li><strong>필수 항목:</strong> <strong>휴대전화번호</strong>, <strong>성별</strong>, <strong>출생 연도</strong></li>
              <li><strong>선택 항목:</strong> 이름, 생일</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-base leading-relaxed">
              이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 단, 다음의 정보는 아래의 이유로 명시한 기간 동안 보존합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
              <li><strong>보존 항목:</strong> 휴대전화번호, 가입 인증 정보</li>
              <li><strong>보존 근거:</strong> 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 종료 시까지)</li>
              <li><strong>알림톡 발송 이력:</strong> 발송 내역 증빙을 위해 NHN Cloud 등 위탁 업체 시스템 내 발송 로그가 최대 1년간 보관될 수 있음</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">4. 개인정보 처리 위탁</h2>
            <p className="text-base leading-relaxed mb-4">
              회사는 원활한 서비스 제공(알림톡 발송 등)을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black/20 text-base">
                <thead>
                  <tr className="bg-black/5">
                    <th className="border border-black/20 px-4 py-3 text-left font-semibold">수탁 업체</th>
                    <th className="border border-black/20 px-4 py-3 text-left font-semibold">위탁 업무 내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black/20 px-4 py-3"><strong>엔에이치엔클라우드(주) (NHN Cloud)</strong></td>
                    <td className="border border-black/20 px-4 py-3"><strong>카카오 알림톡 및 문자 메시지(SMS/LMS) 발송 대행, 시스템 운영</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">5. 개인정보의 파기 절차 및 방법</h2>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
              <li><strong>파기 절차:</strong> 이용자가 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.</li>
              <li><strong>파기 방법:</strong> 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">6. 개인정보 보호책임자</h2>
            <p className="text-base leading-relaxed mb-4">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed">
              <li><strong>책임자 성명:</strong> 고금숙</li>
              <li><strong>이메일:</strong> zero@almang.net</li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t border-black/10">
            <p className="text-sm text-black/60">
              본 개인정보 처리방침은 관련 법령 및 지침의 변경 또는 회사 정책의 변경에 따라 개정될 수 있으며, 
              개정 시에는 웹사이트를 통해 공지하겠습니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

