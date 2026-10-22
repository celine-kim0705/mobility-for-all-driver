import { StatusPill, TopBar } from "../components/TopBar";
import type { NavProps } from "./types";

/** 장비 이상 신고 후: 배차 제외 */
export function BlockedScreen({ nav, meta, onRecheck }: { nav: NavProps; meta: string; onRecheck: () => void }) {
  return (
    <section className="view" aria-label="장비 이상">
      <TopBar left={<StatusPill tone="blocked" label="배차 제외" />} onMenu={nav.onMenu} />
      <div className="grow" />
      <div className="hello">
        <div className="sub" style={{ fontWeight: 700 }}>
          장비 이상을 관제에 알렸어요
        </div>
        <div className="meta">{meta}</div>
      </div>
      <div className="grow" />
      <div className="sheet">
        <div className="guide">
          관제 안내가 올 때까지 배차를 받지 않아요.
          <br />
          수리 후 다시 점검하면 근무를 시작할 수 있어요.
        </div>
        <button className="primary" onClick={onRecheck}>
          다시 점검하기
        </button>
      </div>
    </section>
  );
}
