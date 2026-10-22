import { useState } from "react";
import { REPORT_REASONS } from "../data";
import { Layer } from "../components/Layer";

interface Props {
  preset?: string | null;
  onClose: () => void;
  onSend: (label: string) => void;
}

/** 장비 이상 신고: 장비를 고르면 관제에 알리고 배차 후보에서 빠진다 */
export function ReportSheet({ preset, onClose, onSend }: Props) {
  const [reason, setReason] = useState<string | null>(preset ?? null);
  return (
    <Layer onClose={onClose}>
      <h2>장비 이상 신고</h2>
      <p className="lead">이상이 있는 장비를 골라 주세요. 관제에 바로 알리고, 오늘은 배차 후보에서 빠져요.</p>
      <div className="reasons">
        {REPORT_REASONS.map((r) => (
          <button key={r.k} aria-pressed={reason === r.k} onClick={() => setReason(r.k)}>
            {r.t}
          </button>
        ))}
      </div>
      <button
        className="primary danger"
        style={{ marginTop: 20 }}
        disabled={!reason}
        onClick={() => onSend(REPORT_REASONS.find((r) => r.k === reason)!.t)}
      >
        관제에 알리기
      </button>
      <button className="ghost" onClick={onClose}>
        취소
      </button>
    </Layer>
  );
}
