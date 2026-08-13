import type { WritingChartSeries, WritingTaskVisual as WritingTaskVisualData } from "@/lib/ielts";

const COLORS = ["#0f766e", "#2563eb", "#db2777", "#d97706", "#7c3aed", "#0891b2"];

type Props = { visual: WritingTaskVisualData };

function maxValue(series: WritingChartSeries[]) {
  return Math.max(1, ...series.flatMap((item) => item.values));
}

function chartMaximum(value: number) {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function Legend({ series }: { series: WritingChartSeries[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2" aria-label="Chart legend">
      {series.map((item, index) => (
        <span key={item.name} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
          {item.name}
        </span>
      ))}
    </div>
  );
}

function AxisLines({ maximum, y, height, left, width }: { maximum: number; y: number; height: number; left: number; width: number }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((tick) => {
        const value = (maximum / 4) * tick;
        const position = y + height - (height / 4) * tick;
        return (
          <g key={tick}>
            <line x1={left} x2={left + width} y1={position} y2={position} stroke="currentColor" strokeOpacity="0.12" />
            <text x={left - 10} y={position + 4} textAnchor="end" className="fill-ink-soft text-[10px] font-medium">
              {formatNumber(value)}
            </text>
          </g>
        );
      })}
    </>
  );
}

function LineChart({ visual }: Props) {
  const left = 56;
  const top = 20;
  const width = 560;
  const height = 194;
  const maximum = chartMaximum(maxValue(visual.series));
  const pointX = (index: number) => left + (visual.categories.length > 1 ? (width / (visual.categories.length - 1)) * index : width / 2);
  const pointY = (value: number) => top + height - (value / maximum) * height;

  return (
    <svg viewBox="0 0 660 264" className="mt-4 w-full text-ink" role="img" aria-label={visual.title}>
      <AxisLines maximum={maximum} y={top} height={height} left={left} width={width} />
      <line x1={left} x2={left} y1={top} y2={top + height} stroke="currentColor" strokeOpacity="0.25" />
      <line x1={left} x2={left + width} y1={top + height} y2={top + height} stroke="currentColor" strokeOpacity="0.25" />
      {visual.series.map((series, seriesIndex) => {
        const color = COLORS[seriesIndex % COLORS.length];
        const points = series.values.map((value, index) => `${pointX(index)},${pointY(value)}`).join(" ");
        return (
          <g key={series.name}>
            <polyline fill="none" points={points} stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {series.values.map((value, index) => <circle key={`${series.name}-${index}`} cx={pointX(index)} cy={pointY(value)} r="3.5" fill={color} />)}
          </g>
        );
      })}
      {visual.categories.map((label, index) => (
        <text key={label} x={pointX(index)} y={top + height + 22} textAnchor="middle" className="fill-ink-soft text-[10px] font-medium">
          {label}
        </text>
      ))}
      {visual.y_label && <text x="15" y={top + height / 2} textAnchor="middle" transform={`rotate(-90 15 ${top + height / 2})`} className="fill-ink-soft text-[10px] font-medium">{visual.y_label}</text>}
    </svg>
  );
}

function BarChart({ visual, compact = false }: Props & { compact?: boolean }) {
  const left = 46;
  const top = 20;
  const width = compact ? 302 : 570;
  const height = compact ? 150 : 194;
  const maximum = chartMaximum(maxValue(visual.series));
  const groupWidth = width / visual.categories.length;
  const innerWidth = groupWidth * 0.72;
  const barWidth = innerWidth / visual.series.length;

  return (
    <svg viewBox={`0 0 ${width + left + 28} ${top + height + 58}`} className="w-full text-ink" role="img" aria-label={visual.title}>
      <AxisLines maximum={maximum} y={top} height={height} left={left} width={width} />
      <line x1={left} x2={left} y1={top} y2={top + height} stroke="currentColor" strokeOpacity="0.25" />
      <line x1={left} x2={left + width} y1={top + height} y2={top + height} stroke="currentColor" strokeOpacity="0.25" />
      {visual.categories.map((label, categoryIndex) => (
        <g key={label}>
          {visual.series.map((series, seriesIndex) => {
            const value = series.values[categoryIndex] ?? 0;
            const barHeight = (value / maximum) * height;
            const x = left + categoryIndex * groupWidth + (groupWidth - innerWidth) / 2 + seriesIndex * barWidth;
            return <rect key={series.name} x={x} y={top + height - barHeight} width={Math.max(barWidth - 2, 2)} height={barHeight} rx="1.5" fill={COLORS[seriesIndex % COLORS.length]} />;
          })}
          <text x={left + categoryIndex * groupWidth + groupWidth / 2} y={top + height + 18} textAnchor="middle" className="fill-ink-soft text-[9px] font-medium">
            {compact && label.length > 10 ? `${label.slice(0, 9)}…` : label}
          </text>
        </g>
      ))}
      {!compact && visual.y_label && <text x="14" y={top + height / 2} textAnchor="middle" transform={`rotate(-90 14 ${top + height / 2})`} className="fill-ink-soft text-[10px] font-medium">{visual.y_label}</text>}
    </svg>
  );
}

