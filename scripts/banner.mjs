// Generates assets/banner-light.svg and assets/banner-dark.svg for the profile README.
// Motif: a contribution graph whose filled cells trace a growth curve.
import { writeFileSync, mkdirSync } from "node:fs";

const out = process.argv[2];
mkdirSync(`${out}/assets`, { recursive: true });

const W = 1200, H = 360;
const themes = {
  light: {
    bg: "#FFFFFF", border: "#D0D7DE", ink: "#111111", muted: "#6B6F76",
    cells: ["#EBEDF0", "#9BE9A8", "#40C463", "#30A14E", "#216E39"],
  },
  dark: {
    bg: "#0D1117", border: "#30363D", ink: "#F0F3F6", muted: "#8B949E",
    cells: ["#161B22", "#0E4429", "#006D32", "#26A641", "#39D353"],
  },
};

// Deterministic pseudo-random so both themes share one pattern.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const COLS = 22, ROWS = 7, CELL = 12, GAP = 3, STEP = CELL + GAP;
const levels = [];
for (let c = 0; c < COLS; c++) {
  const t = c / (COLS - 1);
  const height = 0.6 + 6.4 * Math.pow(t, 1.9); // rows filled from the bottom
  for (let r = 0; r < ROWS; r++) {
    const fromBottom = ROWS - 1 - r;
    const depth = height - fromBottom; // >0 means under the curve
    let lvl = 0;
    if (depth > 0) lvl = Math.min(4, 1 + Math.floor(depth * 0.9 + rand() * 1.2));
    else if (depth > -1.5 && rand() < 0.35) lvl = 1; // soft edge just above the curve
    levels.push({ c, r, lvl });
  }
}

const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
const mono = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace`;

for (const [name, t] of Object.entries(themes)) {
  const gx = W - 64 - COLS * STEP + GAP;
  const gy = 112;
  const cells = levels
    .map(({ c, r, lvl }) =>
      `<rect x="${gx + c * STEP}" y="${gy + r * STEP}" width="${CELL}" height="${CELL}" rx="2" fill="${t.cells[lvl]}"/>`)
    .join("");

  const pillars = [
    ["Grow", "the numbers"],
    ["Build", "the product"],
    ["Ship", "the tools"],
  ]
    .map(([k, v], i) => {
      const x = 64 + i * 196;
      return `<rect x="${x}" y="283" width="10" height="10" rx="2" fill="${t.cells[3]}"/>` +
        `<text x="${x + 20}" y="293" font-family="${font}" font-size="16" fill="${t.ink}"><tspan font-weight="600">${k}</tspan><tspan fill="${t.muted}"> ${v}</tspan></text>`;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Thinh Nguyen. Growth leader who ships the software behind the growth.">
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="${t.bg}" stroke="${t.border}"/>
<text x="64" y="84" font-family="${mono}" font-size="14" letter-spacing="2" fill="${t.muted}">THINH NGUYEN (DANNY) · HO CHI MINH CITY</text>
<text x="64" y="158" font-family="${font}" font-size="42" font-weight="700" letter-spacing="-0.5" fill="${t.ink}">Growth leader who ships</text>
<text x="64" y="212" font-family="${font}" font-size="42" font-weight="700" letter-spacing="-0.5" fill="${t.ink}">the software behind the growth.</text>
${pillars}
${cells}
<text x="${W - 64}" y="${gy + ROWS * STEP + 22}" text-anchor="end" font-family="${mono}" font-size="12" fill="${t.muted}">commits, shaped like a growth curve</text>
</svg>
`;
  writeFileSync(`${out}/assets/banner-${name}.svg`, svg);
}
console.log("ok");
