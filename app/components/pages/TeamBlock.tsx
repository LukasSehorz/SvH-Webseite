"use client";

import { aboutPage } from "../../copy";
import { Reveal, RevealGroup, RevealItem, SplitHeadline } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  /ueber-uns · Die beiden Gruender                                   */
/*                                                                     */
/*  Die Kurzprofile liegen noch nicht vor. Fuer den Livegang gilt die  */
/*  Entscheidung, dass kein Platzhalter sichtbar wird: eine Zeile, die */
/*  mit der Markierung beginnt, wird schlicht nicht ausgegeben. In     */
/*  copy.ts bleibt die Markierung stehen, damit die Luecke spaeter     */
/*  gefuellt wird. Der Block traegt deshalb mit Name und Rolle allein. */
/* ------------------------------------------------------------------ */

/**
 * Initialen aus Vor- und Nachname, hoechstens zwei Zeichen. Genommen wird
 * der erste und der letzte Namensteil, damit Namenszusaetze wie „vom" oder
 * „von" den Nachnamen nicht verdraengen.
 */
function initials(name: string): string {
  const parts = name.split(/\s+/).filter((part) => /^\p{L}/u.test(part));
  if (parts.length === 0) return "";

  const first = parts[0][0].toUpperCase();
  if (parts.length === 1) return first;

  return first + parts[parts.length - 1][0].toUpperCase();
}

/** Eine noch offene Stelle aus copy.ts erscheint nicht auf der Seite. */
function published(text: string | undefined): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  return trimmed.startsWith("❗") ? null : trimmed;
}

export default function TeamBlock() {
  return (
    <section className="section about-team" id="team">
      <div className="shell">
        <Reveal>
          <SplitHeadline
            className="t-h1 team-title"
            before={aboutPage.team.titleBefore}
            word={aboutPage.team.gradientWord}
            after={aboutPage.team.titleAfter}
          />
        </Reveal>

        <RevealGroup as="ul" className="team-grid">
          {aboutPage.team.members.map((member) => {
            const profile = published(member.body);

            return (
              <RevealItem as="li" key={member.name} className="team-member">
                <div className="team-mark" aria-hidden="true">
                  <span className="team-glow" />
                  <span className="team-initials">{initials(member.name)}</span>
                </div>

                <h3 className="team-name">{member.name}</h3>
                <p className="t-label team-role">{member.role}</p>
                {profile ? <p className="t-body team-profile">{profile}</p> : null}
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.16}>
          <p className="t-body-lg team-note">{aboutPage.team.note}</p>
        </Reveal>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.about-team` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie `RevealGroup` weiterreicht.
      */}
      <style jsx global>{`
        .about-team .team-title {
          max-width: 14ch;
          margin-bottom: clamp(44px, 5vw, 72px);
        }

        /* Zwei Namen ohne Kurzprofil fuellen keine Schale von 2240
           Bildpunkten. Die Gruppe bleibt deshalb schmal und steht als
           Block links, statt sich ueber die ganze Breite zu verlieren. */
        .about-team .team-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(32px, 5vw, 72px);
          max-width: 840px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .about-team .team-member {
          border-top: 1px solid var(--line);
          padding-top: 30px;
        }

        .about-team .team-mark {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(112px, 11vw, 148px);
          aspect-ratio: 1;
          border: 1px solid var(--line);
          border-radius: 18px;
          overflow: hidden;
          transition: border-color 0.5s var(--ease-out-expo);
        }

        .about-team .team-member:hover .team-mark {
          border-color: var(--ink-2);
        }

        /* Der Schimmer sitzt hinter den Initialen und zieht bei Beruehrung
           an. Das ist die einzige Zustandsaenderung des Blocks. */
        .about-team .team-glow {
          position: absolute;
          left: 50%;
          top: 62%;
          width: 150%;
          height: 120%;
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          background: var(--grad);
          opacity: 0.12;
          filter: blur(34px);
          pointer-events: none;
          transition: opacity 0.5s var(--ease-out-expo);
        }

        .about-team .team-member:hover .team-glow {
          opacity: 0.24;
        }

        .about-team .team-initials {
          position: relative;
          font-family: var(--font-display);
          font-size: clamp(44px, 4.4vw, 58px);
          font-weight: 300;
          line-height: 1;
          letter-spacing: -0.03em;
          color: var(--ink);
        }

        .about-team .team-name {
          font-family: var(--font-display);
          font-size: clamp(26px, 2.8vw, 38px);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.018em;
          color: var(--ink);
          margin: 30px 0 0;
        }

        .about-team .team-role {
          margin-top: 12px;
          color: var(--acc-lav);
        }

        .about-team .team-profile {
          margin-top: 18px;
          max-width: 40ch;
        }

        .about-team .team-note {
          margin-top: clamp(40px, 4.5vw, 64px);
          max-width: var(--measure);
        }

        @media (max-width: 720px) {
          .about-team .team-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 34px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-team .team-glow,
          .about-team .team-mark {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
