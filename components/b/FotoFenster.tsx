import Image from "next/image";

/* Bildfenster für ein Foto von Lukas und Jannik. Ohne Foto (src leer) steht nur das SvH-Logo auf dunklem Grund,
   wie beim Workshop-Bild (Lukas, 13.10.2026: kein „Foto folgt“). Größe bestimmt der Rahmen (CSS). */
export default function FotoFenster({ src, alt, className = "", sizes = "(max-width: 899px) 100vw, 480px" }: { src: string; alt: string; className?: string; sizes?: string }) {
  return (
    <figure className={`ff ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} />
      ) : (
        <div className="ff-platzhalter" aria-hidden="true">
          <Image src="/logo/svh-bild-480.webp" alt="" width={96} height={156} />
        </div>
      )}
    </figure>
  );
}
