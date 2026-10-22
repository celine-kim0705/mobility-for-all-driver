import { useState } from "react";
import { EQUIP_ITEMS } from "../data";
import { Layer } from "../components/Layer";

type Result = "ok" | "bad";
type Key = (typeof EQUIP_ITEMS)[number]["k"];

interface Props {
  onClose: () => void;
  onPass: () => void;
  onFail: (first: Key) => void;
}

/** 근무 시작 전 장비 점검: 3개 모두 정상이면 근무 시작, 하나라도 이상이면 신고로 */
export function EquipmentCheckSheet({ onClose, onPass, onFail }: Props) {
  const [checks, setChecks] = useState<Partial<Record<Key, Result>>>({});
  const done = EQUIP_ITEMS.filter((i) => checks[i.k]).length;
  const bad = EQUIP_ITEMS.find((i) => checks[i.k] === "bad");
  const all = done === EQUIP_ITEMS.length;

  const label = bad ? "장비 이상 신고" : all ? "점검 완료 — 근무 시작" : `${EQUIP_ITEMS.length - done}개 더 확인해 주세요`;

  return (
    <Layer onClose={onClose}>
      <h2>장비 점검</h2>
      <p className="lead">하나씩 확인하고 결과를 눌러 주세요.</p>
      {EQUIP_ITEMS.map((it) => (
        <div className="check" key={it.k}>
          <div className="t">{it.t}</div>
          <div className="d">{it.d}</div>
          <div className="seg">
            {(["ok", "bad"] as const).map((v) => (
              <button
                key={v}
                className={v === "ok" ? "good" : "bad"}
                aria-pressed={checks[it.k] === v}
                onClick={() => setChecks((c) => ({ ...c, [it.k]: v }))}
              >
                {v === "ok" ? "정상" : "이상 있음"}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        className={`primary${bad ? " danger" : ""}`}
        disabled={!bad && !all}
        onClick={() => (bad ? onFail(bad.k) : onPass())}
      >
        {label}
      </button>
      <button className="ghost" onClick={onClose}>
        나중에 하기
      </button>
    </Layer>
  );
}
