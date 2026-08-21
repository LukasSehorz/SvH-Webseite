type Props = {
  variant?: "dark" | "light";
  className?: string;
  /** Höhe in px; die Breite skaliert mit. */
  height?: number;
};

/**
 * Wortmarke "SVH CONSULTING" mit vorangestellter Bildmarke aus drei
 * aufsteigenden Winkeln (Chevrons) — visuell verwandt mit der Referenz,
 * aber eigenständig.
 */
export default function Logo({ variant = "dark", className, height = 30 }: Props) {
  const ink = variant === "dark" ? "#001A23" : "#FFFFFF";
  const accent = variant === "dark" ? "#0092D4" : "#B6EAFF";

  return (
    <svg
      viewBox="0 0 232 34"
      height={height}
      width={(232 / 34) * height}
      className={className}
      role="img"
      aria-label="SVH Consulting"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bildmarke: drei aufsteigende Winkel */}
      <g>
        <path d="M4 27.5 L14 14.5 L24 27.5" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
        <path d="M7.5 21 L14 12 L20.5 21" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        <path d="M10.5 14.5 L14 9.5 L17.5 14.5" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Wortmarke */}
      <text
        x="36"
        y="25"
        fill={ink}
        fontFamily="var(--font-serif)"
        fontSize="26"
        fontWeight="600"
        letterSpacing="0.02em"
      >
        SVH
      </text>
      <text
        x="104"
        y="24"
        fill={ink}
        fontFamily="var(--font-sans)"
        fontSize="13"
        fontWeight="500"
        letterSpacing="0.30em"
        opacity="0.72"
      >
        CONSULTING
      </text>
    </svg>
  );
}
