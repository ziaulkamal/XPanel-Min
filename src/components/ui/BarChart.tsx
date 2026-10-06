// Bar chart SVG seri-tunggal tanpa dependensi, mengikuti metode dataviz:
// satu hue (token --color-chart, tervalidasi light #3b6fd4 / dark #5b8ae0),
// mark tipis ber-ujung membulat 4px menempel baseline, celah antar batang,
// grid resesif, tooltip hover per-mark, dan toggle tampilan tabel sebagai
// alternatif akses. Seri tunggal → tanpa legend (judul kartu yang menamai).
import { useId, useState } from "react";
import { Table, Th, Td } from "./Table";

export interface BarDatum {
  label: string; // label penuh utk tooltip/tabel
  short?: string; // label sumbu ringkas (opsional, selektif)
  value: number;
}

export function BarChart({
  data,
  height = 160,
  valueLabel = "Nilai",
}: {
  data: BarDatum[];
  height?: number;
  valueLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const clipId = useId();

  const W = 600;
  const H = height;
  const padX = 6;
  const padTop = 14;
  const padBottom = 20;
  const max = Math.max(1, ...data.map((d) => d.value));
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const step = innerW / data.length;
  const barW = Math.max(3, Math.min(18, step - 2)); // celah >=2px antar batang
  const y = (v: number) => padTop + innerH * (1 - v / max);

  if (asTable) {
    return (
      <div>
        <ToggleRow asTable={asTable} onToggle={setAsTable} />
        <Table className="max-h-56 overflow-y-auto">
          <thead>
            <tr>
              <Th>Label</Th>
              <Th className="text-right">{valueLabel}</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <Td>{d.label}</Td>
                <Td className="text-right tabular-nums">{d.value}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }

  const hovered = hover !== null ? data[hover] : null;

  return (
    <div>
      <ToggleRow asTable={asTable} onToggle={setAsTable} />
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Grafik batang: ${valueLabel}`}>
          {/* grid resesif: 3 garis horizontal tipis */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={padX}
              x2={W - padX}
              y1={padTop + innerH * f}
              y2={padTop + innerH * f}
              stroke="var(--c-line)"
              strokeWidth="1"
              opacity="0.6"
            />
          ))}
          <line x1={padX} x2={W - padX} y1={padTop + innerH} y2={padTop + innerH} stroke="var(--c-line)" strokeWidth="1" />

          {/* ujung atas membulat 4px, dasar rata di baseline: clip rect membulat */}
          <defs>
            <clipPath id={clipId}>
              {data.map((d, i) => {
                const h = Math.max(2, padTop + innerH - y(d.value));
                return (
                  <rect
                    key={d.label}
                    x={padX + i * step + (step - barW) / 2}
                    y={y(d.value)}
                    width={barW}
                    height={h + 4}
                    rx="4"
                  />
                );
              })}
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {data.map((d, i) => (
              <rect
                key={d.label}
                x={padX + i * step}
                y={padTop}
                width={step}
                height={innerH}
                fill="var(--c-chart)"
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
            ))}
          </g>

          {/* target hover lebih besar dari mark */}
          {data.map((d, i) => (
            <rect
              key={d.label}
              x={padX + i * step}
              y={padTop}
              width={step}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
          ))}

          {/* label sumbu selektif: awal, tengah, akhir */}
          {data.length > 2 &&
            [0, Math.floor(data.length / 2), data.length - 1].map((i) => (
              <text
                key={i}
                x={padX + i * step + step / 2}
                y={H - 5}
                textAnchor="middle"
                fontSize="10"
                fill="var(--c-ink3)"
              >
                {data[i].short ?? data[i].label}
              </text>
            ))}
        </svg>

        {hovered && hover !== null && (
          <div
            className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs shadow-lg"
            style={{ left: `${((padX + hover * step + step / 2) / W) * 100}%` }}
          >
            <span className="text-ink3">{hovered.label}</span>{" "}
            <span className="font-semibold tabular-nums">{hovered.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ asTable, onToggle }: { asTable: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="mb-2 flex justify-end">
      <button
        onClick={() => onToggle(!asTable)}
        className="text-[11px] font-medium text-ink3 underline-offset-2 hover:text-accent hover:underline"
      >
        {asTable ? "Lihat grafik" : "Lihat tabel"}
      </button>
    </div>
  );
}
