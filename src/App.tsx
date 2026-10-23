import { useCallback, useEffect, useState } from "react";
import { TIMING } from "./data";
import { useApp } from "./AppContext";
import { useTimeout } from "./hooks/useTimers";
import { useWakeLock } from "./hooks/useWakeLock";
import { hm } from "./util";
import type { NavProps, Screen, SubState } from "./screens/types";
import { StartScreen } from "./screens/StartScreen";
import { WaitScreen, subSpeech } from "./screens/WaitScreen";
import { BlockedScreen } from "./screens/BlockedScreen";
import { NoticeScreen } from "./screens/NoticeScreen";
import { CallScreen } from "./screens/CallScreen";
import { GoScreen } from "./screens/GoScreen";
import { MeetScreen } from "./screens/MeetScreen";
import { NoRideScreen } from "./screens/NoRideScreen";
import { CheckRideScreen } from "./screens/CheckRideScreen";
import { RideScreen } from "./screens/RideScreen";
import { DropScreen } from "./screens/DropScreen";
import { EquipmentCheckSheet } from "./sheets/EquipmentCheckSheet";
import { ReportSheet } from "./sheets/ReportSheet";
import { AlertsSheet } from "./sheets/AlertsSheet";
import { MenuSheet } from "./sheets/MenuSheet";
import { EndWorkSheet } from "./sheets/EndWorkSheet";

type Sheet = { type: "check" } | { type: "report"; preset?: string } | { type: "alerts" } | { type: "menu" } | { type: "end" } | null;

