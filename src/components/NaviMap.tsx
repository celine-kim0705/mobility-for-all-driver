/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { pointAt, type Pt, type Route } from "../kakao/route";

interface Props {
  kakao: any | null;
  route: Route | null;
  travelled: number;
  dest: Pt | null;
  destLabel: string;
  /** 지도를 못 띄울 때 보여 줄 안내 */
  message?: string;
}

const COLOR = { route: "#4c8dff", edge: "#1d3f7a", passed: "#8a8f98", passedEdge: "#5a5e66" };

/** 위에서 본 차(PV5) — 진행 방향에 맞춰 돌린다 */
const CAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="45" viewBox="0 0 26 45"><rect x="1" y="1" width="24" height="43" rx="8" fill="#2f6fe0" stroke="#0b0d10" stroke-width="1.5"/><rect x="4" y="8" width="18" height="9" rx="3" fill="#bcd3ff"/><rect x="4" y="29" width="18" height="7" rx="2.5" fill="#9cb9ef"/><rect x="5" y="19" width="16" height="8" rx="2" fill="#4c8dff"/></svg>`;

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46"><path d="M17 1C8.2 1 1 8 1 16.8 1 28.6 17 45 17 45s16-16.4 16-28.2C33 8 25.8 1 17 1z" fill="#2f6fe0" stroke="#fff" stroke-width="2"/><circle cx="17" cy="17" r="6" fill="#fff"/></svg>`;

export function NaviMap({ kakao, route, travelled, dest, destLabel, message }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const objs = useRef<any>(null);

  // 지도와 고정 요소(목적지 핀·라벨·원)를 한 번 만든다
  useEffect(() => {
    if (!kakao || !route || !dest || !box.current) return;
    const { maps } = kakao;
    const ll = (p: Pt) => new maps.LatLng(p.lat, p.lng);
    const map = new maps.Map(box.current, { center: ll(route.path[0]), level: 4 });
    map.setZoomable(true);

    const line = (color: string, weight: number) =>
      new maps.Polyline({ map, path: [], strokeColor: color, strokeWeight: weight, strokeOpacity: 1, strokeStyle: "solid", endArrow: false });
    const passedEdge = line(COLOR.passedEdge, 12);
    const passed = line(COLOR.passed, 7);
    const restEdge = line(COLOR.edge, 12);
    const rest = line(COLOR.route, 7);

    new maps.Circle({ map, center: ll(dest), radius: 45, strokeWeight: 0, fillColor: COLOR.route, fillOpacity: 0.22 });
    new maps.CustomOverlay({ map, position: ll(dest), yAnchor: 1, content: `<div class="map-pin">${PIN_SVG}</div>`, zIndex: 3 });
    new maps.CustomOverlay({ map, position: ll(dest), yAnchor: -0.35, content: `<div class="map-label">${destLabel}</div>`, zIndex: 4 });

    const carEl = document.createElement("div");
    carEl.className = "map-car";
    carEl.innerHTML = CAR_SVG;
    const car = new maps.CustomOverlay({ map, position: ll(route.path[0]), content: carEl, zIndex: 5 });

    objs.current = { maps, map, ll, passedEdge, passed, restEdge, rest, car, carEl };

    // 처음에는 경로 전체가 보이게
    const bounds = new maps.LatLngBounds();
    route.path.forEach((p) => bounds.extend(ll(p)));
    map.setBounds(bounds, 40, 40, 40, 40);

    const onResize = () => map.relayout();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      objs.current = null;
      if (box.current) box.current.innerHTML = "";
    };
  }, [kakao, route, dest, destLabel]);

  // 진행에 따라 지나온 길·남은 길·차 위치를 갱신한다
  useEffect(() => {
    const o = objs.current;
    if (!o || !route) return;
    const { pt, heading, index } = pointAt(route, travelled);
    const done = route.path.slice(0, index).map(o.ll).concat(o.ll(pt));
    const left = [o.ll(pt)].concat(route.path.slice(index).map(o.ll));
    o.passedEdge.setPath(done);
    o.passed.setPath(done);
    o.restEdge.setPath(left);
    o.rest.setPath(left);
    o.car.setPosition(o.ll(pt));
    o.carEl.style.transform = `rotate(${heading}deg)`;
    // 출발 직후 몇 초는 전체 경로를 보여 주고, 그다음부터 차를 따라간다
    if (travelled > route.distance * 0.08) {
      if (o.map.getLevel() > 4) o.map.setLevel(4);
      o.map.panTo(o.ll(pt));
    }
  }, [route, travelled]);

  return (
    <div className="navi-map">
      <div ref={box} className="navi-map-canvas" />
      {message && <div className="navi-map-msg">{message}</div>}
    </div>
  );
}
