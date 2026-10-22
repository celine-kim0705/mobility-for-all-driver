import { DEPART_STEPS, TIMING } from "../data";
import { StepList } from "../components/StepList";
import { TopBar } from "../components/TopBar";
import { useApp } from "../AppContext";
import { useSteps } from "../hooks/useSteps";
import { useMount } from "../hooks/useTimers";
import type { NavProps } from "./types";

/** 출발 전 확인: PV5가 휠체어 고정·안전벨트·슬로프·문을 차례로 확인 */
export function CheckRideScreen({ nav, onDepart }: { nav: NavProps; onDepart: () => void }) {
  const { speak } = useApp();
  useMount(() => speak("탑승을 기록했어요. 차가 출발 전 확인을 시작해요"));
  const idx = useSteps(DEPART_STEPS.length, TIMING.stepGap, () => speak("확인이 끝났어요. 출발할 수 있어요"));
  const total = DEPART_STEPS.length;
  const all = idx >= total;

  return (
    <section className="view" aria-label="출발 전 확인">
      <TopBar {...nav} />
      <div className="ck-head">
        <h1>
          출발 전에
          <br />
          차가 확인하고 있어요
        </h1>
        <p className={all ? "done" : ""}>{all ? "모든 확인이 끝났어요" : "PV5가 위에서부터 차례로 확인해요"}</p>
      </div>
      <StepList steps={DEPART_STEPS} index={idx} />
      <div className="grow" />
      <div className="nr-foot">
        <p>{all ? `${total} / ${total} 확인 완료 · 출발할 수 있어요` : `${idx + 1} / ${total} 확인 중 · 다 되면 출발할 수 있어요`}</p>
        <button className="primary ck-go" disabled={!all} onClick={onDepart}>
          출발하기
        </button>
      </div>
    </section>
  );
}
