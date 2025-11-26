export default function TermPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">알록(Alog) 서비스 이용약관</h1>

        <div className="prose prose-slate max-w-none space-y-8 text-black/80">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제1조 (목적)</h2>
            <p className="text-base leading-relaxed">
              본 약관은 <strong>주식회사 알리</strong>(이하 "회사")가 제공하는 <strong>알록(Alog)</strong> 및 관련 제반 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제2조 (용어의 정의)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-base leading-relaxed">
              <li>"서비스"라 함은 구현되는 단말기(PC, 휴대형단말기 등 각종 유무선 장치를 포함)와 상관없이 "회원"이 이용할 수 있는 알록(Alog) 및 관련 제반 서비스를 의미합니다.</li>
              <li>"회원"이라 함은 회사의 "서비스"에 접속하여 이 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.</li>
              <li>"카카오싱크"라 함은 카카오 계정을 이용하여 간편하게 회원가입 및 로그인을 할 수 있는 기능을 말합니다.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제3조 (약관의 게시와 개정)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-base leading-relaxed">
              <li>"회사"는 이 약관의 내용을 "회원"이 쉽게 알 수 있도록 서비스 초기 화면 또는 연결화면에 게시합니다.</li>
              <li>"회사"는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
              <li>"회사"가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제4조 (이용계약 체결)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-base leading-relaxed">
              <li>이용계약은 "회원"이 되고자 하는 자가 약관의 내용에 대하여 동의를 한 다음, 카카오싱크 연동 등 "회사"가 정한 절차에 따라 가입을 신청하고 "회사"가 이를 승낙함으로써 체결됩니다.</li>
              <li>"회사"는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                <ol className="list-[lower-alpha] pl-6 mt-2 space-y-1">
                  <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>타인의 명의를 이용한 경우</li>
                  <li>허위의 정보를 기재하거나, "회사"가 제시하는 내용을 기재하지 않은 경우</li>
                  <li>부정한 용도로 본 서비스를 이용하고자 하는 경우</li>
                </ol>
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제5조 (회원정보의 변경)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-base leading-relaxed">
              <li>"회원"은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다.</li>
              <li>"회원"은 회원가입신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 기타 방법으로 "회사"에 대하여 그 변경사항을 알려야 합니다. 변경사항을 "회사"에 알리지 않아 발생한 불이익에 대하여 "회사"는 책임지지 않습니다.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제6조 (개인정보보호 의무)</h2>
            <p className="text-base leading-relaxed">
              "회사"는 "정보통신망법" 등 관계 법령이 정하는 바에 따라 "회원"의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 "회사"의 개인정보처리방침이 적용됩니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제7조 (회원의 의무)</h2>
            <p className="text-base leading-relaxed mb-2">"회원"은 다음 행위를 하여서는 안 됩니다.</p>
            <ol className="list-decimal pl-6 space-y-2 text-base leading-relaxed">
              <li>신청 또는 변경 시 허위내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>"회사"가 게시한 정보의 변경</li>
              <li>"회사" 및 기타 제3자의 저작권 등 지식재산권에 대한 침해</li>
              <li>"회사" 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제8조 (서비스의 제공)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-base leading-relaxed">
              <li>"회사"는 회원에게 아래와 같은 서비스를 제공합니다.
                <ol className="list-[lower-alpha] pl-6 mt-2 space-y-1">
                  <li><strong>구매 내역 조회 서비스:</strong> 알맹상점 및 제휴처에서의 상품 구매 목록, 영수증 데이터 확인 및 관리</li>
                  <li><strong>개인화 리포트 제공:</strong> 회원의 구매 데이터를 분석한 소비 성향, 탄소 저감 기여도, 이용 패턴 등에 관한 리포트 및 통계 제공</li>
                  <li><strong>정보 제공 서비스:</strong> 카카오 알림톡 등을 활용한 구매 정보, 리포트 결과, 이벤트 등 알림 발송</li>
                  <li>기타 "회사"가 추가 개발하거나 다른 회사와의 제휴 등을 통해 회원에게 제공하는 일체의 서비스</li>
                </ol>
              </li>
              <li>"회사"는 서비스를 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 단, 시스템 정기점검, 증설 및 교체 등 운영상 필요하다고 인정되는 경우 일정 기간 동안 서비스를 일시 중지할 수 있습니다.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제9조 (계약해제, 해지 등)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-base leading-relaxed">
              <li>"회원"은 언제든지 서비스 내 정보 관리 메뉴 등을 통하여 이용계약 해지 신청(회원탈퇴)을 할 수 있으며, "회사"는 관련 법령 등이 정하는 바에 따라 이를 즉시 처리하여야 합니다.</li>
              <li>"회원"이 계약을 해지할 경우, 관련 법령 및 개인정보처리방침에 따라 "회사"가 회원정보를 보유하는 경우를 제외하고는 해지 즉시 "회원"의 모든 데이터는 소멸됩니다.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제10조 (책임제한 및 면책)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-base leading-relaxed">
              <li>"회사"는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>"회사"는 "회원"의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
              <li><strong>"회사"가 제공하는 '개인 리포트' 및 분석 데이터는 "회원"의 구매 정보를 기반으로 산출된 참고용 자료입니다. 데이터 수집 시점의 차이, 기술적 오류 등으로 인해 실제 내용과 일부 차이가 있을 수 있으며, "회사"는 자료의 절대적 정확성이나 완전성을 보증하지 않습니다. "회원"이 이 정보를 활용하여 발생한 결과에 대해 "회사"는 책임을 지지 않습니다.</strong></li>
              <li>"회사"는 "회원"이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">제11조 (준거법 및 재판관할)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-base leading-relaxed">
              <li>"회사"와 "회원" 간 제기된 소송은 대한민국법을 준거법으로 합니다.</li>
              <li>"회사"와 "회원"간 발생한 분쟁에 관한 소송은 민사소송법 상의 관할법원에 제소합니다.</li>
            </ol>
          </section>

          <section className="space-y-4 mt-12">
            <h2 className="text-2xl font-bold text-black mt-10 mb-4">부칙</h2>
            <p className="text-base leading-relaxed">
              이 약관은 2025년 12월 1일부터 적용됩니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

