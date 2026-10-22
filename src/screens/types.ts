export interface NavProps {
  onAlerts?: () => void;
  onMenu?: () => void;
  unread?: boolean;
}

export type Screen =
  | "start"
  | "wait"
  | "blocked"
  | "notice"
  | "call"
  | "go"
  | "meet"
  | "noride"
  | "checkRide"
  | "ride"
  | "drop";

/** 대기 중 배차를 멈춘 상태 */
export type SubState = "rest" | "general" | null;
