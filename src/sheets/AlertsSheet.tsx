import { ALERTS } from "../data";
import { Layer } from "../components/Layer";

export function AlertsSheet({ onClose, onOpenNotice }: { onClose: () => void; onOpenNotice: () => void }) {
  return (
    <Layer onClose={onClose}>
      <h2>알림</h2>
      <p className="lead">관제와 회사에서 보낸 안내예요.</p>
      <div className="list">
        {ALERTS.map((a) => (
          <button key={a.t} className="item" onClick={() => a.notice && onOpenNotice()}>
            <span className={`tag${a.warn ? " warn" : ""}`}>{a.tag}</span>
            <span className="tt">{a.t}</span>
            <span className="tm">{a.tm}</span>
          </button>
        ))}
      </div>
      <button className="ghost" onClick={onClose}>
        닫기
      </button>
    </Layer>
  );
}
