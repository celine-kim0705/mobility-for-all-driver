import { useEffect, useRef, type ReactNode } from "react";

/** 아래에서 올라오는 시트. 바깥을 누르거나 Esc로 닫힌다. */
export function Layer({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector("button")?.focus({ preventScroll: true });
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="scrim" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="panel" ref={panel}>
        {children}
      </div>
    </div>
  );
}
