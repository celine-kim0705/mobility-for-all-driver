/* eslint-disable @typescript-eslint/no-explicit-any */
// 카카오맵 JavaScript SDK를 한 번만 불러온다.

declare global {
  interface Window {
    kakao: any;
  }
}

let loading: Promise<any> | null = null;

export const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY?.trim() || "";
export const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY?.trim() || "";

export function loadKakao(): Promise<any> {
  if (!KAKAO_JS_KEY) return Promise.reject(new Error("NO_JS_KEY"));
  if (window.kakao?.maps?.LatLng) return Promise.resolve(window.kakao);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(KAKAO_JS_KEY)}&libraries=services&autoload=false`;
    s.async = true;
    s.onload = () => {
      if (!window.kakao?.maps) return reject(new Error("SDK_LOAD_FAILED"));
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    s.onerror = () => {
      loading = null;
      reject(new Error("SDK_LOAD_FAILED"));
    };
    document.head.appendChild(s);
  });
  return loading;
}
