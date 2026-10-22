import { useRef, useState } from "react";
import { NORIDE_REASONS } from "../data";
import { TopBar } from "../components/TopBar";
import { useInterval } from "../hooks/useTimers";
import { mss } from "../util";
import type { NavProps } from "./types";

interface Props {
  nav: NavProps;
  arrivedAt: number;
  onBack: () => void;
  onReport: (label: string, waited: string) => void;
}

/** 도착 · 못 탄 이유: 이유를 골라 미탑승을 보고한다 */
export function NoRideScreen({ nav, arrivedAt, onBack, onReport }: Props) {
  const [, tick] = useState(0);
  const [reason, setReason] = useState<string | null>(null);
  const [etc, setEtc] = useState("");
  const etcRef = useRef<HTMLTextAreaElement>(null);
  useInterval(() => tick((n) => n + 1), 1000);

  const waited = mss(Math.floor((Date.now() - arrivedAt) / 1000));

  return (
    <section className="view" aria-label="손님이 못 탔나요">
      <TopBar {...nav} />
      <div className="nr-head">
        <h1>손님이 못 탔나요?</h1>
        <p>기다린 시간 {waited}</p>
      </div>
      <div className="nr-list" role="radiogroup" aria-label="못 탄 이유">
        {NORIDE_REASONS.map((r) => (
          <button
            key={r.k}
            className="reason"
            role="radio"
            aria-checked={reason === r.k}
            onClick={() => {
              setReason(r.k);
              if (r.k === "etc") setTimeout(() => etcRef.current?.focus({ preventScroll: true }), 0);
            }}
          >
            <span className="rx">
              <span className="rt">{r.t}</span>
              {"d" in r && <span className="rd">{r.d}</span>}
            </span>
            <span className="radio" />
          </button>
        ))}
        {reason === "etc" && (
          <div>
            <label htmlFor="nr-etc-text" className="nr-etc-l">
              이유를 짧게 적어 주세요 (정차 중에만)
            </label>
            <textarea
              id="nr-etc-text"
              ref={etcRef}
              maxLength={40}
              rows={2}
              placeholder="예: 승차지점이 공사 중이에요"
              value={etc}
              onChange={(e) => setEtc(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="grow" />
      <div className="nr-foot">
        <p>보고하면 관제가 확인하고 운행이 끝나요</p>
        <div className="nr-btns">
          <button className="nr-back" onClick={onBack}>
            돌아가기
          </button>
          <button
            className="primary"
            disabled={!reason}
            onClick={() => {
              const r = NORIDE_REASONS.find((x) => x.k === reason)!;
              onReport(r.k === "etc" && etc.trim() ? `${r.t}: ${etc.trim()}` : r.t, waited);
            }}
          >
            미탑승 보고
          </button>
        </div>
      </div>
    </section>
  );
}
