/*
 * DIESE KOMPONENTE WIRD SEIT DEM 02.09.2026 NICHT GERENDERT.
 *
 * Grund. Das Formular hat beim Absenden eine Erfolgsmeldung gezeigt,
 * ohne dass die Angaben irgendwohin gegangen waeren. Ein Empfaenger ist
 * bis heute nicht benannt. Eine Bestaetigung ohne Versand ist auf einer
 * Seite, die fuer Zuverlaessigkeit steht, der schwerste Fehler von
 * allen, deshalb hat der Auftraggeber entschieden, das Formular vorerst
 * auszublenden.
 *
 * An seiner Stelle steht unter demselben Anker `#anfrage` die Komponente
 * ContactDirect mit Telefon und E-Mail. Der Bau bleibt hier vollstaendig
 * erhalten, samt Pruefung der Felder und Gestaltung, damit er nur noch
 * an einen Versand gehaengt und in app/kontakt/page.tsx wieder
 * eingesetzt werden muss.
 */

"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { contactPage } from "../../copy";
import { Reveal } from "../system/ui";

const { form } = contactPage;

/** Pflichtfelder in der Reihenfolge, in der sie im Formular stehen. */
const REQUIRED = ["name", "email", "message"] as const;
type RequiredKey = (typeof REQUIRED)[number];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Rückfallhöhe der Karte, falls sich beim Absenden keine Höhe messen lässt.
 * Verhindert, dass die Seite unter der Erfolgsmeldung zusammenklappt.
 */
const CARD_MIN_HEIGHT = 560;

/** Wort, das in der Einwilligungszeile zur Datenschutzerklärung verlinkt wird. */
const CONSENT_LINK_WORD = "Datenschutzerklärung";

/**
 * Setzt die Einwilligungszeile aus copy.ts und verlinkt darin das Wort
 * „Datenschutzerklärung", ohne den Satz selbst zu verändern.
 */
function ConsentLine() {
  const at = form.consent.indexOf(CONSENT_LINK_WORD);
  if (at < 0) return <>{form.consent}</>;

  return (
    <>
      {form.consent.slice(0, at)}
      <Link href="/datenschutz" className="anfrage-consent-link">
        {CONSENT_LINK_WORD}
      </Link>
      {form.consent.slice(at + CONSENT_LINK_WORD.length)}
    </>
  );
}

