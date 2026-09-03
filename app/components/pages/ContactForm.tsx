/*
 * Das Kontaktformular unter dem Anker `#anfrage`.
 *
 * Es war vom 02.09.2026 bis zum 03.09.2026 ausgeblendet, weil kein
 * Empfaenger feststand und eine Erfolgsmeldung ohne Versand auf einer
 * Seite, die fuer Zuverlaessigkeit steht, der schwerste Fehler von allen
 * waere. Seit der Auftraggeber die Adresse genannt hat, schickt das
 * Formular jede Anfrage an app/api/anfrage, und von dort geht sie per
 * Resend an die Adresse aus content.ts.
 *
 * Solange beim Hoster kein Schluessel hinterlegt ist, antwortet der
 * Versand mit dem Grund kein-versand. Dann oeffnet das Formular das
 * E-Mail-Programm des Besuchers mit der fertigen Nachricht und sagt ihm,
 * dass er sie nur noch abschicken muss. So steht nie eine Bestaetigung,
 * hinter der nichts passiert ist.
 */

"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { contactPage } from "../../copy";
import { company } from "../../content";
import { betreff, textFassung, type Anfrage } from "../../api/anfrage/format";
import { Reveal } from "../system/ui";

const { form } = contactPage;

/** Pflichtfelder in der Reihenfolge, in der sie im Formular stehen. */
const REQUIRED = ["name", "email", "message"] as const;
type RequiredKey = (typeof REQUIRED)[number];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Rueckfallhoehe der Karte, falls sich beim Absenden keine Hoehe messen
 * laesst. Verhindert, dass die Seite unter der Meldung zusammenklappt.
 */
const CARD_MIN_HEIGHT = 560;

/** Wort, das in der Einwilligungszeile zur Datenschutzerklaerung verlinkt wird. */
const CONSENT_LINK_WORD = "Datenschutzerklärung";

type Status = "idle" | "sending" | "done" | "fallback" | "failure";

type Eingabe = Anfrage & { website: string };

/**
 * Setzt die Einwilligungszeile aus copy.ts und verlinkt darin das Wort
 * Datenschutzerklaerung, ohne den Satz selbst zu veraendern.
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

/** Kleiner Verlaufsring mit Haekchen fuer die Erfolgsmeldung. */
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

/** Verlaufsring mit Briefumschlag fuer den Weg ueber das E-Mail-Programm. */
function MailMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="anfrage-mail" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b8cff" />
          <stop offset="0.48" stopColor="#7c6aff" />
          <stop offset="1" stopColor="#b9a5ff" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="21.25" stroke="url(#anfrage-mail)" strokeWidth="1" />
      <rect x="13" y="16" width="18" height="12.4" rx="2.4" stroke="#b9a5ff" strokeWidth="1.4" />
      <path d="M13.8 17.4 22 23.6l8.2-6.2" stroke="#b9a5ff" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Die Nachricht als mailto-Adresse, wenn der Versand ueber die Seite nicht
 * eingerichtet ist. Betreff und Text kommen aus derselben Formatierung wie
 * die Mail des Route Handlers, damit die Anfrage auf beiden Wegen gleich
 * ankommt.
 */
function mailtoAdresse(eingabe: Eingabe): string {
  const subject = encodeURIComponent(betreff(eingabe));
  const body = encodeURIComponent(textFassung(eingabe));
  return `mailto:${company.email}?subject=${subject}&body=${body}`;
}

