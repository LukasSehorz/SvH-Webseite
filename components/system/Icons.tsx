// Kleine Strich-Symbole in der Strichstärke der Marke
type P = { className?: string; size?: number };

export function Arrow({ className, size = 18 }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9h11.5M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowOut({ className, size = 16 }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 11 11 5M6 4.5h5.5V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Caret({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check({ className, size = 16 }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.4 6.6 11.4 12.6 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
    </svg>
  );
}

export function Play({ className, size = 22 }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M7.5 5.2v11.6c0 .6.7 1 1.2.7l9-5.8c.5-.3.5-1.1 0-1.4l-9-5.8c-.5-.3-1.2.1-1.2.7Z" fill="currentColor" />
    </svg>
  );
}

export function Phone({ className, size = 18 }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4.2 2.5h2.4l1.2 3-1.6 1.2a8.6 8.6 0 0 0 5.1 5.1l1.2-1.6 3 1.2v2.4c0 .8-.7 1.5-1.5 1.5A13 13 0 0 1 2.7 4c0-.8.7-1.5 1.5-1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Mail({ className, size = 18 }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.5" y="4" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m3 5 6 4.6L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Clock({ className, size = 18 }: P) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5.5V9l2.4 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
