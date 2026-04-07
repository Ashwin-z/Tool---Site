type BrandMarkProps = {
  size?: number;
  className?: string;
};

export default function BrandMark({ size = 28, className }: BrandMarkProps) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{ width: size, height: size, display: "inline-flex" }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        role="img"
        aria-label="ToolMint logo mark"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="toolmint-bg" x1="9" y1="7" x2="57" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4f46e5" />
            <stop offset="0.55" stopColor="#6366f1" />
            <stop offset="1" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="toolmint-stroke" x1="19" y1="17" x2="46" y2="47" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f8faff" />
            <stop offset="1" stopColor="#dcfce7" />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#toolmint-bg)" />
        <path
          d="M17 20h30v8H36v19h-8V28H17z"
          fill="none"
          stroke="url(#toolmint-stroke)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M41.5 35.5a10.5 10.5 0 0 1 9.5 6.1c-1.9 4.2-5.6 7.7-10.8 8.6"
          fill="none"
          stroke="#dcfce7"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.92"
        />
        <circle cx="46" cy="46" r="2.7" fill="#dcfce7" />
      </svg>
    </span>
  );
}
