import { DRIVER } from "../data";
import { Layer } from "../components/Layer";
import { useApp } from "../AppContext";
import { addHours } from "../util";

interface Props {
  trips: number;
  startedAt: string | null;
  working: boolean;
  onClose: () => void;
  onNotice: () => void;
  onReport: () => void;
  onEnd: () => void;
}

/** 메뉴: 오늘 기록, 음성·글자 설정, 공지, 장비 이상 신고, 근무 종료(대기 중만) */
export function MenuSheet({ trips, startedAt, working, onClose, onNotice, onReport, onEnd }: Props) {
  const { prefs, setPrefs, speak } = useApp();
  return (
    <Layer onClose={onClose}>
      <h2>메뉴</h2>
      <p className="lead">
        {DRIVER.name}님 · {DRIVER.plate}
      </p>
      <div className="list">
        <div className="row">
          <span>오늘 운행</span>
          <span className="v">
            {trips}건{startedAt ? ` · 근무 시작 ${startedAt}` : ""}
          </span>
        </div>
        <div className="row">
          <span>이달 남은 우선 배차</span>
          <span className="v">{DRIVER.quota}건</span>
        </div>
        <div className="row">
          <span>근무 종료 예정</span>
          <span className="v">{startedAt ? addHours(startedAt, DRIVER.workHours) : DRIVER.endTime} · 회사 연동</span>
        </div>
        <button
          className="row"
          onClick={() => {
            const voice = !prefs.voice;
            setPrefs({ ...prefs, voice });
            if (voice) setTimeout(() => speak("음성 안내를 켰어요"), 0);
          }}
        >
          <span>음성 안내</span>
          <span className="switch" role="switch" aria-checked={prefs.voice} />
        </button>
        <button className="row" onClick={() => setPrefs({ ...prefs, big: !prefs.big })}>
          <span>큰 글자</span>
          <span className="switch" role="switch" aria-checked={prefs.big} />
        </button>
        <button className="row" onClick={onNotice}>
          <span>공지사항</span>
          <span className="v">›</span>
        </button>
        <button className="row" onClick={onReport}>
          <span style={{ color: "var(--danger)" }}>장비 이상 신고</span>
          <span className="v">›</span>
        </button>
        {working && (
          <button className="row" onClick={onEnd}>
            <span>근무 종료</span>
            <span className="v">›</span>
          </button>
        )}
      </div>
      <button className="ghost" onClick={onClose}>
        닫기
      </button>
    </Layer>
  );
}
