"use client";

import type { ReactNode } from "react";
import WordReveal from "../marketing/WordReveal";
import { RevealGroup, RevealItem } from "../system/ui";
import { socialPage } from "../../copy";
import {
  IconCalendar,
  IconCamera,
  IconChart,
  IconCut,
  IconLoop,
  IconTarget,
} from "./Icons";
import styles from "./social.module.css";

/* ------------------------------------------------------------------ */
/*  Was dazugehoert                                                    */
/*                                                                     */
/*  Sechs Leistungen, jede als ein gezeichnetes Zeichen und zwei bis    */
/*  drei Woerter. Bewusst ohne Erklaersatz, weil an dieser Stelle die   */
/*  Aufzaehlung genuegt und jeder weitere Satz die Seite verlaengert,   */
/*  ohne sie verstaendlicher zu machen.                                */
/*                                                                     */
/*  Die Zeichen stehen in einem Raster aus Haarlinien statt in Karten.  */
/*  Sechs gleich grosse Kaesten waeren die bequeme und die langweilige  */
/*  Loesung.                                                           */
/* ------------------------------------------------------------------ */

const MARKS: Record<string, ReactNode> = {
  plan: <IconCalendar />,
  shoot: <IconCamera />,
  cut: <IconCut />,
  ads: <IconTarget />,
  care: <IconLoop />,
  report: <IconChart />,
};

export default function ScopeMarks() {
  return (
    <section className="section" data-shot="umfang">
      <div className="shell">
        <div className={styles.secHead}>
          <WordReveal as="h2" className="t-h2" text={socialPage.scope.title} />
        </div>

        <RevealGroup as="ul" className={styles.scopeList}>
          {socialPage.scope.items.map((item) => (
            <RevealItem as="li" className={styles.scopeItem} key={item.id}>
              <span className={styles.scopeIcon} aria-hidden="true">
                {MARKS[item.id]}
              </span>
              <span className={styles.scopeLabel}>{item.label}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
