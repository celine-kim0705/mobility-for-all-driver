/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 카카오 개발자 콘솔 > 앱 키 > JavaScript 키 (지도·주소 검색) */
  readonly VITE_KAKAO_JS_KEY?: string;
  /** 카카오 개발자 콘솔 > 앱 키 > REST API 키 (카카오모빌리티 길찾기) */
  readonly VITE_KAKAO_REST_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