/** Kleiner Verlaufsring mit Häkchen für die Erfolgsmeldung. */
function SuccessMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="anfrage-ok" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b8cff" />
          <stop offset="0.48" stopColor="#7c6aff" />
          <stop offset="1" stopColor="#b9a5ff" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="21.25" stroke="url(#anfrage-ok)" strokeWidth="1" />
      <path
        d="M15 22.4L20 27.2L29.4 17.4"
        stroke="#b9a5ff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<RequiredKey, string>>>({});
  const [sent, setSent] = useState(false);

  /**
   * Höhe, die die Karte vor dem Absenden hatte. Sie wird beim Umschalten
   * auf die Erfolgsmeldung festgehalten, damit die Seite an dieser Stelle
   * nicht um mehrere hundert Pixel zusammenspringt.
   */
  const cardRef = useRef<HTMLDivElement>(null);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);

  function clearError(key: RequiredKey) {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const next: Partial<Record<RequiredKey, string>> = {};

    if (!read("name")) next.name = form.errors.name;

    const email = read("email");
    if (!email) next.email = form.errors.email;
    else if (!EMAIL.test(email)) next.email = form.errors.emailInvalid;

    if (!read("message")) next.message = form.errors.message;

    setErrors(next);

    const firstBroken = REQUIRED.find((key) => next[key]);
    if (firstBroken) {
      document.getElementById(`anfrage-${firstBroken}`)?.focus();
      return;
    }

    setLockedHeight(Math.max(cardRef.current?.offsetHeight ?? 0, CARD_MIN_HEIGHT));

    // ❗TODO Versand anbinden. Aktuell nur Oberfläche ohne Empfänger.
    setSent(true);
  }

  const fieldProps = (key: RequiredKey) => ({
    id: `anfrage-${key}`,
    name: key,
    required: true,
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? `anfrage-${key}-fehler` : undefined,
    onChange: () => clearError(key),
  });

  return (
    <section className="section contact-form-section" id="anfrage">
      <div className="shell">
        <Reveal>
          <div
            ref={cardRef}
            className={sent ? "anfrage-card is-done" : "anfrage-card"}
            style={sent && lockedHeight ? { minHeight: lockedHeight } : undefined}
          >
            {sent ? (
              <div className="anfrage-done" role="status">
                <SuccessMark />
                <p className="t-body-lg anfrage-done-text">{form.success}</p>
              </div>
            ) : (
              <>
                <h2 className="t-h2">{form.title}</h2>
                <p className="t-body-lg anfrage-intro">{form.body}</p>

                <form onSubmit={handleSubmit} noValidate className="anfrage-form">
                  <div className="anfrage-row">
                    <div className="anfrage-field">
                      <label className="t-label" htmlFor="anfrage-name">
                        {form.fields.name}
                      </label>
                      <input type="text" autoComplete="name" {...fieldProps("name")} />
                      {errors.name ? (
                        <p className="svhError" id="anfrage-name-fehler">
                          {errors.name}
                        </p>
                      ) : null}
                    </div>

                    <div className="anfrage-field">
                      <label className="t-label" htmlFor="anfrage-company">
                        {form.fields.company}
                      </label>
                      <input
                        type="text"
                        id="anfrage-company"
                        name="company"
                        autoComplete="organization"
                      />
                    </div>
                  </div>

                  <div className="anfrage-row">
                    <div className="anfrage-field">
                      <label className="t-label" htmlFor="anfrage-email">
                        {form.fields.email}
                      </label>
                      <input type="email" autoComplete="email" {...fieldProps("email")} />
                      {errors.email ? (
                        <p className="svhError" id="anfrage-email-fehler">
                          {errors.email}
                        </p>
                      ) : null}
                    </div>

                    <div className="anfrage-field">
                      <label className="t-label" htmlFor="anfrage-phone">
                        {form.fields.phone}
                      </label>
                      <input type="tel" id="anfrage-phone" name="phone" autoComplete="tel" />
                    </div>
                  </div>

                  <div className="anfrage-field">
                    <label className="t-label" htmlFor="anfrage-topic">
                      {form.fields.topic}
                    </label>
                    <select id="anfrage-topic" name="topic" defaultValue="">
                      <option value="">{form.selectPlaceholder}</option>
                      {form.topics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="anfrage-field">
                    <label className="t-label" htmlFor="anfrage-message">
                      {form.fields.message}
                    </label>
                    <textarea rows={5} {...fieldProps("message")} />
                    {errors.message ? (
                      <p className="svhError" id="anfrage-message-fehler">
                        {errors.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="anfrage-foot">
                    <button type="submit" className="btn-solid">
                      {form.submit}
                    </button>
                    <p className="anfrage-consent">
                      <ConsentLine />
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </Reveal>
      </div>

      {/*
        Global deklariert, aber durchgehend unter `.contact-form-section`
        gehängt. Nötig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie Reveal weiterreicht.
      */}
      <style jsx global>{`
        /* Die Karte bleibt links bündig zum übrigen Seitenraster, wird aber
           begrenzt, damit die Felder nicht über die volle Shell-Breite laufen. */
        .contact-form-section .anfrage-card {
          max-width: 940px;
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 40px;
        }

        .contact-form-section .anfrage-intro {
          margin-top: 14px;
          max-width: 62ch;
        }

        .contact-form-section .anfrage-form {
          display: flex;
          flex-direction: column;
          gap: 22px;
          margin-top: 38px;
        }

        .contact-form-section .anfrage-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .contact-form-section .anfrage-field {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }

        /* Feldbeschriftungen tragen die t-label-Typografie, stehen aber
           heller als reine Nebenlabels, damit sie sicher lesbar bleiben. */
        .contact-form-section .anfrage-field > label {
          color: var(--ink-2);
        }

        .contact-form-section .anfrage-field input,
        .contact-form-section .anfrage-field select,
        .contact-form-section .anfrage-field textarea {
          width: 100%;
          background: var(--bg-raise);
          border: 1px solid var(--line);
          border-radius: 10px;
          color: var(--ink);
          font-family: var(--font-sans);
          font-size: 15.5px;
          font-weight: 400;
          line-height: 1.5;
          transition:
            border-color 0.3s var(--ease-out-expo),
            box-shadow 0.3s var(--ease-out-expo);
        }

        .contact-form-section .anfrage-field input,
        .contact-form-section .anfrage-field select {
          height: 52px;
          padding: 0 16px;
        }

        .contact-form-section .anfrage-field textarea {
          padding: 15px 16px;
          resize: vertical;
          min-height: 132px;
        }

        .contact-form-section .anfrage-field input::placeholder,
        .contact-form-section .anfrage-field textarea::placeholder {
          color: var(--ink-3);
        }

        /* Eigener Pfeil, damit die Auswahl im dunklen Grund nicht auffällt.
           color-scheme sorgt dafür, dass auch die aufgeklappte Liste dunkel bleibt. */
        .contact-form-section .anfrage-field select {
          appearance: none;
          -webkit-appearance: none;
          color-scheme: dark;
          padding-right: 44px;
          background-image: linear-gradient(45deg, transparent 50%, var(--ink-2) 50%),
            linear-gradient(135deg, var(--ink-2) 50%, transparent 50%);
          background-position:
            calc(100% - 22px) 24px,
            calc(100% - 17px) 24px;
          background-size:
            5px 5px,
            5px 5px;
          background-repeat: no-repeat;
        }

        .contact-form-section .anfrage-field input:focus,
        .contact-form-section .anfrage-field select:focus,
        .contact-form-section .anfrage-field textarea:focus {
          outline: none;
          border-color: var(--acc-violet);
          box-shadow: 0 0 0 4px rgba(124, 106, 255, 0.25);
        }

        .contact-form-section .anfrage-field [aria-invalid="true"] {
          border-color: rgba(255, 138, 138, 0.55);
        }

        .contact-form-section .svhError {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
          color: rgba(255, 138, 138, 0.9);
        }

        .contact-form-section .anfrage-foot {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px 26px;
          margin-top: 10px;
        }

        .contact-form-section .anfrage-consent {
          margin: 0;
          max-width: 52ch;
          font-size: 13px;
          line-height: 1.5;
          color: var(--ink-3);
        }

        .contact-form-section .anfrage-consent-link {
          color: var(--ink-2);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--line);
          transition: color 0.3s var(--ease-out-expo);
        }

        .contact-form-section .anfrage-consent-link:hover {
          color: var(--ink);
          text-decoration-color: currentColor;
        }

        /* Nach dem Absenden hält die Karte die Höhe, die sie vorher hatte
           (Inline-Stil aus der Messung). Die Meldung steht darin mittig. */
        .contact-form-section .anfrage-card.is-done {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .contact-form-section .anfrage-done {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-block: 26px;
        }

        .contact-form-section .anfrage-done-text {
          max-width: 46ch;
          color: var(--ink);
        }

        @media (max-width: 720px) {
          .contact-form-section .anfrage-card {
            padding: 28px 22px 32px;
          }

          .contact-form-section .anfrage-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 22px;
          }

          .contact-form-section .anfrage-form {
            margin-top: 28px;
          }
        }
      `}</style>
    </section>
  );
}
