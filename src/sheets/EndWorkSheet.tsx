import { Layer } from "../components/Layer";

export function EndWorkSheet({ trips, startedAt, onClose, onConfirm }: { trips: number; startedAt: string | null; onClose: () => void; onConfirm: () => void }) {
  return (
    <Layer onClose={onClose}>
      <h2>근무를 마칠까요?</h2>
      <p className="lead">
        오늘 운행 {trips}건 · 근무 시작 {startedAt}
        <br />
        근무를 마치면 배차 후보에서 빠져요.
      </p>
      <button className="primary" style={{ marginTop: 4 }} onClick={onConfirm}>
        근무 종료
      </button>
      <button className="ghost" onClick={onClose}>
        계속 근무하기
      </button>
    </Layer>
  );
}
