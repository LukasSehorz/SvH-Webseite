import styles from "./marketing.module.css";

/**
 * Browser-Rahmen mit Haarlinie, Radius 16 und angedeuteter Kopfleiste.
 * Wird vom Showcase und vom stillen Webdesign-Visual verwendet.
 */
export default function BrowserFrame({
  children,
  className,
}: Readonly<{ children?: React.ReactNode; className?: string }>) {
  return (
    <div className={className ? `${styles.bf} ${className}` : styles.bf}>
      <div className={styles.bfBar} aria-hidden="true">
        <span className={styles.bfDot} />
        <span className={styles.bfDot} />
        <span className={styles.bfDot} />
        <span className={styles.bfAddr} />
      </div>
      <div className={styles.bfBody}>{children}</div>
    </div>
  );
}
