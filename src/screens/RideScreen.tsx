/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { CALL, TIMING } from "../data";
import { NaviMap } from "../components/NaviMap";
import { TurnIcon } from "../components/TurnIcon";
import { useApp } from "../AppContext";
import { useInterval, useMount } from "../hooks/useTimers";
import { loadKakao } from "../kakao/loadKakao";
import { FALLBACK, fetchRoute, geocode, type Pt, type Route } from "../kakao/route";
import { hm, kmText, ro, vibrate } from "../util";

/** 데모: 경로 전체를 약 이 초 동안 달린다 (1초 ≈ 1분) */
const DEMO_SECONDS = TIMING.ride.min;
const { msgAt, msg } = TIMING.ride;
const REPLIES = ["네, 알겠어요", "곧 도착해요"];

const distText = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.max(10, Math.round(m / 10) * 10)}m`);

type Msg = { kind: "in" | "sent"; head: string; text: string } | null;

/** 손님 탑승 후: 목적지로 이동 (내비). 카카오맵에 경로를 그리고 차가 따라간다. */
export function RideScreen({ onArrived }: { onArrived: () => void }) {
  const { speak, toast } = useApp();
  const [kakao, setKakao] = useState<any | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [dest, setDest] = useState<Pt | null>(null);
  const [mapMsg, setMapMsg] = useState<string | undefined>("지도를 불러오고 있어요");
  const [travelled, setTravelled] = useState(0);
  const [tick, setTick] = useState(0);
  const [message, setMessage] = useState<Msg>(null);
  const [showPhone, setShowPhone] = useState(false);
  const startAt = useRef(new Date());
  const nearSaid = useRef(false);
  const spokenGuide = useRef(-1);
  const hideTimer = useRef<number>();

  useMount(() => speak(`출발합니다. ${CALL.to}까지 약 ${TIMING.ride.min}분이에요`));

  // 지도 SDK → 좌표 → 경로 순서로 준비 (출발지 → 목적지)
  useEffect(() => {
    let alive = true;
    (async () => {
      let k: any = null;
      let pickup = FALLBACK.pickup;
      let to = FALLBACK.dest;
      try {
        k = await loadKakao();
        const fromAddr = CALL.fromAddr.replace(/\s*\d+동$/, "");
        pickup = (await geocode(k, fromAddr, CALL.from[0].replace(/\s*아파트$/, ""))) ?? pickup;
        to = (await geocode(k, CALL.toAddr.replace(/\s*·.*$/, ""), CALL.to)) ?? to;
      } catch (e) {
        if (alive)
          setMapMsg(
            (e as Error).message === "NO_JS_KEY"
              ? "카카오맵 키가 없어 지도를 표시하지 못해요 (.env.local 설정 필요)"
              : "카카오맵을 불러오지 못했어요. 키와 등록 도메인을 확인해 주세요",
          );
      }
      const r = await fetchRoute(pickup, to);
      if (!alive) return;
      setKakao(k);
      setDest(to);
      setRoute(r);
      if (k) setMapMsg(r.source === "straight" ? "길찾기 키가 없어 직선 경로로 표시해요" : undefined);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const total = route?.distance ?? 0;
  const left = Math.max(0, total - travelled);
  const done = !!route && left <= 0;
  const near = !!route && left <= 1000;
  const nextIdx = route ? route.guides.findIndex((g) => g.at > travelled + 5) : -1;
  const next = route && nextIdx >= 0 ? route.guides[nextIdx] : null;

  useInterval(
    () => {
      if (!route) return;
      const t = tick + 1;
      setTick(t);
      // 중간에 손님 메시지가 온다
      if (t === msgAt) {
        setMessage({ kind: "in", head: `손님 메시지 · ${hm()}`, text: msg });
        vibrate(200);
        speak(`손님 메시지. ${msg}`);
      }
      const step = route.distance / DEMO_SECONDS;
      const d = Math.min(route.distance, travelled + step);
      setTravelled(d);
      const rem = route.distance - d;
      // 다음 안내 300m 전에 한 번 읽어 준다
      const ni = route.guides.findIndex((g) => g.at > d + 5);
      if (ni >= 0 && ni !== spokenGuide.current && route.guides[ni].at - d <= 300) {
        spokenGuide.current = ni;
        const g = route.guides[ni];
        speak(`${distText(g.at - d)} 앞 ${g.guidance}`);
      }
      if (!nearSaid.current && rem <= 1000 && rem > 0) {
        nearSaid.current = true;
        speak("곧 하차예요. 슬로프를 준비해 주세요");
      }
      if (rem <= 0) speak("목적지에 도착했어요. 차를 세우면 도착했어요를 눌러 주세요");
    },
    route && !done ? 1000 : null,
  );

  const reply = (text: string) => {
    setMessage({ kind: "sent", head: `답장 보냄 · ${hm()}`, text });
    toast(`손님에게 ‘${text}’를 보냈어요`);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setMessage((m) => (m?.kind === "sent" ? null : m)), 4000);
  };

  const banner = !route
    ? { big: "경로 찾는 중", small: `${CALL.to}까지 길을 찾고 있어요`, icon: "직진" }
    : done
      ? { big: "도착", small: `${CALL.to} 앞이에요`, icon: "도착" }
      : near
        ? { big: distText(left), small: `곧 ${CALL.to}에 도착해요`, icon: "도착" }
        : next
          ? { big: distText(next.at - travelled), small: next.name ? `${next.name} 방면 ${next.guidance}` : next.guidance, icon: next.guidance }
          : { big: distText(left), small: `${CALL.to}까지 직진`, icon: "직진" };

  const arriveAt = hm(new Date(startAt.current.getTime() + (route?.duration ?? TIMING.ride.min * 60) * 1000));
  const stateText = done ? "관제에 ‘하차 중’으로 보여요" : near ? "관제에 ‘곧 하차’로 보이고 있어요" : "1km 전부터 관제에 ‘곧 하차’로 보여요";

  return (
    <section className="view go-view" aria-label="운행 중">
      <div className="navi-banner" aria-live="polite">
        <TurnIcon guidance={banner.icon} />
        <div className="nb-text">
          <span className="nb-big">{banner.big}</span>
          <span className="nb-small">{banner.small}</span>
        </div>
      </div>

      <NaviMap kakao={kakao} route={route} travelled={travelled} dest={dest} destLabel={CALL.to} message={mapMsg} />

      <div className="go-sheet">
        <div className="go-sum">
          <span>{done ? "목적지에 도착했어요" : `${ro(CALL.to)} 가는 중`}</span>
          <span className="go-eta">{route ? `도착 ${arriveAt} · ${kmText(left / 1000)}` : "도착 예정 계산 중"}</span>
        </div>
        <div className="go-who">
          {message && (
            <div className={`ride-msg${message.kind === "sent" ? " sent" : ""}`} aria-live="assertive">
              <span className="k">{message.head}</span>
              <span className="m">“{message.text}”</span>
            </div>
          )}
          <div className="ride-replies">
            {REPLIES.map((r) => (
              <button key={r} onClick={() => reply(r)}>
                {r}
              </button>
            ))}
          </div>
          <span className={`ride-note${near || done ? " on" : ""}`}>{stateText}</span>
        </div>
        {showPhone && <div className="phone">안심번호 {CALL.phone} (예시) · 정차 중에만 걸어 주세요</div>}
        <div className="nr-btns">
          <button className="nr-back" onClick={() => setShowPhone((v) => !v)}>
            전화
          </button>
          <button className="primary go-arrive" onClick={onArrived}>
            도착했어요
          </button>
        </div>
      </div>
    </section>
  );
}