export default function App() {
  const { speak, toast } = useApp();

  const [screen, setScreen] = useState<Screen>("start");
  const [noticeBack, setNoticeBack] = useState<Screen>("start");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [sub, setSub] = useState<SubState>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [trips, setTrips] = useState(0);
  const [unread, setUnread] = useState(true);
  const [blockedMeta, setBlockedMeta] = useState("");
  const [acceptedAt, setAcceptedAt] = useState(() => new Date());
  const [arrivedAt, setArrivedAt] = useState(0);
  const [waitKey, setWaitKey] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);

  useWakeLock(startedAt !== null);

  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    addEventListener("online", on);
    addEventListener("offline", on);
    return () => {
      removeEventListener("online", on);
      removeEventListener("offline", on);
    };
  }, []);

  const closeSheet = useCallback(() => setSheet(null), []);

  /** 대기로 돌아가 다시 배차를 받는다 */
  const goWait = (msg?: string) => {
    setSheet(null);
    setSub(null);
    setScreen("wait");
    setWaitKey((k) => k + 1);
    if (msg) toast(msg);
  };

  // 대기 중이고 배차를 멈추지 않았으면 잠시 뒤 새 호출
  useTimeout(
    () => {
      setSheet(null);
      setScreen("call");
    },
    screen === "wait" && !sub ? TIMING.dispatchDelay : null,
    waitKey,
  );

  const openNotice = () => {
    setSheet(null);
    setNoticeBack(screen === "notice" ? noticeBack : screen);
    setScreen("notice");
  };

  const nav: NavProps = {
    unread,
    onAlerts: () => {
      setUnread(false);
      setSheet({ type: "alerts" });
    },
    onMenu: () => setSheet({ type: "menu" }),
  };

  /* ---------- 근무 시작 ---------- */
  const startWork = () => {
    if (!navigator.onLine) toast("연결 끊김 — 연결되면 근무 시작을 보낼게요");
    setSheet({ type: "check" });
  };
  const passCheck = () => {
    setStartedAt(hm());
    speak("근무를 시작했어요. 다음 손님을 기다릴게요");
    goWait("근무를 시작했어요 · 배차 후보에 들어갔어요");
  };
  const sendReport = (label: string) => {
    setSheet(null);
    setBlockedMeta(`${label} · ${hm()} 신고`);
    setScreen("blocked");
    speak("장비 이상을 관제에 알렸어요");
  };
  const endWork = () => {
    setSheet(null);
    setStartedAt(null);
    setSub(null);
    setScreen("start");
    speak("근무를 마쳤어요. 수고하셨어요");
    toast("근무를 마쳤어요. 수고하셨어요");
  };

  /* ---------- 대기 ---------- */
  const changeSub = (s: Exclude<SubState, null>) => {
    setSub(s);
    speak(subSpeech(s));
  };
  const resume = () => {
    speak("배차를 다시 받아요");
    goWait("다시 배차를 받아요");
  };

  /* ---------- 호출 → 운행 ---------- */
  const accept = () => {
    const now = new Date();
    setAcceptedAt(now);
    setScreen("go");
    speak("호출을 수락했어요. 출발지로 이동해 주세요");
    toast(`${hm(now)} 수락 · 승객에게 알렸어요`);
  };
  const missCall = () => {
    speak("수락 시간이 지나 다른 기사님께 넘어갔어요");
    goWait("수락 시간이 지나 다른 기사님께 넘어갔어요");
  };
  const arrive = () => {
    setArrivedAt(Date.now());
    setScreen("meet");
  };
  const reportNoRide = (label: string, waited: string) => {
    speak(`미탑승을 보고했어요. ${label}`);
    goWait(`${hm()} 미탑승 보고 · ${label} · 기다린 시간 ${waited}`);
  };
  const finishTrip = (issue: string | null) => {
    setTrips((n) => n + 1);
    goWait(issue ? `운행 완료 · ‘${issue}’를 관제에 전달했어요` : `${hm()} 운행 완료 · 빈 차로 바뀌었어요`);
  };

  const view = (() => {
    switch (screen) {
      case "start":
        return <StartScreen nav={nav} onStart={startWork} onNotice={openNotice} />;
      case "wait":
        return <WaitScreen nav={nav} sub={sub} startedAt={startedAt} onSub={changeSub} onResume={resume} onEnd={() => setSheet({ type: "end" })} onReport={() => setSheet({ type: "report" })} />;
      case "blocked":
        return (
          <BlockedScreen
            nav={nav}
            meta={blockedMeta}
            onRecheck={() => {
              setScreen("start");
              setSheet({ type: "check" });
            }}
          />
        );
      case "notice":
        return <NoticeScreen onBack={() => setScreen(noticeBack)} />;
      case "call":
        return <CallScreen onAccept={accept} onMiss={missCall} />;
      case "go":
        return <GoScreen acceptedAt={acceptedAt} onArrive={arrive} />;
      case "meet":
        return <MeetScreen nav={nav} onNoRide={() => setScreen("noride")} onMet={() => setScreen("checkRide")} />;
      case "noride":
        return <NoRideScreen nav={nav} arrivedAt={arrivedAt} onBack={() => setScreen("meet")} onReport={reportNoRide} />;
      case "checkRide":
        return <CheckRideScreen nav={nav} onDepart={() => setScreen("ride")} />;
      case "ride":
        return <RideScreen onArrived={() => setScreen("drop")} />;
      case "drop":
        return <DropScreen nav={nav} onFinish={finishTrip} />;
    }
  })();

  return (
    <>
      {!online && <div className="offline">연결 끊김 — 버튼은 복구 후 전송됩니다</div>}
      {view}

      {sheet?.type === "check" && (
        <EquipmentCheckSheet
          onClose={closeSheet}
          onPass={passCheck}
          onFail={(k) => setSheet({ type: "report", preset: k })}
        />
      )}
      {sheet?.type === "report" && <ReportSheet preset={sheet.preset} onClose={closeSheet} onSend={sendReport} />}
      {sheet?.type === "alerts" && <AlertsSheet onClose={closeSheet} onOpenNotice={openNotice} />}
      {sheet?.type === "menu" && (
        <MenuSheet
          trips={trips}
          startedAt={startedAt}
          working={screen === "wait"}
          onClose={closeSheet}
          onNotice={openNotice}
          onReport={() => setSheet({ type: "report" })}
          onEnd={() => setSheet({ type: "end" })}
        />
      )}
      {sheet?.type === "end" && <EndWorkSheet trips={trips} startedAt={startedAt} onClose={closeSheet} onConfirm={endWork} />}
    </>
  );
}
