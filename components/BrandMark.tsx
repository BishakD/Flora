type BrandMarkProps = {
  className?: string;
  label?: boolean;
  inverse?: boolean;
};

export function BrandMark({ className = "", label = false, inverse = false }: BrandMarkProps) {
  const ink = inverse ? "#F6F1E7" : "#3F5064";
  const accent = inverse ? "#C6A15B" : "#C6A15B";

  return (
    <span className={`inline-flex flex-col items-center gap-2 ${className}`} aria-label={label ? "Flora" : undefined}>
      <svg
        aria-hidden="true"
        width="54"
        height="66"
        viewBox="0 0 54 66"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M27 62C12 53 7 40 9 25C11 12 17 5 27 3C37 5 43 12 45 25C47 40 42 53 27 62Z" stroke={accent} strokeWidth="0.9" />
        <path d="M27 55V14M27 17C34 13 39 14 42 18C38 22 33 23 27 22M27 29C20 25 15 26 12 30C16 34 21 35 27 34M27 41C34 37 39 38 42 42C38 46 33 47 27 46" stroke={accent} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 48V18H36M22 31H33" stroke={ink} strokeWidth="1.45" strokeLinecap="round" />
      </svg>
      {label ? <span className="font-display text-lg tracking-[0.28em] text-current">FLORA</span> : null}
    </span>
  );
}
