import { useState } from "react";
import { DROP_STEPS, FARE, PAY_FAIL_REASONS, TIMING } from "../data";
import { StepList } from "../components/StepList";
import { TopBar } from "../components/TopBar";
import { useApp } from "../AppContext";
import { useSteps } from "../hooks/useSteps";
import { useInterval, useMount, useTimeout } from "../hooks/useTimers";
import { hm, pick, vibrate } from "../util";
import type { NavProps } from "./types";

type Pay = "loading" | "ok" | "fail" | "direct";
const ISSUES = [
  { v: "none", t: "없었어요" },
  { v: "mismatch", t: "정보와 달라요" },
  { v: "nofit", t: "차에 안 맞아요" },
];
const MAX = 60;

/** 하차 지원 중 → 하차했어요. 결제 결과와 탑승 문제를 기록하고 다음 배차로. */
export function DropScreen({ nav, onFinish }: { nav: NavProps; onFinish: (issue: string | null) => void }) {
  const { speak } = useApp();

  // 하차 확인 단계
  const [nextLabel, setNextLabel] = useState(false);
  const idx = useSteps(DROP_STEPS.length, TIMING.stepGap, () => speak("하차했어요"));
  const stepsDone = idx >= DROP_STEPS.length;
  useTimeout(() => setNextLabel(true), stepsDone ? TIMING.nextLabelDelay : null);

  // 결제: 데모는 절반 확률로 실패
  const [pay, setPay] = useState<Pay>("loading");
  const [payNote, setPayNote] = useState("자동으로 결제됩니다");
  const [failReason, setFailReason] = useState("");
  const [method, setMethod] = useState("앱카드 결제");
  useMount(() => speak(`하차 지원을 시작해요. 앱카드로 ${FARE.amount}원을 결제하고 있어요`));
  useTimeout(() => {
    if (Math.random() < 0.5) {
      const why = pick(PAY_FAIL_REASONS);
      setPay("fail");
      setFailReason(why);
      setPayNote("자동 결제가 안 됐어요");
      speak(`앱카드 결제가 실패했어요. ${why}. 직접 결제를 받아 주세요`);
      vibrate([200, 100, 200]);
    } else {
      setPay("ok");
      setPayNote(`${hm()} 결제됐어요`);
      speak("결제가 완료됐어요");
    }
  }, TIMING.payResult);

  const startDirect = () => {
    setPay("direct");
    setMethod("직접 결제");
    setPayNote("단말기로 받아 주세요");
  };
  const confirmDirect = () => {
    setPay("ok");
    setPayNote(`${hm()} 직접 결제로 받았어요`);
    speak("결제가 완료됐어요");
  };

  // 탑승 문제 기록
  const [issue, setIssue] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState("");
  const [typing, setTyping] = useState(false);
  const { toast } = useApp();

  const pickIssue = (v: string) => {
    setIssue(v);
    setWriting(false);
  };
  const openWrite = () => {
    setIssue("write");
    setWriting(!saved);
  };
  const save = () => {
    const t = draft.trim();
    if (!t) return;
    setSaved(t);
    setWriting(false);
    setTyping(false);
    toast("입력한 내용을 저장했어요");
  };
  const edit = () => {
    setDraft(saved);
    setWriting(true);
  };

  // 운행 끝내기 / 다음 배차 받기
  const paid = pay === "ok";
  const canFinish = stepsDone && paid;
  const auto = nextLabel && canFinish;
  const [autoLeft, setAutoLeft] = useState(TIMING.autoNext);

  const finish = () => {
    const text = issue === "write" ? saved || draft.trim() || null : issue && issue !== "none" ? ISSUES.find((i) => i.v === issue)!.t : null;
    speak("운행을 끝냈어요. 빈 차로 바뀌었어요");
    onFinish(text);
  };

  useInterval(
    () => {
      if (typing) return;
      const n = autoLeft - 1;
      setAutoLeft(n);
      if (n <= 0) finish();
    },
    auto && autoLeft > 0 ? 1000 : null,
  );

  const foot =
    pay === "fail" || pay === "direct"
      ? "직접 결제를 받으면 운행을 끝낼 수 있어요"
      : !stepsDone
        ? "하차 확인이 끝나면 운행을 끝낼 수 있어요"
        : !paid
          ? "결제가 끝나면 운행을 끝낼 수 있어요"
          : auto
            ? typing
              ? "입력하는 동안은 자동 이동을 멈춰요"
              : `${autoLeft}초 뒤 자동으로 다음 배차를 받아요`
            : "끝내면 빈 차로 바뀌어요";

  const btnLabel = auto ? `다음 배차 받기 (${autoLeft})` : nextLabel ? "다음 배차 받기" : "운행 끝내기";

  return (
    <section className="view" aria-label="하차">
      <TopBar {...nav} />
      <div className="ck-head">
        <h1>{stepsDone ? "하차했어요" : "하차 지원 중"}</h1>
        <p className="muted-p">{stepsDone ? "PV5가 위에서부터 차례로 확인했어요" : "PV5가 위에서부터 차례로 확인해요"}</p>
      </div>
      <div className="dp-body">
        <StepList steps={DROP_STEPS} index={idx} small />

        <div className="dp-fare">
          <span className="k">결제 금액 · {TIMING.ride.km}km</span>
          <span className="amt">{FARE.label}</span>
          <div className="pay-row">
            <span className="chip">{method}</span>
            <span className="pay-auto">{payNote}</span>
            <span className={`pay-load${pay === "ok" ? " ok" : pay === "fail" ? " fail" : ""}`} role="status">
              <i className={pay === "loading" || pay === "direct" ? "spin" : "ico"} aria-hidden="true" />
              <span>{pay === "ok" ? "결제 완료" : pay === "fail" ? "결제 실패" : pay === "direct" ? "결제 대기 중" : "결제 진행 중"}</span>
            </span>
          </div>
          {(pay === "fail" || pay === "direct") && (
            <div className="pay-fail">
              {pay === "fail" ? (
                <p>
                  <b>{failReason}.</b>
                  <br />
                  승객에게 알리고 단말기로 {FARE.label}을 직접 받아 주세요.
                </p>
              ) : (
                <p>승객에게 단말기를 건네 카드나 현금으로 {FARE.label}을 받은 뒤 아래 버튼을 눌러 주세요.</p>
              )}
              <button className="pay-direct" onClick={pay === "fail" ? startDirect : confirmDirect}>
                {pay === "fail" ? "직접 결제하기" : "결제 받았어요"}
              </button>
            </div>
          )}
        </div>

        <span className="dp-q">타는 데 문제 있었나요?</span>
        <div className="dp-chips" role="radiogroup" aria-label="타는 데 문제">
          {ISSUES.map((i) => (
            <button key={i.v} role="radio" aria-checked={issue === i.v} onClick={() => pickIssue(i.v)}>
              {i.t}
            </button>
          ))}
        </div>
        <button className="dp-write" aria-pressed={issue === "write"} onClick={openWrite}>
          직접 입력하기
        </button>
        {issue === "write" && writing && (
          <div className="dp-etc">
            <label htmlFor="dp-etc-text" className="nr-etc-l">
              어떤 문제가 있었는지 짧게 적어 주세요 (정차 중에만)
            </label>
            <textarea
              id="dp-etc-text"
              autoFocus
              maxLength={MAX}
              rows={2}
              placeholder="예: 슬로프 각도가 가팔라서 도움이 더 필요했어요"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => setTyping(true)}
              onBlur={() => setTyping(false)}
            />
            <div className="dp-etc-row">
              <span className="dp-cnt">
                {draft.length} / {MAX}
              </span>
              <button className="dp-save" disabled={!draft.trim()} onMouseDown={(e) => e.preventDefault()} onClick={save}>
                저장하기
              </button>
            </div>
          </div>
        )}
        {issue === "write" && !writing && saved && (
          <div className="dp-saved">
            <span className="k">저장했어요</span>
            <span className="v">{saved}</span>
            <button className="dp-edit" onClick={edit}>
              수정
            </button>
          </div>
        )}
      </div>
      <div className="grow" />
      <div className="nr-foot">
        <p className={auto ? "auto-note" : ""}>{foot}</p>
        <button className="primary ck-go" style={{ marginTop: 0 }} disabled={!canFinish} onClick={finish}>
          {btnLabel}
        </button>
      </div>
    </section>
  );
}
