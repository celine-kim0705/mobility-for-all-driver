/** 공지 상세 */
export function NoticeScreen({ onBack }: { onBack: () => void }) {
  return (
    <section className="view" aria-label="공지">
      <header className="topbar">
        <button className="back" onClick={onBack}>
          <span aria-hidden="true">‹</span> 뒤로
        </button>
        <span />
      </header>
      <article className="article">
        <h1>[공지] 휠체어 고정 장치 점검 안내</h1>
        <div className="tm">관제센터 · 10월 22일 08:30</div>
        <p>10월 한 달 동안 휠체어 고정 장치 집중 점검을 진행합니다. 근무 시작 전에 아래 항목을 꼭 확인해 주세요.</p>
        <ol>
          <li>4점 고정 벨트가 끝까지 감기고 잠금 소리가 나는지</li>
          <li>슬로프가 끝까지 펴지고 수납 후 흔들리지 않는지</li>
          <li>승객 안전벨트 버클이 정상으로 잠기는지</li>
        </ol>
        <p>
          하나라도 이상하면 <strong>근무를 시작하지 말고 장비 이상 신고</strong>를 눌러 주세요. 신고한 날은 배차 후보에서 빠지고, 관제가 정비 일정을 안내합니다.
        </p>
        <p>이 공지는 예시 문구입니다.</p>
      </article>
      <div className="sheet" style={{ borderRadius: 0, paddingTop: 16 }}>
        <button className="primary" style={{ marginTop: 0 }} onClick={onBack}>
          확인했어요
        </button>
      </div>
    </section>
  );
}
