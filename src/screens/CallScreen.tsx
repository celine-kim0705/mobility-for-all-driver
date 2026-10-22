import { useState } from "react";
import { CALL, TIMING } from "../data";
import { Chips } from "../components/Chips";
import { useApp } from "../AppContext";
import { useInterval, useMount } from "../hooks/useTimers";
import { mss, vibrate } from "../util";

/** 새 호출: 수락 카운트다운. 시간이 지나면 다른 기사에게 넘어간다. */
export function CallScreen({ onAccept, onMiss }: { onAccept: () => void; onMiss: () => void }) {
  const { speak } = useApp();
  const limit = TIMING.acceptLimit;
  const [left, setLeft] = useState(limit);

  useMount(() => {
    vibrate([400, 200, 400]);
    speak(`새 호출. ${CALL.from.join(" ")}. ${CALL.chips.slice(0, 2).join(", ")}. ${CALL.dist.replace("·", ",")}`);
  });

  useInterval(
    () => {
      const next = left - 1;
      setLeft(next);
      if (next === 10) speak("수락 시간이 10초 남았어요");
      if (next <= 0) onMiss();
    },
    left > 0 ? 1000 : null,
  );

  return (
    <section className="view" aria-label="새 호출">
      <div className={`call-top${left <= 10 ? " urgent" : ""}`}>
        <div className="line">
          <span>새 호출</span>
          <span className="timer">{mss(left)}</span>
        </div>
        <div className="bar" role="progressbar" aria-label="수락 남은 시간" aria-valuenow={left} aria-valuemax={limit}>
          <i style={{ transform: `scaleX(${left / limit})` }} />
        </div>
      </div>
      <div className="call-body">
        <span className="ptag">♿ 휠체어 손님</span>
        <span className="lbl">출발</span>
        <div className="from">
          {CALL.from[0]}
          <br />
          {CALL.from[1]}
        </div>
        <div className="addr">{CALL.fromAddr}</div>
        <div className="dist">{CALL.dist}</div>
        <div className="hr" />
        <span className="lbl">도착</span>
        <div className="to">{CALL.to}</div>
        <div className="addr">{CALL.toAddr}</div>
      </div>
      <div className="grow" />
      <div className="sheet left">
        <Chips items={CALL.chips} />
        <div className="memo">“{CALL.memo}”</div>
        <button className="primary" onClick={onAccept}>
          수락
        </button>
      </div>
    </section>
  );
}