function DataTable({ visual }: Props) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-raised/50">
      <table className="min-w-full border-collapse text-left text-xs">
        <caption className="sr-only">{visual.title}</caption>
        <thead className="bg-line/50 text-ink-soft">
          <tr>
            <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-black">Series</th>
            {visual.categories.map((category) => <th key={category} scope="col" className="px-3 py-2.5 text-right font-black">{category}</th>)}
          </tr>
        </thead>
        <tbody>
          {visual.series.map((series) => (
            <tr key={series.name} className="border-t border-line/70 text-ink">
              <th scope="row" className="whitespace-nowrap px-3 py-2.5 font-bold">{series.name}</th>
              {series.values.map((value, index) => <td key={`${series.name}-${visual.categories[index]}`} className="px-3 py-2.5 text-right tabular-nums">{formatNumber(value)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {visual.y_label && <p className="border-t border-line/70 px-3 py-2 text-[11px] font-medium text-ink-soft">{visual.y_label}</p>}
    </div>
  );
}

function piePath(startAngle: number, endAngle: number, radius: number) {
  const start = { x: 100 + radius * Math.cos((startAngle * Math.PI) / 180), y: 100 + radius * Math.sin((startAngle * Math.PI) / 180) };
  const end = { x: 100 + radius * Math.cos((endAngle * Math.PI) / 180), y: 100 + radius * Math.sin((endAngle * Math.PI) / 180) };
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M 100 100 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function PieChart({ visual }: Props) {
  const total = visual.pie?.reduce((sum, slice) => sum + slice.value, 0) ?? 1;
  let angle = -90;
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center">
      <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[190px]" role="img" aria-label="USA box-office takings by genre">
        {visual.pie?.map((slice, index) => {
          const next = angle + (slice.value / total) * 360;
          const path = piePath(angle, next, 82);
          angle = next;
          return <path key={slice.name} d={path} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth="2" />;
        })}
        <circle cx="100" cy="100" r="42" fill="var(--card, white)" />
        <text x="100" y="96" textAnchor="middle" className="fill-ink text-[15px] font-black">USA</text>
        <text x="100" y="114" textAnchor="middle" className="fill-ink-soft text-[10px] font-semibold">ticket sales</text>
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">
        {visual.pie?.map((slice, index) => <span key={slice.name} className="inline-flex items-center gap-1 text-[10px] font-bold text-ink-soft"><span className="size-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />{slice.name} {slice.value}%</span>)}
      </div>
    </div>
  );
}

export function WritingTaskVisual({ visual }: Props) {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-sky-50/70 p-4 dark:border-brand-900/40 dark:from-brand-950/25 dark:to-sky-950/15">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Task visual</p>
          <h3 className="mt-1 text-sm font-black text-ink">{visual.title}</h3>
        </div>
        <span className="rounded-full bg-card/80 px-2.5 py-1 text-[10px] font-black text-ink-soft shadow-sm">Study the data</span>
      </div>
      {visual.kind === "line" && <><LineChart visual={visual} /><Legend series={visual.series} /></>}
      {visual.kind === "bar" && <><div className="mt-4"><BarChart visual={visual} /></div><Legend series={visual.series} /></>}
      {visual.kind === "table" && <DataTable visual={visual} />}
      {visual.kind === "bar-pie" && (
        <div className="mt-4 grid gap-4 md:grid-cols-[1.45fr_0.9fr] md:items-center">
          <div><BarChart visual={visual} compact /><Legend series={visual.series} /></div>
          <PieChart visual={visual} />
        </div>
      )}
    </section>
  );
}
