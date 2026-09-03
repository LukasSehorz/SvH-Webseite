/*
 * Die Seite fuer eine Adresse, die es nicht gibt.
 *
 * Bis zum 03.09.2026 stand hier die nackte Vorgabe von Next, weisz auf
 * weisz und ohne Leiste. Diese Fassung traegt Leiste, Fusszeile und die
 * Handschrift der uebrigen Seite, sagt in einem Satz, was passiert ist,
 * und bietet zwei Wege zurueck. Sie ist bewusst kurz, denn wer hier
 * landet, will weiter und nicht lesen.
 */

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "./components/system/Navbar";
import Footer from "./components/system/Footer";
import { SplitHeadline } from "./components/system/ui";
import { notFoundPage } from "./copy";

export const metadata: Metadata = {
  title: notFoundPage.meta.title,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main>
        <section className="subpage-head not-found">
          <span className="not-found-fog" aria-hidden="true" />

          <div className="shell not-found-inner">
            <p className="t-label">{notFoundPage.label}</p>

            <SplitHeadline
              as="h1"
              className="t-display subpage-title not-found-title"
              before={notFoundPage.titleBefore}
              word={notFoundPage.gradientWord}
              after={notFoundPage.titleAfter}
            />

            <p className="t-body-lg subpage-lead not-found-lead">
              {notFoundPage.lead}
            </p>

            <div className="not-found-actions">
              <Link href={notFoundPage.primary.href} className="btn-solid">
                {notFoundPage.primary.label}
              </Link>
              <Link href={notFoundPage.secondary.href} className="btn-dash">
                {notFoundPage.secondary.label}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
