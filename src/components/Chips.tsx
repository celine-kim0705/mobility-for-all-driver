export function Chips({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={`chips${className ? ` ${className}` : ""}`}>
      {items.map((c) => (
        <div className="chip" key={c}>
          {c}
        </div>
      ))}
    </div>
  );
}
