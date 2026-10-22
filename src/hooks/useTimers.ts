import { useEffect, useRef } from "react";

/** delay가 null이면 멈춘다. 콜백은 항상 최신 것을 부른다. */
export function useInterval(cb: () => void, delay: number | null) {
  const saved = useRef(cb);
  saved.current = cb;
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/** delay가 null이면 걸지 않는다. key가 바뀌면 다시 건다. */
export function useTimeout(cb: () => void, delay: number | null, key?: unknown) {
  const saved = useRef(cb);
  saved.current = cb;
  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => saved.current(), delay);
    return () => clearTimeout(id);
  }, [delay, key]);
}

/** 화면이 처음 그려질 때 한 번 실행 */
export function useMount(cb: () => void) {
  const saved = useRef(cb);
  useEffect(() => {
    saved.current();
  }, []);
}
