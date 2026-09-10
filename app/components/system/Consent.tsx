"use client";

/* ------------------------------------------------------------------
   Die Einwilligung in die Messung und das Nachladen des Tag Manager.

   WARUM DER TAG MANAGER NICHT EINFACH IM KOPF DER SEITE STEHT. Der von
   Google gelieferte Schnipsel laedt gtm.js beim ersten Bild der Seite.
   Damit geht die Adresse jedes Besuchers an Google, bevor irgendjemand
   zugestimmt hat, und die Tags darin legen Kennungen auf dem Geraet ab.
   Paragraf 25 TDDDG verlangt die Einwilligung VORHER, und die
   Datenschutzerklaerung dieser Seite sagt in Abschnitt 7 ausdruecklich
   zu, dass nicht notwendige Werkzeuge erst nach Zustimmung laufen. Ein
   Schnipsel im Kopf wuerde also eine Zusage brechen, die die Seite selbst
   gibt.

   WIE ES STATTDESSEN LAEUFT. Beim ersten Aufruf steht der Consent Mode
   auf abgelehnt, und zwar bevor irgendetwas von Google geladen wird.
   Erst der Klick auf Einverstanden hebt ihn auf gewaehrt und laedt
   gtm.js nach. Wer nur das Noetige erlaubt, bekommt dieselbe Seite, und
   es wird nichts geladen und nichts gespeichert auszer der Entscheidung
   selbst.

   DIE ENTSCHEIDUNG LIEGT IM BROWSER DES BESUCHERS, unter dem Schluessel
   aus tracking.ts. Sie ist technisch notwendig, denn ohne sie muesste
   die Frage bei jedem Aufruf neu gestellt werden. Sie geht an niemanden
   und traegt nichts als das Wort alle oder notwendig.

   DIE KENNUNG KOMMT AUS tracking.ts und steht nirgends sonst im
   Quelltext. Sie hat frueher mehrfach nicht gestimmt, weil dieselbe
   Zeichenfolge an mehreren Stellen lag.
   ------------------------------------------------------------------ */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { einwilligung } from "../../copy";
import { CONSENT_KEY, GTM_ID, type Einwilligung } from "../../tracking";

/** Der Datenschacht, den der Tag Manager liest. */
type DataLayer = { push: (...args: unknown[]) => void };

declare global {
  interface Window {
    dataLayer?: unknown[];
    /* Der Tag Manager erwartet die Funktion unter genau diesem Namen und
       liest ihre Argumente ueber das arguments-Objekt. Sie darf deshalb
       keine Pfeilfunktion sein und ihre Argumente nicht umbenennen. */
    gtag?: (...args: unknown[]) => void;
    /* Der Widerruf aus der Fusszeile ruft diese Funktion auf. Sie steht
       am Fenster, weil die Fusszeile ein Server-Bauteil ist und keinen
       Zustand dieser Komponente kennt. */
    svhEinwilligungAendern?: () => void;
  }
}

/** Legt den Schacht an und gibt die Meldefunktion zurueck. */
function schacht(): DataLayer {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer as unknown as DataLayer;
}

/**
 * Meldet dem Consent Mode, was erlaubt ist.
 *
 * Die vier Felder sind die von Google verlangten. Sicherheit und
 * Funktion stehen dauerhaft auf gewaehrt, denn sie tragen keine Messung;
 * die beiden anderen haengen an der Entscheidung.
 */
function setzeConsent(stand: Einwilligung) {
  const dl = schacht();
  const erlaubt = stand === "alle" ? "granted" : "denied";
  dl.push([
    "consent",
    "update",
    {
      ad_storage: erlaubt,
      ad_user_data: erlaubt,
      ad_personalization: erlaubt,
      analytics_storage: erlaubt,
    },
  ]);
}

/** Laedt gtm.js nach. Genau einmal, auch bei mehrfachem Aufruf. */
function ladeGtm() {
  if (document.getElementById("gtm-script")) return;

  const dl = schacht();
  dl.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const skript = document.createElement("script");
  skript.id = "gtm-script";
  skript.async = true;
  skript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(skript);
}

