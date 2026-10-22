import { useRef, useState } from "react";
import { CALL, FARE, TIMING } from "../data";
import { TopBar } from "../components/TopBar";
import { useApp } from "../AppContext";
import { useInterval, useMount, useTimeout } from "../hooks/useTimers";
import { hm, kmText, vibrate } from "../util";
import type { NavProps } from "./types";

const { min, km, msgAt, msg } = TIMING.ride;
const REPLIES = ["네, 알겠어요", "곧 도착해요"];

type Msg = { kind: "in" | "sent"; head: string; text: string } | null;

/** 운행 중 → 목적지 도착. 데모는 1초에 1분씩 줄어든다. */
export function RideScreen({ nav, onArrived }: { nav: NavProps; onArrived: () => void }) {
  const { speak, toast } = useApp();
  const [left, setLeft] = useState(min);
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState<Msg>(null);
  const [arrivedAt, setArrivedAt] = useState<string | null>(null);
  const nearSaid = useRef(false);
  const hideTimer = useRef<number>();

  const done = left <= 0;
  const leftKm = (km * left) / min;
  const near = leftKm <= 1;

  useMount(() => speak(`출발합니다. ${CALL.to}까지 약 ${min}분이에요`));

  useInterval(
    () => {
      const t = tick + 1;
      setTick(t);
      if (t === msgAt) {
        setMessage({ kind: "in", head: "손님 메시지", text: msg });
        vibrate(200);
        speak(`손님 메시지. ${msg}`);
      }
      const next = left - 1;
      setLeft(next);
      if (!nearSaid.current && (km * next) / min <= 1) {
        nearSaid.current = true;
        speak("곧 하차예요. 슬로프를 준비해 주세요");
      }
      if (next <= 0) {
        setArrivedAt(hm());
        speak("목적지에 도착했어요. 하차를 도와주세요");
      }
    },
    done ? null : 1000,
  );

  // 도착하고 잠시 뒤 하차 화면으로
  useTimeout(onArrived, done ? TIMING.dropAfterArrive : null);

  const reply = (text: string) => {
    setMessage({ kind: "sent", head: `${hm()} 답장 보냄`, text });
    toast(`손님에게 ‘${text}’를 보냈어요`);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setMessage((m) => (m?.kind === "sent" ? null : m)), 4000);
  };

  const stateText = done ? "관제에 ‘하차 중’으로 보여요" : near ? "관제에 ‘곧 하차’로 보이고 있어요" : "1km 전부터 관제에 ‘곧 하차’로 보여요";

  return (
    <section className="view" aria-label="운행 중">
      <TopBar {...nav} />
      <div className="ck-head">
        <h1>{done ? "목적지 도착" : "운행 중"}</h1>
        <p className="rd-eta">{done ? `${arrivedAt} 도착 · 하차를 도와주세요` : `도착까지 약 ${left}분 · ${kmText(leftKm)}`}</p>
      </div>
      <div className="rd-body">
        {message && (
          <div className={`rd-msg${message.kind === "sent" ? " sent" : ""}`} aria-live="assertive">
            <span className="k">{message.head}</span>
            <span className="m">“{message.text}”</span>
          </div>
        )}
        {done ? (
          <div className="rd-pay">
            <span className="lbl" style={{ marginTop: 0 }}>
              결제 금액
            </span>
            <span className="amt">{FARE.label}</span>
            <div className="pay-row">
              <span className="chip">앱카드 결제</span>
              <span className="pay-auto">자동으로 결제됩니다</span>
              <span className="pay-load" role="status">
                <i className="spin" aria-hidden="true" />
                결제 진행 중
              </span>
            </div>
          </div>
        ) : (
          <div className="rd-nav">
            <span>카카오내비로 안내 중</span>
            <a className="chip" href={`https://map.kakao.com/link/search/${encodeURIComponent(CALL.to)}`} target="_blank" rel="noopener noreferrer">
              내비 열기
            </a>
          </div>
        )}
        <div className="rd-to">
          <span className="lbl" style={{ marginTop: 0 }}>
            도착
          </span>
          <span className="to">{CALL.to}</span>
          <span className="addr">{CALL.toAddr}</span>
        </div>
        <div className={`rd-state${near || done ? " on" : ""}`}>
          <i />
          <span>{stateText}</span>
        </div>
      </div>
      <div className="grow" />
      <div className="rd-sheet">
        {done ? (
          <button className="primary ck-go" disabled>
            운행 끝내기
          </button>
        ) : (
          <>
            <span className="rd-q">손님에게 답하기</span>
            <div className="rd-replies">
              {REPLIES.map((r) => (
                <button key={r} onClick={() => reply(r)}>
                  {r}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
