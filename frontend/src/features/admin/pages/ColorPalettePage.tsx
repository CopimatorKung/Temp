import { useEffect, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

// ─── Color math ───────────────────────────────────────────────────────────────

function hslToRgb(hslStr: string): [number, number, number] {
  const parts = hslStr.trim().split(/\s+/);
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function blendOnto(
  fg: [number, number, number],
  alpha: number,
  bg: [number, number, number]
): [number, number, number] {
  return [
    Math.round(alpha * fg[0] + (1 - alpha) * bg[0]),
    Math.round(alpha * fg[1] + (1 - alpha) * bg[1]),
    Math.round(alpha * fg[2] + (1 - alpha) * bg[2]),
  ];
}

function toHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0").toUpperCase()).join("");
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return [r, g, b]
    .map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    })
    .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
}

function contrastRatio(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function wcagGrade(ratio: number): { label: string; cls: string } {
  if (ratio >= 7)   return { label: "AAA", cls: "bg-success/15 text-success" };
  if (ratio >= 4.5) return { label: "AA",  cls: "bg-primary/15 text-primary" };
  if (ratio >= 3)   return { label: "AA*", cls: "bg-warning/15 text-warning" };
  return { label: "—", cls: "bg-muted text-muted-foreground" };
}

// ─── Token groups ─────────────────────────────────────────────────────────────

const TOKEN_GROUPS = [
  {
    label: "Background & Surface",
    desc: "Page background, card containers, muted surfaces, and borders",
    tokens: [
      { label: "background",   cssVar: "--background" },
      { label: "card",         cssVar: "--card" },
      { label: "muted",        cssVar: "--muted" },
      { label: "secondary",    cssVar: "--secondary" },
      { label: "border",       cssVar: "--border" },
      { label: "input",        cssVar: "--input" },
    ],
  },
  {
    label: "Text",
    desc: "Foreground text at full and reduced emphasis",
    tokens: [
      { label: "foreground",       cssVar: "--foreground" },
      { label: "muted-foreground", cssVar: "--muted-foreground" },
    ],
  },
  {
    label: "Brand / Primary",
    desc: "Buttons, links, active states, and focus rings",
    tokens: [
      { label: "primary",            cssVar: "--primary" },
      { label: "primary-foreground", cssVar: "--primary-foreground" },
      { label: "ring",               cssVar: "--ring" },
    ],
  },
  {
    label: "Accent",
    desc: "Secondary interactive highlights and hover states",
    tokens: [
      { label: "accent",            cssVar: "--accent" },
      { label: "accent-foreground", cssVar: "--accent-foreground" },
    ],
  },
  {
    label: "Status",
    desc: "Semantic colors for success, warning, and error states",
    tokens: [
      { label: "success",     cssVar: "--success" },
      { label: "warning",     cssVar: "--warning" },
      { label: "destructive", cssVar: "--destructive" },
    ],
  },
  {
    label: "Sidebar",
    desc: "Navigation sidebar surfaces and interactive colors",
    tokens: [
      { label: "sidebar",         cssVar: "--sidebar" },
      { label: "sidebar-primary", cssVar: "--sidebar-primary" },
      { label: "sidebar-accent",  cssVar: "--sidebar-accent" },
      { label: "sidebar-border",  cssVar: "--sidebar-border" },
    ],
  },
] as const;

const ALL_VARS = TOKEN_GROUPS.flatMap((g) => g.tokens.map((t) => t.cssVar));
const OPACITY_STEPS = [100, 80, 60, 40, 20, 12, 8] as const;
const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];

