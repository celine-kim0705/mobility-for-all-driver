import { useState } from "react";
import { CALL } from "../data";
import { Chips } from "../components/Chips";
import { TopBar } from "../components/TopBar";
import { useApp } from "../AppContext";
import { useMount } from "../hooks/useTimers";
import { hm } from "../util";
import type { NavProps } from "./types";

const QUICK = ["도착했어요", "정문 앞이에요", "천천히 오세요"];

/** 도착 · 손님 찾기 */
export function MeetScreen({ nav, onNoRide, onMet }: { nav: NavProps; onNoRide: () => void; onMet: () => void }) {
  const { speak, toast } = useApp();
  const [sent, setSent] = useState<string | null>(null);
  const [showPhone, setShowPhone] = useState(false);

  useMount(() => speak("도착했어요. 손님에게 도착 알림을 보냈어요"));

  const send = (msg: string) => {
    setSent(msg);
    toast(`${hm()} 손님에게 ‘${msg}’를 보냈어요`);
    setTimeout(() => setSent((s) => (s === msg ? null : s)), 2500);
  };

  return (
    <section className="view" aria-label="도착했어요">
      <TopBar {...nav} />
      <div className="ck-head">
        <h1>도착했어요</h1>
        <p>손님에게 도착 알림을 보냈어요</p>
      </div>
      <div className="mt-body">
        <div className="mt-card">
          <span className="k">손님</span>
          <span className="who">{CALL.wheel}</span>
          <Chips items={CALL.meetChips} />
          <div className="hr" style={{ marginTop: 0 }} />
          <span className="k">만날 곳</span>
          <span className="where">{CALL.from.join(" ")}</span>
        </div>
        <span className="mt-q">손님에게 보내기</span>
        <div className="dp-chips mt-quick">
          {QUICK.map((m) => (
            <button key={m} className={sent === m ? "sent" : ""} onClick={() => send(m)}>
              {sent === m ? "보냄 ✓" : m}
            </button>
          ))}
        </div>
        <button className="mt-call" onClick={() => setShowPhone(true)}>
          손님에게 전화하기
        </button>
        {showPhone && <div className="phone">안심번호 {CALL.phone} (예시) · 정차 중에만 걸어 주세요</div>}
      </div>
      <div className="grow" />
      <div className="nr-foot mt-foot">
        <p>
          손님을 못 만났나요?&nbsp;{" "}
          <button className="mt-noride" onClick={onNoRide}>
            못 탔어요 ›
          </button>
        </p>
        <button className="primary" style={{ marginTop: 0 }} onClick={onMet}>
          손님 만났어요
        </button>
      </div>
    </section>
  );
}
