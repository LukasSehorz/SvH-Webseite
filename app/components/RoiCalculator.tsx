"use client";

import { useState } from "react";
import { roi } from "../content";
import { Reveal, SmoothNumber } from "./ui";

/* Stabile Formatierer (SmoothNumber vergleicht die Funktions-Referenz). */
const fmtInt = (n: number) => Math.round(n).toLocaleString("de-DE");

const SLIDER_CSS = `
.svh-range{
  -webkit-appearance:none;appearance:none;
  width:100%;height:18px;background:transparent;cursor:pointer;display:block;
}
.svh-range::-webkit-slider-runnable-track{
  height:4px;border-radius:999px;background:var(--svh-track);
}
.svh-range::-moz-range-track{
  height:4px;border-radius:999px;background:#E3E7E9;
}
.svh-range::-moz-range-progress{
  height:4px;border-radius:999px;background:var(--color-ink);
}
.svh-range::-webkit-slider-thumb{
  -webkit-appearance:none;appearance:none;
  width:18px;height:18px;border-radius:999px;background:var(--color-ink);
  border:0;margin-top:-7px;
  transition:transform .18s var(--ease-out-expo),box-shadow .18s var(--ease-out-expo);
}
.svh-range::-moz-range-thumb{
  width:18px;height:18px;border-radius:999px;background:var(--color-ink);
  border:0;
}
.svh-range:hover::-webkit-slider-thumb{transform:scale(1.12)}
.svh-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 4px rgba(0,146,212,.28)}
@media (prefers-reduced-motion: reduce){
  .svh-range::-webkit-slider-thumb{transition:none}
}
`;

function Slider({
  id,
  label,
  hint,
  prefix,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  prefix?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-6">
        <label
          htmlFor={id}
          style={{ fontSize: 18, fontWeight: 500, color: "var(--color-ink)", lineHeight: 1.35 }}
        >
          {label}
        </label>
        <span
          className="flex shrink-0 items-baseline gap-2 tabular-nums"
          style={{ fontSize: 18, fontWeight: 500, color: "var(--color-ink)" }}
        >
          {prefix && <span aria-hidden>{prefix}</span>}
          <span>{value.toLocaleString("de-DE")}</span>
        </span>
      </div>

      {hint && (
        <p className="mt-1" style={{ fontSize: 15, color: "var(--color-muted)", lineHeight: 1.45 }}>
          {hint}
        </p>
      )}

      <input
        id={id}
        className="svh-range mt-3"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={prefix ? `${prefix} ${value}` : String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={
          {
            "--svh-track": `linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) ${pct}%, #E3E7E9 ${pct}%, #E3E7E9 100%)`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

export default function RoiCalculator() {
  const [team, setTeam] = useState(roi.fields.team.initial);
  const [hours, setHours] = useState(roi.fields.hours.initial);
  const [rate, setRate] = useState(roi.fields.rate.initial);

  const monthlyHours = team * hours * 4.33;
  const monthlyCost = monthlyHours * rate;
  const savings = monthlyCost * roi.savingsRate;
  const savingsPercent = Math.round(roi.savingsRate * 100);

  return (
    <section id="rechner" className="section">
      <style>{SLIDER_CSS}</style>

      <div className="shell">
        <Reveal className="text-center">
          <p className="t-eyebrow" style={{ color: "var(--color-ink)" }}>
            {roi.eyebrow}
          </p>
          <h2 className="t-h2 mx-auto mt-5" style={{ maxWidth: 900 }}>
            {roi.title}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mx-auto mt-12"
            style={{
              maxWidth: 840,
              background: "#F5F7F8",
              borderRadius: 20,
              padding: "clamp(24px,3.4vw,40px)",
            }}
          >
            <div className="flex flex-col gap-9">
              <Slider
                id="roi-team"
                label={roi.fields.team.label}
                value={team}
                min={roi.fields.team.min}
                max={roi.fields.team.max}
                step={roi.fields.team.step}
                onChange={setTeam}
              />
              <Slider
                id="roi-hours"
                label={roi.fields.hours.label}
                hint={roi.fields.hours.hint}
                value={hours}
                min={roi.fields.hours.min}
                max={roi.fields.hours.max}
                step={roi.fields.hours.step}
                onChange={setHours}
              />
              <Slider
                id="roi-rate"
                label={roi.fields.rate.label}
                prefix="€"
                value={rate}
                min={roi.fields.rate.min}
                max={roi.fields.rate.max}
                step={roi.fields.rate.step}
                onChange={setRate}
              />
            </div>

            <div
              className="mt-10 flex flex-col gap-3"
              data-roi-result
              style={{ fontSize: 17, lineHeight: 1.55, color: "var(--color-muted)" }}
              aria-live="polite"
            >
              <p>
                Sie verlieren rund{" "}
                <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>
                  <SmoothNumber value={monthlyHours} format={fmtInt} /> Stunden/Monat
                </strong>{" "}
                an wiederkehrenden Aufgaben. Das entspricht{" "}
                <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>
                  <SmoothNumber value={monthlyCost} format={fmtInt} /> €/Monat
                </strong>{" "}
                an Zeitkosten.
              </p>
              <p>
                Wir können Ihren Aufwand um bis zu {savingsPercent} % senken – das sind rund{" "}
                <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>
                  <SmoothNumber value={savings} format={fmtInt} /> €/Monat
                </strong>
                .
              </p>
            </div>

            <a
              href={roi.cta.href}
              className="btn btn-dark mt-8"
              style={{ width: "100%", borderRadius: 8 }}
            >
              {roi.cta.label}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
