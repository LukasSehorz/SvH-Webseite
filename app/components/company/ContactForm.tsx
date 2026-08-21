"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState, type FormEvent } from "react";
import { CheckIcon, EASE, useSafeReducedMotion } from "../ui";

type Fields = {
  name: string;
  company: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
};

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Anfrageformular der Kontaktseite.
 *
 * ❗TODO: Versand anbinden (z. B. Formspree, Resend oder eigene API-Route).
 *         Aktuell nur Oberfläche.
 */
export default function ContactForm({
  title,
  body,
  fields,
  topics,
  consent,
  submit,
  success,
}: {
  title: string;
  body: string;
  fields: Fields;
  topics: string[];
  consent: string;
  submit: string;
  success: string;
}) {
  const reduce = useSafeReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (key: string) => `${uid}-${key}`;

  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function validate(v: typeof values): Errors {
    const e: Errors = {};
    if (!v.name.trim()) e.name = "Bitte geben Sie Ihren Namen an.";
    if (!v.email.trim()) e.email = "Bitte geben Sie Ihre E-Mail-Adresse an.";
    else if (!EMAIL_RE.test(v.email.trim()))
      e.email = "Diese E-Mail-Adresse sieht nicht vollständig aus.";
    if (!v.message.trim()) e.message = "Bitte schreiben Sie uns kurz, worum es geht.";
    return e;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = document.getElementById(id(Object.keys(found)[0]!));
      first?.focus();
      return;
    }
    // ❗TODO: Versand anbinden (z. B. Formspree, Resend oder eigene API-Route). Aktuell nur Oberfläche.
    setSent(true);
  }

  const err = (key: keyof Errors) => errors[key];

  // Das Wort „Datenschutzerklärung" im Hinweistext wird verlinkt.
  const LINK_WORD = "Datenschutzerklärung";
  const cut = consent.indexOf(LINK_WORD);
  const consentBefore = cut >= 0 ? consent.slice(0, cut) : `${consent} `;
  const consentAfter = cut >= 0 ? consent.slice(cut + LINK_WORD.length) : ".";

  return (
    <section className="section" style={{ paddingTop: 0 }} aria-labelledby={id("title")}>
      <div className="shell">
        <style>{`
          .svhField {
            width: 100%;
            height: 56px;
            padding: 0 16px;
            border-radius: 12px;
            border: 1px solid rgba(0,26,35,.12);
            background: #fff;
            color: var(--color-ink);
            font: inherit;
            font-size: 16px;
            transition: border-color .2s var(--ease-out-expo), box-shadow .2s var(--ease-out-expo);
          }
          textarea.svhField { height: auto; padding: 14px 16px; line-height: 1.5; resize: vertical; }
          select.svhField {
            appearance: none;
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' fill='none'%3E%3Cpath d='M1 1.5 7 7.5l6-6' stroke='%234b585d' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 18px center;
            padding-right: 46px;
          }
          .svhField::placeholder { color: #9aa7ad; }
          .svhField:focus {
            outline: none;
            border-color: var(--color-brand);
            box-shadow: 0 0 0 4px rgba(0,146,212,.16);
          }
          .svhField[aria-invalid="true"] {
            border-color: #c2384a;
            box-shadow: 0 0 0 4px rgba(194,56,74,.12);
          }
          .svhLabel {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: var(--color-ink);
            margin-bottom: 8px;
          }
          .svhError { color: #a72f40; font-size: 13px; margin-top: 6px; }
        `}</style>

        <div
          id="anfrage"
          className="mx-auto"
          style={{
            scrollMarginTop: 110,
            borderRadius: 28,
            border: "1px solid var(--color-tint-1)",
            background: "#fff",
            padding: "clamp(24px, 4vw, 48px)",
            boxShadow: "0 24px 60px -40px rgba(0,146,212,.5)",
          }}
        >
          <h2 className="t-h2" id={id("title")}>
            {title}
          </h2>
          <p className="t-body" style={{ marginTop: 14, maxWidth: 640 }}>
            {body}
          </p>

          <AnimatePresence initial={false} mode="wait">
            {sent ? (
              <motion.div
                key="success"
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{
                  marginTop: 32,
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  borderRadius: 16,
                  padding: 24,
                  background: "var(--color-tint-3)",
                  border: "1px solid var(--color-tint-1)",
                }}
              >
                <span style={{ color: "var(--color-brand)", flex: "none", marginTop: 2 }}>
                  <CheckIcon size={24} />
                </span>
                <p style={{ fontSize: 17, lineHeight: 1.5 }}>{success}</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={handleSubmit}
                initial={false}
                exit={{ opacity: 0 }}
                style={{ marginTop: 32 }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="svhLabel" htmlFor={id("name")}>
                      {fields.name} *
                    </label>
                    <input
                      className="svhField"
                      id={id("name")}
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      aria-invalid={err("name") ? true : undefined}
                      aria-describedby={err("name") ? id("name-error") : undefined}
                      value={values.name}
                      onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    />
                    {err("name") && (
                      <p className="svhError" id={id("name-error")}>
                        {err("name")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="svhLabel" htmlFor={id("company")}>
                      {fields.company}
                    </label>
                    <input
                      className="svhField"
                      id={id("company")}
                      name="company"
                      type="text"
                      autoComplete="organization"
                    />
                  </div>

                  <div>
                    <label className="svhLabel" htmlFor={id("email")}>
                      {fields.email} *
                    </label>
                    <input
                      className="svhField"
                      id={id("email")}
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-invalid={err("email") ? true : undefined}
                      aria-describedby={err("email") ? id("email-error") : undefined}
                      value={values.email}
                      onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                    />
                    {err("email") && (
                      <p className="svhError" id={id("email-error")}>
                        {err("email")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="svhLabel" htmlFor={id("phone")}>
                      {fields.phone}
                    </label>
                    <input
                      className="svhField"
                      id={id("phone")}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="svhLabel" htmlFor={id("topic")}>
                      {fields.topic}
                    </label>
                    <select className="svhField" id={id("topic")} name="topic" defaultValue={topics[0]}>
                      {topics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="svhLabel" htmlFor={id("message")}>
                      {fields.message} *
                    </label>
                    <textarea
                      className="svhField"
                      id={id("message")}
                      name="message"
                      rows={5}
                      required
                      aria-invalid={err("message") ? true : undefined}
                      aria-describedby={err("message") ? id("message-error") : undefined}
                      value={values.message}
                      onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                    />
                    {err("message") && (
                      <p className="svhError" id={id("message-error")}>
                        {err("message")}
                      </p>
                    )}
                  </div>
                </div>

                <p style={{ marginTop: 24, fontSize: 13, lineHeight: 1.5, color: "var(--color-muted)", maxWidth: 620 }}>
                  {consentBefore}
                  <a
                    href="/datenschutz"
                    style={{ color: "var(--color-brand-deep)", textDecoration: "underline" }}
                  >
                    Datenschutzerklärung
                  </a>
                  {consentAfter}
                </p>

                <button type="submit" className="btn btn-dark" style={{ marginTop: 24 }}>
                  {submit}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
