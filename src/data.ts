// 프로토타입에서 쓰는 예시 데이터. 실제 연동 시 서버·차량 SDK 값으로 바뀐다.

export const DRIVER = {
  name: "강기사",
  kind: "법인택시 · UD택시",
  plate: "서울 33바 5521",
  battery: "배터리 81% · 220km",
  quota: 53,
  endTime: "18:00",
};

export interface CallInfo {
  from: [string, string];
  fromAddr: string;
  dist: string;
  to: string;
  toAddr: string;
  chips: string[];
  memo: string;
  phone: string;
  wheel: string;
  meetChips: string[];
}

export const CALL: CallInfo = {
  from: ["래미안베라힐즈 아파트", "101동 정문 앞"],
  fromAddr: "서울시 은평구 통일로 630 101동",
  dist: "2.1km · 약 8분",
  to: "은평 성모병원",
  toAddr: "은평구 통일로 1021 · 본관 정문",
  chips: ["수동 휠체어", "밀어주세요", "짐 2개", "보호자 1명"],
  memo: "101동 정문 앞에서 기다려요",
  phone: "0507-1234-5678",
  wheel: "수동 휠체어 · 폭 65cm",
  meetChips: ["밀어주세요", "보호자 1명"],
};

/** 시간 값(초). 데모용으로 빠르게 진행한다. */
export const TIMING = {
  dispatchDelay: 10_000,
  acceptLimit: 180,
  route: { km: 2.1, sec: 480, speed: 6 },
  ride: { min: 15, km: 4.7, msgAt: 5, msg: "에어컨 좀 약하게 해주세요" },
  dropAfterArrive: 5_000,
  stepGap: 2_500,
  payResult: 3_000,
  nextLabelDelay: 3_000,
  autoNext: 5,
};

export const FARE = { amount: 1500, label: "1,500원" };

export interface Step {
  t: string;
  now: string;
  done: string;
}

export const DEPART_STEPS: Step[] = [
  { t: "휠체어 고정", now: "잠김 확인 중…", done: "고정 장치 4곳 잠김" },
  { t: "안전벨트", now: "확인 중…", done: "손님 벨트 채움" },
  { t: "슬로프", now: "접는 중…", done: "슬로프 수납 완료" },
  { t: "모든 문", now: "닫히는 중…", done: "모든 문 닫힘" },
];

export const DROP_STEPS: Step[] = [
  { t: "목적지 도착", now: "위치 확인 중…", done: "위치로 확인" },
  { t: "차가 멈췄어요", now: "주차 브레이크 확인 중…", done: "주차 브레이크 잠김" },
  { t: "문이 열렸어요", now: "문 열림 확인 중…", done: "문 열림 신호" },
];

export const EQUIP_ITEMS = [
  { k: "slope", t: "슬로프", d: "끝까지 펴지고, 수납 후 흔들리지 않아요" },
  { k: "lock", t: "휠체어 고정 장치", d: "4점 벨트가 감기고 잠금 소리가 나요" },
  { k: "belt", t: "승객 안전벨트", d: "버클이 정상으로 잠겨요" },
] as const;

export const REPORT_REASONS = [
  { k: "slope", t: "슬로프" },
  { k: "lock", t: "휠체어 고정 장치" },
  { k: "belt", t: "안전벨트" },
  { k: "door", t: "문" },
  { k: "etc", t: "기타" },
] as const;

export const NORIDE_REASONS = [
  { k: "noshow", t: "손님이 안 나와요", d: "전화·메시지에 답이 없어요" },
  { k: "mismatch", t: "정보와 달라요", d: "휠체어나 도움이 달라요" },
  { k: "nofit", t: "차에 안 맞아요", d: "휠체어가 들어가지 않아요" },
  { k: "cancel", t: "손님이 취소했어요" },
  { k: "etc", t: "다른 이유" },
] as const;

export const PAY_FAIL_REASONS = [
  "카드 잔액이 부족해요",
  "카드사가 응답하지 않아요",
  "등록된 카드의 유효기간이 지났어요",
];

export const ALERTS = [
  { tag: "공지", warn: false, t: "[공지] 휠체어 고정 장치 점검 안내", tm: "오늘 08:30", notice: true },
  { tag: "관제", warn: true, t: "성동구 일대 도로 공사로 승차지점 변경 요청이 많아요. 승객 메모를 꼭 확인해 주세요.", tm: "어제 17:10", notice: false },
  { tag: "배차", warn: false, t: "이달 남은 우선 배차는 53건이에요.", tm: "10월 20일", notice: false },
];
