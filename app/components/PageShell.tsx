import type { ReactNode } from "react";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";

/** Rahmen für alle Unterseiten: Navigation oben, Footer unten. */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
