import Image from "next/image";

/* Bildfenster für ein Foto von Lukas und Jannik. Ohne Foto (src leer) steht ein gestalteter Platzhalter:
   zwei Silhouetten im Markenverlauf, darunter die Namen und „Foto folgt“. Größe bestimmt der Rahmen (CSS). */
export default function FotoFenster({ src, alt, hinweis, className = "", sizes = "(max-width: 899px) 100vw, 480px" }: { src: string; alt: string; hinweis: string; className?: string; sizes?: string }) {
  return (
    <figure className={`ff ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} />
      ) : (
        <div className="ff-platzhalter" role="img" aria-label={`${alt} (${hinweis})`}>
          <svg className="ff-personen" viewBox="0 0 200 120" aria-hidden="true">
            <defs>
              <linearGradient id="ff-verlauf" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5b86ff" />
                <stop offset="1" stopColor="#a58bff" />
              </linearGradient>
            </defs>
            <g fill="url(#ff-verlauf)" opacity="0.9">
              <circle cx="72" cy="40" r="19" />
              <path d="M36 120c0-26 16-44 36-44s36 18 36 44z" />
              <circle cx="128" cy="44" r="18" opacity="0.75" />
              <path d="M94 120c0-24 15-41 34-41s34 17 34 41z" opacity="0.75" />
            </g>
          </svg>
          <span className="ff-namen">Lukas Sehorz &amp; Jannik vom Hofe</span>
          <span className="ff-hinweis">{hinweis}</span>
        </div>
      )}
    </figure>
  );
}