export default function Consent() {
  /* null heiszt, dass die Frage noch nicht beantwortet ist. Der erste
     Anstrich zeigt trotzdem nichts, damit der Server und der Browser
     dasselbe ausliefern und React nicht ueber einen Unterschied klagt. */
  const [stand, setStand] = useState<Einwilligung | null>(null);
  const [gefragt, setGefragt] = useState(false);

  useEffect(() => {
    /* Der Ausgangszustand des Consent Mode. Er musz stehen, BEVOR
       irgendetwas von Google geladen wird, sonst zaehlt Google den
       ersten Aufruf als erlaubt. */
    const dl = schacht();
    dl.push([
      "consent",
      "default",
      {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        security_storage: "granted",
        functionality_storage: "granted",
        wait_for_update: 500,
      },
    ]);

    let gemerkt: string | null = null;
    try {
      gemerkt = window.localStorage.getItem(CONSENT_KEY);
    } catch {
      /* Wer die Ablage sperrt, bekommt die Frage bei jedem Aufruf neu.
         Das ist die ehrlichere Seite des Fehlers. */
    }

    if (gemerkt === "alle" || gemerkt === "notwendig") {
      setStand(gemerkt);
      if (gemerkt === "alle") {
        setzeConsent("alle");
        ladeGtm();
      }
    }
    setGefragt(true);

    /* Der Widerruf aus der Fusszeile. Er stellt die Frage erneut. */
    window.svhEinwilligungAendern = () => setStand(null);
    return () => {
      delete window.svhEinwilligungAendern;
    };
  }, []);

  const entscheide = useCallback((wahl: Einwilligung) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, wahl);
    } catch {
      /* Ohne Ablage gilt die Entscheidung nur fuer diesen Aufruf. */
    }
    setzeConsent(wahl);
    if (wahl === "alle") ladeGtm();
    setStand(wahl);
  }, []);

  /* Solange die gemerkte Entscheidung noch nicht gelesen ist, bleibt das
     Feld leer. Sonst blitzt es bei jedem Aufruf kurz auf, obwohl der
     Besucher laengst geantwortet hat. */
  if (!gefragt || stand !== null) return null;

  return (
    <div className="cons" role="dialog" aria-modal="false" aria-labelledby="cons-titel">
      <div className="cons-card">
        <p className="cons-titel" id="cons-titel">
          {einwilligung.titel}
        </p>
        <p className="cons-body">{einwilligung.body}</p>

        <div className="cons-knoepfe">
          <button type="button" className="btn-solid" onClick={() => entscheide("alle")}>
            {einwilligung.alle}
          </button>
          <button type="button" className="btn-line" onClick={() => entscheide("notwendig")}>
            {einwilligung.notwendig}
          </button>
        </div>

        <p className="cons-mehr">
          <Link href={einwilligung.mehrHref}>{einwilligung.mehr}</Link>
        </p>
      </div>

      <style jsx global>{`
        /* Das Feld steht unten links und nimmt nicht das ganze Bild ein.
           Ein Vorhang ueber der Seite waere ein Druckmittel, und die
           beiden Knoepfe haben ohnehin dasselbe Gewicht. */
        .cons {
          position: fixed;
          left: max(16px, var(--gutter));
          bottom: max(16px, 3vh);
          z-index: 90;
          width: min(420px, calc(100vw - 32px));
          animation: consAuf 0.55s var(--ease-out-expo) both;
        }

        .cons-card {
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 22px 22px 10px;
          background: rgba(11, 11, 16, 0.97);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        }

        .cons-titel {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 400;
          line-height: 1.2;
          letter-spacing: -0.014em;
          color: var(--ink);
          margin: 0;
        }

        .cons-body {
          margin: 10px 0 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--ink-2);
        }

        .cons-knoepfe {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        /* Beide Knoepfe stehen gleich grosz nebeneinander. Ein kleiner
           Ablehnen-Knopf neben einem groszen Zustimmen-Knopf waere eine
           Nudge und rechtlich angreifbar. */
        .cons-knoepfe .btn-solid,
        .cons-knoepfe .btn-line {
          flex: 1 1 auto;
          height: 46px;
          padding-inline: 18px;
          font-size: 14px;
        }

        /* Der Abstand faellt kleiner aus als er aussieht, weil der Verweis
           darunter vierzig Bildpunkte hoch ist und seinen Leerraum schon
           selbst mitbringt. */
        .cons-mehr {
          margin: 4px 0 0;
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--ink-3);
        }

        /* Der Verweis ist so hoch wie ein Daumen breit ist, sonst trifft
           ihn auf dem Telefon niemand. Vierzig Bildpunkte sind dieselbe
           Marke wie beim Widerruf in der Fusszeile. */
        .cons-mehr a {
          display: inline-flex;
          align-items: center;
          min-height: 40px;
          color: var(--ink-2);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--line);
          transition: color 0.3s var(--ease-out-expo);
        }

        .cons-mehr a:hover {
          color: var(--ink);
        }

        @keyframes consAuf {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        /* Auf dem Telefon spannt das Feld ueber die ganze Breite, und die
           Knoepfe stehen untereinander, damit jeder die volle Flaeche zum
           Antippen bekommt. */
        @media (max-width: 560px) {
          .cons {
            left: 12px;
            right: 12px;
            bottom: 12px;
            width: auto;
          }

          .cons-knoepfe {
            flex-direction: column;
          }

          .cons-knoepfe .btn-solid,
          .cons-knoepfe .btn-line {
            width: 100%;
            height: 48px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cons {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
