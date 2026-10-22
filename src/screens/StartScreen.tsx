import { DRIVER } from "../data";
import { TopBar } from "../components/TopBar";
import type { NavProps } from "./types";

/** D00 근무 시작 */
export function StartScreen({ nav, onStart, onNotice }: { nav: NavProps; onStart: () => void; onNotice: () => void }) {
  return (
    <section className="view" aria-label="근무 시작">
      <TopBar {...nav} />
      <div className="grow" />
      <div className="hello">
        <div className="name">{DRIVER.name}님</div>
        <div className="sub">오늘도 안전하게 시작해요</div>
      </div>
      <div className="grow" />
      <button className="notice" onClick={onNotice}>
        <span>[공지] 휠체어 고정 장치 점검 안내</span>
        <span aria-hidden="true">›</span>
      </button>
      <div className="sheet">
        <div className="kind">{DRIVER.kind}</div>
        <div className="plate">{DRIVER.plate}</div>
        <div className="chips">
          <div className="chip">{DRIVER.battery}</div>
          <div className="chip">남은 장콜 {DRIVER.quota}건</div>
        </div>
        <div className="guide">
          슬로프와 휠체어 고정 장치를
          <br />
          확인하고 근무를 시작해 주세요.
        </div>
        <button className="primary" onClick={onStart}>
          근무 시작
        </button>
      </div>
    </section>
  );
}
