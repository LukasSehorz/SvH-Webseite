/**
 * Sammelstelle der kleinen Szenen.
 *
 * Die Kachelszenen und die Schrittszenen liegen in eigenen Dateien,
 * weil sie in unterschiedlichen Feldern und auf unterschiedlichen
 * Gruenden spielen. Gemeinsames wie Takt, Rampe und Nebel steht in
 * `kit.tsx`. Diese Datei haelt nur die eine Anlaufstelle, damit die
 * beiden Sektionen nicht wissen muessen, wo welche Szene wohnt.
 */
export { TileScene, tileTotal, type TileId } from "./TileScenes";
export { StepScene, stepTotal, STEP_IDS, type StepId } from "./StepScenes";
export { useReplay } from "./kit";
