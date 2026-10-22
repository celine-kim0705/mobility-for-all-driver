import { useRef, useState } from "react";
import { CALL, TIMING } from "../data";
import { Chips } from "../components/Chips";
import { useApp } from "../AppContext";
import { useInterval } from "../hooks/useTimers";
import { hm, kmText } from "../util";

const { km, sec, speed } = TIMING.route;

const etaText = (r: number) => (r <= 0 ? "도착" : r < 60 ? "1분 미만" : `${Math.ceil(r / 60)}분`);

/** 수락 후: 출발지로 이동 중. 데모는 speed배속으로 진행한다. */
export function GoScreen({ acceptedAt, onArrive }: { acceptedAt: Date; onArrive: () => void }) {
  const { speak, toast } = useApp();
  const [elapsed, setElapsed] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const warned = useRef(false);
  const r = Math.max(0, sec - elapsed);
  const near = r <= (sec * 0.1) / km; // 100m 안

  useInterval(
    () => {
      const next = elapsed + speed;
      setElapsed(next);
      const left = sec - next;
      if (!warned.current && left <= 180 && left > 0) {
        warned.current = true;
        speak("출발지까지 3분 남았어요. 승객에게 곧 도착한다고 알렸어요");
        toast("승객에게 ‘3분 뒤 도착’을 알렸어요");
      }
      if (left <= 0) speak("출발지에 도착했어요. 승객을 받을 자리에 서면 도착했어요를 눌러 주세요");
    },
    r > 0 ? 1000 : null,
  );

  return (
    <section className="view" aria-label="출발지로 이동 중">
      <div className={`call-top go-top${near ? " near" : ""}`}>
        <div className="line">
          <span>{r <= 0 ? "출발지 도착" : near ? "출발지 근처예요" : "출발지로 이동 중"}</span>
          <span className="timer eta">{etaText(r)}</span>
        </div>
        <div className="bar" role="progressbar" aria-label="출발지까지 진행">
          <i style={{ transform: `scaleX(${elapsed / sec})` }} />
        </div>
        <div className="go-sub">
          <span>수락 {hm(acceptedAt)}</span>
          <span>도착 예정 {hm(new Date(acceptedAt.getTime() + sec * 1000))}</span>
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
        <div className="dist">{r > 0 ? `${kmText((km * r) / sec)} · 약 ${etaText(r)} 남음` : "출발지에 도착했어요"}</div>
        <div className="hr" />
        <span className="lbl">도착</span>
        <div className="to">{CALL.to}</div>
        <div className="addr">{CALL.toAddr}</div>
      </div>
      <div className="grow" />
      <div className="sheet left">
        <Chips items={CALL.chips} />
        <div className="memo">“{CALL.memo}”</div>
        <div className="go-actions">
          <a href={`https://map.kakao.com/link/search/${encodeURIComponent(CALL.fromAddr)}`} target="_blank" rel="noopener noreferrer">
            길 안내
          </a>
          <button onClick={() => setShowPhone(true)}>승객 연락</button>
        </div>
        {showPhone && <div className="phone">안심번호 {CALL.phone} (예시) · 정차 중에만 걸어 주세요</div>}
        <button className="primary" onClick={onArrive}>
          도착했어요
        </button>
      </div>
    </section>
  );
}
