import type { Step } from "../data";

/** 위에서부터 차례로 확인하는 단계 목록. index 앞은 완료, index는 확인 중, 뒤는 대기. */
export function StepList({ steps, index, small }: { steps: Step[]; index: number; small?: boolean }) {
  return (
    <ol className={`ck-list${small ? " sm" : ""}`} aria-live="polite">
      {steps.map((s, i) => {
        const st = i < index ? "done" : i === index ? "now" : "wait";
        const d = st === "done" ? s.done : st === "now" ? s.now : "기다리는 중";
        return (
          <li key={s.t} className={`ck-step ${st}`}>
            <span className="ck-mark">
              <span className="ck-dot" />
              <span className="ck-line" />
            </span>
            <span className="ck-text">
              <span className="t">{s.t}</span>
              <span className="d">{d}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** 단계를 stepGap 간격으로 하나씩 진행시키는 훅용 헬퍼 */
export const allDone = (steps: Step[], index: number) => index >= steps.length;
