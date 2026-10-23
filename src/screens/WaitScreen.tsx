import { DRIVER } from "../data";
import { StatusPill, TopBar } from "../components/TopBar";
import { addHours } from "../util";
import type { NavProps, SubState } from "./types";

const SUBS = {
  rest: { pill: "휴게 중", title: "쉬는 중이에요", btn: "휴게 끝 — 배차 받기" },
  general: { pill: "일반 손님 운행", title: "일반 손님 운행 중", btn: "일반 손님 내림 — 배차 받기" },
} as const;

interface Props {
  nav: NavProps;
  sub: SubState;
  startedAt: string | null;
  onSub: (s: Exclude<SubState, null>) => void;
  onResume: () => void;
  onEnd: () => void;
  onReport: () => void;
}

/** D10 대기: 다음 손님 기다리는 중 */
export function WaitScreen({ nav, sub, startedAt, onSub, onResume, onEnd, onReport }: Props) {
  const s = sub ? SUBS[sub] : null;
  return (
    <section className="view" aria-label="대기">
      <TopBar {...nav} left={<StatusPill id="wait-pill" tone={s ? "paused" : "live"} label={s ? `${s.pill} · 배차 제외` : "배차 받는 중"} />} />
      <div className="grow" />
      <div className="hello">
        <div className="sub" style={{ fontSize: "clamp(26px,8.6vw,32px)", fontWeight: 700 }}>
          {s ? s.title : "다음 손님 기다리는 중"}
        </div>
        <div className="meta">
          근무 시작 {startedAt} · 종료 예정 {startedAt ? addHours(startedAt, DRIVER.workHours) : DRIVER.endTime}
        </div>
      </div>
      <div className="grow" />
      <div className="sheet">
        <div className="kind">{DRIVER.plate}</div>
        <div className="chips">
          <div className="chip">{DRIVER.battery}</div>
          <div className="chip">남은 장콜 {DRIVER.quota}건</div>
        </div>
        {s ? (
          <button className="primary" onClick={onResume}>
            {s.btn}
          </button>
        ) : (
          <div className="states">
            <button onClick={() => onSub("rest")}>휴게</button>
            <button onClick={() => onSub("general")}>
              일반 손님
              <br />
              태움
            </button>
            <button className="end" onClick={onEnd}>
              근무 종료
            </button>
          </div>
        )}
        <button className="sub-link" onClick={onReport}>
          장비 이상 신고
        </button>
      </div>
    </section>
  );
}

export const subSpeech = (s: Exclude<SubState, null>) =>
  s === "rest" ? "휴게를 시작했어요" : "일반 손님 운행 중에는 배차를 받지 않아요";
