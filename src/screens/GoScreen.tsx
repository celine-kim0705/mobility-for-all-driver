/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { CALL, TIMING } from "../data";
import { Chips } from "../components/Chips";
import { NaviMap } from "../components/NaviMap";
import { TurnIcon } from "../components/TurnIcon";
import { useApp } from "../AppContext";
import { useInterval } from "../hooks/useTimers";
import { loadKakao } from "../kakao/loadKakao";
import { FALLBACK, fetchRoute, geocode, type Pt, type Route } from "../kakao/route";
import { hm, kmText } from "../util";

/** 데모: 경로 전체를 약 이 초 동안 달린다 */
const DEMO_SECONDS = TIMING.route.sec / TIMING.route.speed;
const PICKUP_LABEL = `${CALL.from[0].replace(/\s*아파트$/, "")} 101동`;

const distText = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.max(10, Math.round(m / 10) * 10)}m`);

/** 수락 후: 출발지로 이동 (내비). 카카오맵에 경로를 그리고 차가 따라간다. */
export function GoScreen({ acceptedAt, onArrive }: { acceptedAt: Date; onArrive: () => void }) {
  const { speak, toast } = useApp();
  const [kakao, setKakao] = useState<any | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [dest, setDest] = useState<Pt | null>(null);
  const [mapMsg, setMapMsg] = useState<string | undefined>("지도를 불러오고 있어요");
  const [travelled, setTravelled] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const warned = useRef(false);
  const spokenGuide = useRef(-1);

  // 지도 SDK → 좌표 → 경로 순서로 준비
  useEffect(() => {
    let alive = true;
    (async () => {
      let k: any = null;
      let start = FALLBACK.start;
      let pickup = FALLBACK.pickup;
      try {
        k = await loadKakao();
        const addr = CALL.fromAddr.replace(/\s*\d+동$/, "");
        pickup = (await geocode(k, addr, CALL.from[0].replace(/\s*아파트$/, ""))) ?? pickup;
        start = (await geocode(k, "", "홍제역 3호선")) ?? start;
      } catch (e) {
        if (alive)
          setMapMsg(
            (e as Error).message === "NO_JS_KEY"
              ? "카카오맵 키가 없어 지도를 표시하지 못해요 (.env.local 설정 필요)"
              : "카카오맵을 불러오지 못했어요. 키와 등록 도메인을 확인해 주세요",
          );
      }
      const r = await fetchRoute(start, pickup);
      if (!alive) return;
      setKakao(k);
      setDest(pickup);
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
  const near = !!route && left <= 100;
  const nextIdx = route ? route.guides.findIndex((g) => g.at > travelled + 5) : -1;
  const next = route && nextIdx >= 0 ? route.guides[nextIdx] : null;

  useInterval(
    () => {
      if (!route) return;
      const step = route.distance / DEMO_SECONDS;
      const t = Math.min(route.distance, travelled + step);
      setTravelled(t);
      const rem = route.distance - t;
      const remSec = route.duration * (rem / route.distance);
      // 다음 안내 300m 전에 한 번 읽어 준다
      const ni = route.guides.findIndex((g) => g.at > t + 5);
      if (ni >= 0 && ni !== spokenGuide.current && route.guides[ni].at - t <= 300) {
        spokenGuide.current = ni;
        const g = route.guides[ni];
        speak(`${distText(g.at - t)} 앞 ${g.guidance}`);
      }
      if (!warned.current && remSec <= 180 && rem > 0) {
        warned.current = true;
        speak("출발지까지 3분 남았어요. 승객에게 곧 도착한다고 알렸어요");
        toast("승객에게 ‘3분 뒤 도착’을 알렸어요");
      }
      if (rem <= 0) speak("출발지에 도착했어요. 승객을 받을 자리에 서면 도착했어요를 눌러 주세요");
    },
    route && !done ? 1000 : null,
  );

  const banner = !route
    ? { big: "경로 찾는 중", small: `${PICKUP_LABEL}까지 길을 찾고 있어요`, icon: "직진" }
    : done
      ? { big: "도착", small: `${PICKUP_LABEL} 앞이에요`, icon: "도착" }
      : near
        ? { big: distText(left), small: `곧 ${PICKUP_LABEL}에 도착해요`, icon: "도착" }
        : next
          ? { big: distText(next.at - travelled), small: next.name ? `${next.name} 방면 ${next.guidance}` : next.guidance, icon: next.guidance }
          : { big: distText(left), small: `${PICKUP_LABEL}까지 직진`, icon: "직진" };

  const arriveAt = hm(new Date(acceptedAt.getTime() + (route?.duration ?? TIMING.route.sec) * 1000));

  return (
    <section className="view go-view" aria-label="출발지로 이동 중">
      <div className="navi-banner" aria-live="polite">
        <TurnIcon guidance={banner.icon} />
        <div className="nb-text">
          <span className="nb-big">{banner.big}</span>
          <span className="nb-small">{banner.small}</span>
        </div>
      </div>

      <NaviMap kakao={kakao} route={route} travelled={travelled} dest={dest} destLabel={PICKUP_LABEL} message={mapMsg} />

      <div className="go-sheet">
        <div className="go-sum">
          <span>{done ? "출발지에 도착했어요" : near ? "출발지 근처예요" : "손님에게 가는 중"}</span>
          <span className="go-eta">{route ? `도착 ${arriveAt} · ${kmText(left / 1000)}` : `도착 예정 계산 중`}</span>
        </div>
        <div className="go-who">
          <span className="who">{CALL.wheel}</span>
          <Chips items={CALL.meetChips} className="go-chips" />
          <span className="go-memo">“{CALL.memo}”</span>
        </div>
        {showPhone && <div className="phone">안심번호 {CALL.phone} (예시) · 정차 중에만 걸어 주세요</div>}
        <div className="nr-btns">
          <button className="nr-back" onClick={() => setShowPhone((v) => !v)}>
            전화
          </button>
          <button className="primary go-arrive" onClick={onArrive}>
            도착했어요
          </button>
        </div>
      </div>
    </section>
  );
}

