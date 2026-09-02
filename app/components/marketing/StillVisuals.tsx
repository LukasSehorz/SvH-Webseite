import BrowserFrame from "./BrowserFrame";
import styles from "./marketing.module.css";

/* ------------------------------------------------------------------ */
/*  Stille Visuals der Unterseite                                      */
/*                                                                     */
/*  Reine DOM- und SVG-Gerueste aus Haarlinien. Sie erklaeren die       */
/*  Leistung, ohne mit den Kugeln oder dem Showcase zu konkurrieren.    */
/* ------------------------------------------------------------------ */

/** Reduziertes Feed-Geruest fuer Social Media Marketing. */
function FeedVisual() {
  return (
    <div className={styles.feed}>
      <div className={styles.feedBack} />
      <div className={styles.feedCard}>
        <div className={styles.feedHead}>
          <span className={styles.feedAvatar} />
          <span className={styles.feedLines}>
            <span className={styles.bar} style={{ width: "44%" }} />
            <span className={styles.barSoft} style={{ width: "26%" }} />
          </span>
        </div>

        <div className={styles.feedMedia} />

        <div className={styles.feedActions}>
          <span className={styles.feedAction} />
          <span className={styles.feedAction} />
          <span className={styles.feedAction} />
        </div>

        <div className={styles.feedFoot}>
          <span className={styles.bar} style={{ width: "82%" }} />
          <span className={styles.barSoft} style={{ width: "58%" }} />
        </div>
      </div>
    </div>
  );
}

/** Displaysilhouette mit langsam wanderndem Verlaufs-Schimmer. */
function BoardVisual() {
  return (
    <div className={styles.board}>
      <div className={styles.boardScreen}>
        <span className={styles.boardShimmer} />
        <span className={styles.boardInner} />
        <span className={styles.boardContent}>
          <span className={styles.bar} style={{ width: "62%" }} />
          <span className={styles.bar} style={{ width: "44%" }} />
          <span className={styles.barSoft} style={{ width: "30%" }} />
        </span>
      </div>
      <span className={styles.boardPole} />
      <span className={styles.boardBase} />
      <span className={styles.boardGround} />
    </div>
  );
}

/** Browser-Geruest fuer Webdesign. */
function WebVisual() {
  return (
    <BrowserFrame className={styles.webFrame}>
      <div className={styles.wire}>
        <div className={styles.wireNav}>
          <span className={styles.wirePill} />
          <span style={{ flex: "1 1 auto" }} />
          <span className={styles.barSoft} style={{ width: 34 }} />
          <span className={styles.barSoft} style={{ width: 34 }} />
          <span className={styles.barSoft} style={{ width: 34 }} />
        </div>

        <div className={styles.wireHero}>
          <span className={styles.bar} style={{ width: "72%", height: 10 }} />
          <span className={styles.bar} style={{ width: "54%", height: 10 }} />
          <span className={styles.barSoft} style={{ width: "62%" }} />
          <span className={styles.wireBtn} />
        </div>

        <div className={styles.wireCards}>
          <span className={styles.wireCard}>
            <span className={styles.bar} style={{ width: "70%" }} />
            <span className={styles.barSoft} style={{ width: "90%" }} />
          </span>
          <span className={styles.wireCard}>
            <span className={styles.bar} style={{ width: "62%" }} />
            <span className={styles.barSoft} style={{ width: "84%" }} />
          </span>
          <span className={styles.wireCard}>
            <span className={styles.bar} style={{ width: "76%" }} />
            <span className={styles.barSoft} style={{ width: "88%" }} />
          </span>
        </div>
      </div>
    </BrowserFrame>
  );
}

const VISUALS: Record<string, React.ComponentType> = {
  social: FeedVisual,
  dooh: BoardVisual,
  web: WebVisual,
};

/** Waehlt das Visual zur Kennung des Leistungsblocks. */
export default function StillVisual({ id }: Readonly<{ id: string }>) {
  const Visual = VISUALS[id] ?? WebVisual;
  return (
    <div className={styles.visual} aria-hidden="true">
      <span className={styles.visualGlow} />
      <Visual />
    </div>
  );
}
