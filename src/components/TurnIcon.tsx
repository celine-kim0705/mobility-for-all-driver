/** 길 안내 화살표. 안내 문구로 방향을 고른다. */
export function TurnIcon({ guidance }: { guidance: string }) {
  const g = guidance.replace(/\s/g, "");
  const dir =
    /유턴|U턴/.test(g) ? "uturn" : /좌회전|왼쪽/.test(g) ? "left" : /우회전|오른쪽/.test(g) ? "right" : /도착|목적지/.test(g) ? "arrive" : "straight";
  const stroke = { stroke: "var(--accent)", strokeWidth: 5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" className="turn-icon">
      {dir === "right" && (
        <>
          <path d="M12 38V22a6 6 0 0 1 6-6h16" {...stroke} />
          <path d="M28 9l7 7-7 7" {...stroke} />
        </>
      )}
      {dir === "left" && (
        <>
          <path d="M32 38V22a6 6 0 0 0-6-6H10" {...stroke} />
          <path d="M16 9l-7 7 7 7" {...stroke} />
        </>
      )}
      {dir === "straight" && (
        <>
          <path d="M22 40V8" {...stroke} />
          <path d="M14 15l8-8 8 8" {...stroke} />
        </>
      )}
      {dir === "uturn" && (
        <>
          <path d="M30 40V18a8 8 0 0 0-16 0v12" {...stroke} />
          <path d="M8 24l6 7 6-7" {...stroke} />
        </>
      )}
      {dir === "arrive" && (
        <>
          <path d="M22 40s-12-12-12-21a12 12 0 0 1 24 0c0 9-12 21-12 21z" {...stroke} />
          <circle cx="22" cy="19" r="4" fill="var(--accent)" />
        </>
      )}
    </svg>
  );
}
