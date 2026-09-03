"use client";

import { aboutPage } from "../../copy";
import { Reveal, RevealGroup, RevealItem, SplitHeadline } from "../system/ui";

/* ------------------------------------------------------------------ */
/*  /ueber-uns · Die beiden Gruender                                   */
/*                                                                     */
/*  Ueberschrift, der Satz zu Zangberg, darunter die beiden Namen mit  */
/*  Rolle in einer Reihe unter einer Haarlinie. Mehr steht hier nicht, */
/*  solange die Kurzprofile und die Bilder fehlen.                     */
/*                                                                     */
/*  Bis zum 03.09.2026 trug jeder Name eine Kachel mit seinen          */
/*  Initialen und einem Schimmer dahinter. Der Pruefbericht hat die    */
/*  leeren Kacheln als Platzhalter gelesen, und genau das soll die     */
/*  Seite nicht zeigen. Sobald die Profile kommen, bekommt der Block   */
/*  seine Bilder; bis dahin tragen die Namen allein.                   */
/*                                                                     */
/*  Die Kurzprofile liegen noch nicht vor. Fuer den Livegang gilt die  */
/*  Entscheidung, dass kein Platzhalter sichtbar wird. Eine Zeile, die */
/*  mit der Markierung beginnt, wird deshalb gar nicht ausgegeben. In  */
/*  copy.ts bleibt die Markierung stehen, damit die Luecke spaeter     */
/*  gefuellt wird. Erscheint ein Profil, steht es als Absatz unter     */
/*  Name und Rolle.                                                    */
/* ------------------------------------------------------------------ */

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

        <Reveal delay={0.08}>
          <p className="t-body-lg team-note">{aboutPage.team.note}</p>
        </Reveal>

        <RevealGroup as="ul" className="team-row">
          {aboutPage.team.members.map((member) => {
            const profile = published(member.body);

            return (
              <RevealItem as="li" key={member.name} className="team-member">
                <h3 className="team-name">{member.name}</h3>
                <p className="t-label team-role">{member.role}</p>
                {profile ? <p className="t-body team-profile">{profile}</p> : null}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.about-team` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie `RevealGroup` weiterreicht.
      */}
      <style jsx global>{`
        .about-team .team-title {
          max-width: 14ch;
        }

        .about-team .team-note {
          margin-top: clamp(24px, 3vw, 36px);
          max-width: var(--measure);
        }

        /* Zwei Namen fuellen keine Schale von 2240 Bildpunkten. Die Reihe
           bleibt deshalb schmal und steht als Block links, statt sich
           ueber die ganze Breite zu verlieren. */
        .about-team .team-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(32px, 5vw, 72px);
          max-width: 840px;
          margin: clamp(40px, 5vw, 64px) 0 0;
          padding: 30px 0 0;
          border-top: 1px solid var(--line);
          list-style: none;
        }

        .about-team .team-name {
          font-family: var(--font-display);
          font-size: clamp(26px, 2.8vw, 38px);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.018em;
          color: var(--ink);
          margin: 0;
        }

        .about-team .team-role {
          margin-top: 12px;
          color: var(--acc-lav);
        }

        .about-team .team-profile {
          margin-top: 18px;
          max-width: 40ch;
        }

        /* Auf dem Telefon stehen die Namen untereinander, und jeder ab
           dem zweiten bekommt seine eigene Haarlinie darueber. */
        @media (max-width: 720px) {
          .about-team .team-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 26px;
          }

          .about-team .team-member + .team-member {
            padding-top: 26px;
            border-top: 1px solid var(--line);
          }
        }
      `}</style>
    </section>
  );
}
