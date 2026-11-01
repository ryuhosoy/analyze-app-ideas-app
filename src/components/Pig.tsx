type Mood = "happy" | "thinking" | "sleepy" | "wow";

/** BooScout のメインキャラクター「ブーちゃん」 */
export function Pig({
  size = 120,
  mood = "happy",
  magnifier = false,
  className,
}: {
  size?: number;
  mood?: Mood;
  magnifier?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="ブーちゃん"
    >
      {/* 耳 */}
      <path d="M38 72 C30 38 44 22 58 26 C70 30 78 48 80 62 Z" fill="#FFB3C9" stroke="#E7799C" strokeWidth="4" strokeLinejoin="round" />
      <path d="M48 62 C45 44 52 36 59 38 C65 41 69 50 70 58 Z" fill="#FF8FB1" />
      <path d="M162 72 C170 38 156 22 142 26 C130 30 122 48 120 62 Z" fill="#FFB3C9" stroke="#E7799C" strokeWidth="4" strokeLinejoin="round" />
      <path d="M152 62 C155 44 148 36 141 38 C135 41 131 50 130 58 Z" fill="#FF8FB1" />

      {/* 顔 */}
      <ellipse cx="100" cy="112" rx="72" ry="64" fill="#FFC8D8" stroke="#E7799C" strokeWidth="4" />
      <ellipse cx="78" cy="78" rx="18" ry="9" fill="#FFFFFF" opacity="0.45" transform="rotate(-20 78 78)" />

      {/* ほっぺ */}
      <ellipse cx="50" cy="132" rx="13" ry="8" fill="#FF8FB1" opacity="0.55" />
      <ellipse cx="150" cy="132" rx="13" ry="8" fill="#FF8FB1" opacity="0.55" />

      {/* 目 */}
      {mood === "sleepy" ? (
        <g stroke="#3B2A33" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M62 104 Q72 112 82 104" />
          <path d="M118 104 Q128 112 138 104" />
        </g>
      ) : mood === "thinking" ? (
        <g>
          <ellipse cx="72" cy="100" rx="7.5" ry="9" fill="#3B2A33" />
          <ellipse cx="128" cy="100" rx="7.5" ry="9" fill="#3B2A33" />
          <circle cx="75" cy="95" r="3" fill="#fff" />
          <circle cx="131" cy="95" r="3" fill="#fff" />
        </g>
      ) : (
        <g>
          <ellipse cx="72" cy="102" rx={mood === "wow" ? 9 : 7.5} ry={mood === "wow" ? 11 : 9} fill="#3B2A33" />
          <ellipse cx="128" cy="102" rx={mood === "wow" ? 9 : 7.5} ry={mood === "wow" ? 11 : 9} fill="#3B2A33" />
          <circle cx="74.5" cy="98" r="3" fill="#fff" />
          <circle cx="130.5" cy="98" r="3" fill="#fff" />
        </g>
      )}

      {/* 鼻 */}
      <ellipse cx="100" cy="134" rx="27" ry="19" fill="#FF9EBB" stroke="#E7799C" strokeWidth="4" />
      <ellipse cx="90" cy="134" rx="4.5" ry="7" fill="#C2577A" />
      <ellipse cx="110" cy="134" rx="4.5" ry="7" fill="#C2577A" />

      {/* 口 */}
      {mood === "wow" ? (
        <ellipse cx="100" cy="162" rx="6" ry="5" fill="#C2577A" />
      ) : mood === "thinking" ? (
        <path d="M92 162 Q100 160 108 162" stroke="#C2577A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M90 158 Q100 168 110 158" stroke="#C2577A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}

      {/* 虫めがね */}
      {magnifier && (
        <g>
          <line x1="168" y1="180" x2="186" y2="198" stroke="#7A5232" strokeWidth="9" strokeLinecap="round" />
          <circle cx="156" cy="166" r="21" fill="#E6F6FF" fillOpacity="0.75" stroke="#7A5232" strokeWidth="6" />
          <path d="M146 158 Q150 152 157 151" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