export default function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<RequiredKey, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [mailto, setMailto] = useState<string | null>(null);

  /**
   * Hoehe, die die Karte vor dem Absenden hatte. Sie wird beim Umschalten
   * auf die Meldung festgehalten, damit die Seite an dieser Stelle nicht
   * um mehrere hundert Bildpunkte zusammenspringt.
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

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

    const eingabe: Eingabe = {
      name: read("name"),
      company: read("company"),
      industry: read("industry"),
      employees: read("employees"),
      email,
      phone: read("phone"),
      topic: read("topic"),
      message: read("message"),
      website: read("website"),
    };

    setStatus("sending");

    let ergebnis: Status = "failure";
    try {
      const antwort = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eingabe),
      });
      if (antwort.ok) {
        ergebnis = "done";
      } else if (antwort.status === 503) {
        ergebnis = "fallback";
      }
    } catch {
      ergebnis = "failure";
    }

    setLockedHeight(Math.max(cardRef.current?.offsetHeight ?? 0, CARD_MIN_HEIGHT));

    if (ergebnis === "fallback") {
      const adresse = mailtoAdresse(eingabe);
      setMailto(adresse);
      window.location.href = adresse;
    }

    setStatus(ergebnis);
  }

  const fieldProps = (key: RequiredKey) => ({
    id: `anfrage-${key}`,
    name: key,
    required: true,
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? `anfrage-${key}-fehler` : undefined,
    onChange: () => clearError(key),
  });

  const fertig = status === "done" || status === "fallback" || status === "failure";

  return (
    <div className="contact-form" id="anfrage">
      <Reveal>
        <div
          ref={cardRef}
          className={fertig ? "anfrage-card is-done" : "anfrage-card"}
          style={fertig && lockedHeight ? { minHeight: lockedHeight } : undefined}
        >
          {status === "done" ? (
            <div className="anfrage-done" role="status">
              <SuccessMark />
              <p className="t-body-lg anfrage-done-text">{form.success}</p>
            </div>
          ) : status === "fallback" ? (
            <div className="anfrage-done" role="status">
              <MailMark />
              <p className="t-body-lg anfrage-done-text">{form.fallback}</p>
              {/* Falls sich kein E-Mail-Programm oeffnet, bleibt der Weg
                  als Verweis stehen. */}
              <a href={mailto ?? `mailto:${company.email}`} className="anfrage-note-link">
                {company.email}
              </a>
            </div>
          ) : status === "failure" ? (
            <div className="anfrage-done" role="status">
              <MailMark />
              <p className="t-body-lg anfrage-done-text">
                {form.failure}{" "}
                <a href={`mailto:${company.email}`} className="anfrage-note-link">
                  {company.email}
                </a>
                .
              </p>
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
                    <label className="t-label" htmlFor="anfrage-industry">
                      {form.fields.industry}
                    </label>
                    <input
                      type="text"
                      id="anfrage-industry"
                      name="industry"
                      autoComplete="organization-title"
                    />
                  </div>

                  <div className="anfrage-field">
                    <label className="t-label" htmlFor="anfrage-employees">
                      {form.fields.employees}
                    </label>
                    <select id="anfrage-employees" name="employees" defaultValue="">
                      <option value="">{form.selectPlaceholder}</option>
                      {form.employeeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
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

                {/* Die Falle fuer Programme, die jedes Feld ausfuellen. Fuer
                    Menschen ist sie unsichtbar und nicht erreichbar, der
                    Versand verwirft alles, was hier steht. */}
                <div className="anfrage-falle" aria-hidden="true">
                  <label htmlFor="anfrage-website">Webseite</label>
                  <input type="text" id="anfrage-website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="anfrage-foot">
                  <button type="submit" className="btn-solid" disabled={status === "sending"}>
                    {status === "sending" ? form.sending : form.submit}
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

      {/*
        Global deklariert, aber durchgehend unter `.contact-form` gehaengt.
        Noetig, weil styled-jsx seine Scope-Klasse nicht an eigene
        Komponenten wie Reveal weiterreicht.
      */}
      <style jsx global>{`
        /* Der Sprung vom Knopf der Wege-Karte landet unter der Leiste und
           nicht dahinter. */
        .contact-form {
          scroll-margin-top: calc(var(--nav-h) + 24px);
        }

        /* Die Karte bleibt links buendig zum uebrigen Seitenraster, wird
           aber begrenzt, damit die Felder nicht ueber die volle Schale
           laufen. Im zweispaltigen Raster ab 1280 fuellt sie ihre Spalte. */
        .contact-form .anfrage-card {
          max-width: 940px;
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 40px;
          background: linear-gradient(180deg, rgba(244, 244, 246, 0.03), transparent 60%);
        }

        .contact-form .anfrage-intro {
          margin-top: 14px;
          max-width: 62ch;
        }

        .contact-form .anfrage-form {
          display: flex;
          flex-direction: column;
          gap: 22px;
          margin-top: 38px;
        }

        .contact-form .anfrage-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .contact-form .anfrage-field {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }

        /* Feldbeschriftungen tragen die t-label-Typografie, stehen aber
           heller als reine Nebenlabels, damit sie sicher lesbar bleiben. */
        .contact-form .anfrage-field > label {
          color: var(--ink-2);
        }

        .contact-form .anfrage-field input,
        .contact-form .anfrage-field select,
        .contact-form .anfrage-field textarea {
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

        .contact-form .anfrage-field input,
        .contact-form .anfrage-field select {
          height: 52px;
          padding: 0 16px;
        }

        .contact-form .anfrage-field textarea {
          padding: 15px 16px;
          resize: vertical;
          min-height: 132px;
        }

        .contact-form .anfrage-field input::placeholder,
        .contact-form .anfrage-field textarea::placeholder {
          color: var(--ink-3);
        }

        /* Eigener Pfeil, damit die Auswahl im dunklen Grund nicht auffaellt.
           color-scheme sorgt dafuer, dass auch die aufgeklappte Liste
           dunkel bleibt. */
        .contact-form .anfrage-field select {
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

        .contact-form .anfrage-field input:focus,
        .contact-form .anfrage-field select:focus,
        .contact-form .anfrage-field textarea:focus {
          outline: none;
          border-color: var(--acc-violet);
          box-shadow: 0 0 0 4px rgba(124, 106, 255, 0.25);
        }

        .contact-form .anfrage-field [aria-invalid="true"] {
          border-color: rgba(255, 138, 138, 0.55);
        }

        .contact-form .svhError {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
          color: rgba(255, 138, 138, 0.9);
        }

        /* Die Falle liegt ausserhalb des Bildes und nicht auf display none,
           denn manche Programme lassen verborgene Felder aus. */
        .contact-form .anfrage-falle {
          position: absolute;
          left: -9999px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .contact-form .anfrage-foot {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px 26px;
          margin-top: 10px;
        }

        .contact-form .btn-solid[disabled] {
          opacity: 0.7;
          cursor: wait;
        }

        .contact-form .anfrage-consent {
          margin: 0;
          max-width: 52ch;
          font-size: 13px;
          line-height: 1.5;
          color: var(--ink-3);
        }

        .contact-form .anfrage-consent-link,
        .contact-form .anfrage-note-link {
          color: var(--ink-2);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--line);
          transition: color 0.3s var(--ease-out-expo);
        }

        .contact-form .anfrage-consent-link:hover,
        .contact-form .anfrage-note-link:hover {
          color: var(--ink);
          text-decoration-color: currentColor;
        }

        .contact-form .anfrage-note-link {
          font-family: var(--font-display);
          font-size: clamp(20px, 1.6vw, 26px);
          font-weight: 300;
          letter-spacing: -0.012em;
          overflow-wrap: anywhere;
        }

        /* Nach dem Absenden haelt die Karte die Hoehe, die sie vorher hatte
           (Inline-Stil aus der Messung). Die Meldung steht darin mittig. */
        .contact-form .anfrage-card.is-done {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .contact-form .anfrage-done {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
          padding-block: 26px;
        }

        .contact-form .anfrage-done-text {
          max-width: 46ch;
          color: var(--ink);
        }

        @media (min-width: 1280px) {
          .contact-form .anfrage-card {
            max-width: none;
            padding: clamp(40px, 3vw, 56px);
          }
        }

        @media (max-width: 720px) {
          .contact-form .anfrage-card {
            padding: 28px 22px 32px;
          }

          .contact-form .anfrage-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 22px;
          }

          .contact-form .anfrage-form {
            margin-top: 28px;
          }
        }
      `}</style>
    </div>
  );
}
