# Bild-Assets (`public/img/`)

Alle Bilder wurden mit kie.ai / GPT Image 2 erzeugt (Script: `_ref/gen-images.mjs`)
und anschließend auf webtaugliche Größen reduziert.

| Datei | Verwendung | Format |
|---|---|---|
| `hero-geometry.png` | Hero, Hintergrundgrafik rechts (Glas-Chevron-Formation) | 4:3, 1800px |
| `showcase.png` | Showcase-Panel unter der Impact-Sektion | 16:9, 1920px |
| `testimonial-media.png` | Media-Fläche im Testimonial-Slider | 16:9, 1600px |
| `audience-bg.png` | Hintergrund „Mit wem wir zusammenarbeiten" | 21:9, 2200px |
| `cta-pattern.png` | Hintergrund der Abschluss-CTA-Fläche | 21:9, 2200px |
| `newsletter-book.png` | Buch-Mockup im Newsletter-Panel | 4:3, 1200px |
| `resource-feature.png` | großes Feature-Panel in „Ressourcen" | 16:9, 1400px |
| `resource-1.png` … `resource-3.png` | Karten in „Ressourcen" | 16:9, 1000px |
| `og.png` | Open-Graph-Vorschaubild | 16:9, 1200px |

Neu erzeugen: `node _ref/gen-images.mjs [namensfilter]`
(vorhandene Dateien werden übersprungen — zum Neubauen erst löschen).
Danach Größen reduzieren, sonst werden die Dateien mehrere MB groß.

## Was bewusst NICHT als Bild existiert

- **Logo** — liegt als Inline-SVG in `app/components/Logo.tsx`, damit es in beiden
  Varianten (hell/dunkel) scharf bleibt und animierbar ist.
- **Alle UI-Mockups in den Leistungs- und Prozesskarten** — sind echtes, animiertes
  DOM/SVG, keine Bilder. Das entspricht der Referenz und bleibt gestochen scharf.
- **Kundenlogos / Presselogos** — es gibt keine. Statt erfundener Marken zeigt die Seite
  unter „Womit wir arbeiten" die tatsächlich eingesetzten Werkzeuge als Wortmarken.
