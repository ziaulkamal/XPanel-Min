// Dashboard: 4 stat tile (kontrak dataviz), grafik batang seri-tunggal
// "Publikasi 30 hari" (token --color-chart tervalidasi; toggle tabel tersedia),
// konten terbaru, dan keyword teratas.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api/client";
import type { DashboardSummary } from "@/lib/api/types";
import { compactNumber, formatBytes, formatDate } from "@/lib/utils";
import { StatTile } from "@/components/ui/StatTile";
import { BarChart } from "@/components/ui/BarChart";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Table, Th, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    void api.get<DashboardSummary>("/dashboard/summary").then((r) => setData(r.data));
  }, []);

  if (!data) return <PageLoader />;

  const storagePct = Math.round((data.storage_bytes / data.storage_quota) * 100);

  return (
    <div className="space-y-5">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total konten" value={compactNumber(data.total_content)} icon="file-text" />
        <StatTile label="Published" value={compactNumber(data.published)} icon="check-circle" />
        <StatTile label="Draft" value={compactNumber(data.draft)} icon="pencil" />
        <StatTile
          label={`Storage terpakai (${storagePct}%)`}
          value={formatBytes(data.storage_bytes)}
          icon="image"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        {/* Grafik publikasi */}
        <Card className="xl:col-span-3">
          <CardHeader title="Publikasi 30 hari terakhir" description="Jumlah konten terbit per hari" />
          <CardBody>
            <BarChart
              valueLabel="Konten terbit"
              data={data.publish_last_30d.map((d) => ({
                label: formatDate(d.date),
                short: new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
                value: d.count,
              }))}
            />
          </CardBody>
        </Card>

        {/* Keyword teratas */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Keyword teratas"
            description="Berdasarkan jumlah konten yang membidiknya"
            actions={<Link to="/keywords" className="text-xs font-medium text-accent hover:underline">Kelola →</Link>}
          />
          <CardBody className="space-y-3">
            {data.top_keywords.map((k) => {
              const max = Math.max(1, ...data.top_keywords.map((x) => x.usage_count));
              return (
                <div key={k.phrase}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{k.phrase}</span>
                    <span className="tabular-nums text-ink3">{k.usage_count} konten</span>
                  </div>
                  {/* meter: track = langkah lebih muda dari hue yang sama */}
                  <div className="h-1.5 rounded-full bg-accent-soft">
                    <div
                      className="h-1.5 rounded-full bg-chart"
                      style={{ width: `${(k.usage_count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Konten terbaru */}
      <Card>
        <CardHeader
          title="Konten terbaru"
          actions={<Link to="/contents" className="text-xs font-medium text-accent hover:underline">Semua konten →</Link>}
        />
        <Table>
          <thead>
            <tr>
              <Th>Judul</Th>
              <Th>Status</Th>
              <Th>Penulis</Th>
              <Th>Diubah</Th>
            </tr>
          </thead>
          <tbody>
            {data.recent_contents.map((c) => (
              <tr key={c.id} className="hover:bg-surface2/50">
                <Td>
                  <Link to={`/contents/${c.id}`} className="font-medium hover:text-accent">
                    {c.title}
                  </Link>
                  <span className="block text-xs text-ink3">/{c.slug}</span>
                </Td>
                <Td><StatusBadge status={c.status} /></Td>
                <Td className="text-ink2">{c.author_name ?? "—"}</Td>
                <Td className="text-ink3">{formatDate(c.updated_at)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
