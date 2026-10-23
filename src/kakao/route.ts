/* eslint-disable @typescript-eslint/no-explicit-any */
// 출발·도착 좌표를 구하고 카카오모빌리티 길찾기로 경로를 받는다.
// 키가 없거나 실패하면 직선 경로로 대신한다.

import { KAKAO_REST_KEY } from "./loadKakao";

export interface Pt {
  lat: number;
  lng: number;
}

export interface Guide {
  /** 경로 시작부터 이 안내 지점까지 거리(m) */
  at: number;
  /** "우회전", "좌회전" 등 */
  guidance: string;
  /** 방면 도로 이름 */
  name: string;
}

export interface Route {
  path: Pt[];
  /** path 각 점까지 누적 거리(m) */
  cum: number[];
  distance: number;
  duration: number;
  guides: Guide[];
  /** 실제 길찾기 결과인지, 직선 대체인지 */
  source: "kakao" | "straight";
}

/** 키가 없을 때 쓰는 대략 좌표 (예시) */
export const FALLBACK = {
  start: { lat: 37.5889, lng: 126.9436 }, // 홍제역 부근 — 기사 현재 위치 예시
  pickup: { lat: 37.6025, lng: 126.9343 }, // 녹번동 래미안베라힐즈 부근
  dest: { lat: 37.634, lng: 126.9165 }, // 은평 성모병원 부근
};

const R = 6371000;
export function dist(a: Pt, b: Pt) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function cumulative(path: Pt[]) {
  const cum = [0];
  for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + dist(path[i - 1], path[i]));
  return cum;
}

/** 지도 SDK의 주소·장소 검색으로 좌표를 찾는다 */
export function geocode(kakao: any, address: string, keyword?: string): Promise<Pt | null> {
  return new Promise((resolve) => {
    const s = kakao.maps.services;
    new s.Geocoder().addressSearch(address, (res: any[], status: string) => {
      if (status === s.Status.OK && res[0]) return resolve({ lat: +res[0].y, lng: +res[0].x });
      if (!keyword) return resolve(null);
      new s.Places().keywordSearch(keyword, (r2: any[], st2: string) => {
        resolve(st2 === s.Status.OK && r2[0] ? { lat: +r2[0].y, lng: +r2[0].x } : null);
      });
    });
  });
}

export async function fetchRoute(origin: Pt, dest: Pt): Promise<Route> {
  if (KAKAO_REST_KEY) {
    try {
      const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.lng},${origin.lat}&destination=${dest.lng},${dest.lat}&priority=RECOMMEND`;
      const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } });
      if (res.ok) {
        const data = await res.json();
        const r = data.routes?.[0];
        if (r && r.result_code === 0) {
          const path: Pt[] = [];
          const guides: Guide[] = [];
          let acc = 0;
          for (const sec of r.sections ?? []) {
            for (const road of sec.roads ?? []) {
              const v: number[] = road.vertexes ?? [];
              for (let i = 0; i + 1 < v.length; i += 2) path.push({ lng: v[i], lat: v[i + 1] });
            }
            for (const g of sec.guides ?? []) {
              acc += g.distance ?? 0;
              if (g.type === 100 || g.type === 101) continue; // 출발지·목적지 표시는 안내에서 제외
              guides.push({ at: acc, guidance: g.guidance ?? "", name: g.name ?? "" });
            }
          }
          if (path.length > 1) {
            const cum = cumulative(path);
            // 안내 거리 합과 경로 길이가 조금 달라도 비율로 맞춘다
            const scale = acc > 0 ? cum[cum.length - 1] / acc : 1;
            return {
              path,
              cum,
              distance: r.summary.distance,
              duration: r.summary.duration,
              guides: guides.map((g) => ({ ...g, at: g.at * scale })),
              source: "kakao",
            };
          }
        }
      }
    } catch {
      /* 아래 직선 경로로 대체 */
    }
  }
  const path = [origin, dest];
  const cum = cumulative(path);
  const d = cum[1];
  return { path, cum, distance: Math.round(d * 1.3), duration: Math.round((d * 1.3) / (25_000 / 3600)), guides: [], source: "straight" };
}

/** 경로 위 travelled(m) 지점의 좌표와 진행 방향(도, 북쪽 0·시계 방향) */
export function pointAt(route: Route, travelled: number): { pt: Pt; heading: number; index: number } {
  const { path, cum } = route;
  const total = cum[cum.length - 1];
  const d = Math.max(0, Math.min(total, travelled));
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const a = path[i - 1];
  const b = path[i];
  const seg = cum[i] - cum[i - 1] || 1;
  const t = (d - cum[i - 1]) / seg;
  const pt = { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
  const y = b.lat - a.lat;
  const x = (b.lng - a.lng) * Math.cos((a.lat * Math.PI) / 180);
  const heading = (Math.atan2(x, y) * 180) / Math.PI;
  return { pt, heading, index: i };
}
