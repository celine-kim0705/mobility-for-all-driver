import type { ReactNode } from "react";

interface Props {
  left?: ReactNode;
  onAlerts?: () => void;
  onMenu?: () => void;
  unread?: boolean;
}

/** 상단 메뉴: 왼쪽 상태 + 오른쪽 알림·메뉴 */
export function TopBar({ left, onAlerts, onMenu, unread }: Props) {
  return (
    <header className="topbar">
      <span className="left">{left ?? "​"}</span>
      <nav>
        {onAlerts && (
          <button onClick={onAlerts} aria-label={unread ? "알림, 새 알림 있음" : "알림"}>
            알림{unread && <span className="dot" />}
          </button>
        )}
        {onMenu && <button onClick={onMenu}>메뉴</button>}
      </nav>
    </header>
  );
}

export function StatusPill({ label, tone = "live", id }: { label: string; tone?: "live" | "paused" | "blocked"; id?: string }) {
  return (
    <span className={`pill ${tone === "live" ? "" : tone}`} id={id}>
      <i />
      <span>{label}</span>
    </span>
  );
}