type RgbMap = Map<string, [number, number, number]>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ColorPalettePage() {
  const [rgbMap, setRgbMap] = useState<RgbMap>(new Map());

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const map: RgbMap = new Map();
    for (const v of ALL_VARS) {
      const val = style.getPropertyValue(v).trim();
      if (val) map.set(v, hslToRgb(val));
    }
    setRgbMap(map);
  }, []);

  const cardRgb = rgbMap.get("--card") ?? WHITE;

  return (
    <main className="grid min-w-0 gap-6 p-4 md:p-5 lg:p-6">
      {/* Header */}
      <header className="rounded-lg border border-border bg-card p-5 shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Design System
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
          Color Palette
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Pitchsmith brand token set — Orange primary, dark navy sidebar, neutral surfaces.
          แต่ละ token ผูกกับ CSS variable และรองรับ light / dark mode โดยอัตโนมัติ
          ค่า Hex คำนวณจากการ blend บน card background ที่แต่ละ opacity
        </p>
      </header>

      {/* WCAG legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
        <span className="font-semibold text-foreground">WCAG 2.1 contrast:</span>
        <span className="rounded-md px-2 py-0.5 bg-success/15 text-success font-semibold">
          AAA ≥ 7 : 1
        </span>
        <span className="rounded-md px-2 py-0.5 bg-primary/15 text-primary font-semibold">
          AA ≥ 4.5 : 1
        </span>
        <span className="rounded-md px-2 py-0.5 bg-warning/15 text-warning font-semibold">
          AA* ≥ 3 : 1 (large text)
        </span>
        <span className="rounded-md px-2 py-0.5 bg-muted text-muted-foreground font-semibold">
          — insufficient
        </span>
        <span className="ml-auto text-muted-foreground">
          Contrast vs white / black (best)
        </span>
      </div>

      {/* Token groups */}
      {TOKEN_GROUPS.map((group) => (
        <TokenGroupSection
          key={group.label}
          group={group}
          rgbMap={rgbMap}
          cardRgb={cardRgb as [number, number, number]}
        />
      ))}
    </main>
  );
}

// ─── Token group section ──────────────────────────────────────────────────────

function TokenGroupSection({
  group,
  rgbMap,
  cardRgb,
}: {
  group: (typeof TOKEN_GROUPS)[number];
  rgbMap: RgbMap;
  cardRgb: [number, number, number];
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-semibold text-foreground">{group.label}</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{group.desc}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse">
          {/* Column headers */}
          <thead>
            <tr className="border-b border-border">
              <th className="w-44 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Token
              </th>
              {OPACITY_STEPS.map((op) => (
                <th
                  key={op}
                  className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {op}%
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {group.tokens.map((token, i) => (
              <TokenRow
                key={token.cssVar}
                token={token}
                rgb={rgbMap.get(token.cssVar)}
                cardRgb={cardRgb}
                isLast={i === group.tokens.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── Token row ────────────────────────────────────────────────────────────────

function TokenRow({
  token,
  rgb,
  cardRgb,
  isLast,
}: {
  token: { label: string; cssVar: string };
  rgb: [number, number, number] | undefined;
  cardRgb: [number, number, number];
  isLast: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1400);
  }

  const copyTarget = `var(${token.cssVar})`;

  return (
    <tr className={!isLast ? "border-b border-border" : ""}>
      {/* Token label + CSS var */}
      <td className="px-5 py-4 align-top">
        <p className="text-[13px] font-semibold text-foreground">{token.label}</p>
        <button
          type="button"
          onClick={() => copy(copyTarget)}
          className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition hover:text-primary"
        >
          {copied === copyTarget ? (
            <FiCheck className="h-3 w-3 shrink-0 text-success" />
          ) : (
            <FiCopy className="h-3 w-3 shrink-0" />
          )}
          {token.cssVar}
        </button>
      </td>

      {/* Swatch columns */}
      {OPACITY_STEPS.map((op) => {
        if (!rgb) {
          return (
            <td key={op} className="px-2 py-4 align-top">
              <div className="mx-auto h-11 w-14 animate-pulse rounded-lg bg-muted" />
            </td>
          );
        }

        const alpha = op / 100;
        const blended = blendOnto(rgb, alpha, cardRgb);
        const hex = toHex(blended);
        const vsWhite = contrastRatio(blended, WHITE);
        const vsBlack = contrastRatio(blended, BLACK);
        const best = Math.max(vsWhite, vsBlack);
        const grade = wcagGrade(best);

        return (
          <td key={op} className="px-2 py-4 align-top">
            <div className="flex flex-col items-center gap-1.5">
              {/* Swatch button */}
              <button
                type="button"
                onClick={() => copy(hex)}
                title={`Copy ${hex}`}
                className="group relative h-11 w-14 rounded-lg border border-border shadow-sm transition-transform hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: hex }}
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition group-hover:bg-black/10 group-hover:opacity-100">
                  {copied === hex ? (
                    <FiCheck className="h-3.5 w-3.5 text-white drop-shadow" />
                  ) : (
                    <FiCopy className="h-3.5 w-3.5 text-white drop-shadow" />
                  )}
                </span>
              </button>

              {/* Hex value */}
              <span className="font-mono text-[10px] leading-none text-muted-foreground">
                {hex}
              </span>

              {/* WCAG badge — only at 100% */}
              {op === 100 && (
                <span
                  className={[
                    "rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none whitespace-nowrap",
                    grade.cls,
                  ].join(" ")}
                >
                  {grade.label} {best.toFixed(1)}
                </span>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}
