import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export interface Prefs {
  voice: boolean;
  big: boolean;
}

interface AppCtx {
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
  speak: (text: string) => void;
  toast: (text: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);
const PREF_KEY = "ud-pref";

function loadPrefs(): Prefs {
  try {
    const s = JSON.parse(localStorage.getItem(PREF_KEY) ?? "{}") as Partial<Prefs>;
    return { voice: s.voice ?? true, big: !!s.big };
  } catch {
    return { voice: true, big: false };
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Prefs>(loadPrefs);
  const [toastText, setToastText] = useState<string | null>(null);
  const toastTimer = useRef<number>();
  const voiceRef = useRef(prefs.voice);
  voiceRef.current = prefs.voice;

  const setPrefs = useCallback((p: Prefs) => {
    setPrefsState(p);
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(p));
    } catch {
      /* 저장소 사용 불가 */
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("big", prefs.big);
  }, [prefs.big]);

  const speak = useCallback((text: string) => {
    if (!voiceRef.current || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      speechSynthesis.speak(u);
    } catch {
      /* 음성 사용 불가 */
    }
  }, []);

  const toast = useCallback((text: string) => {
    setToastText(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastText(null), 2600);
  }, []);

  const value = useMemo(() => ({ prefs, setPrefs, speak, toast }), [prefs, setPrefs, speak, toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {toastText && (
        <div className="toast" role="status">
          {toastText}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
