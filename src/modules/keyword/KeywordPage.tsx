// Keyword & coverage: daftar keyword tenant + panel coverage (konten mana
// yang membidik keyword terpilih — deteksi kanibalisasi).
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api/client";
import type { CoverageItem, Keyword } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/fields";
import { Icon } from "@/components/ui/icons";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/Tabs";
import { useToast } from "@/app/providers/ToastProvider";
import { ApiError } from "@/lib/api/client";

export function KeywordPage() {
  const toast = useToast();
  const [keywords, setKeywords] = useState<Keyword[] | null>(null);
  const [selected, setSelected] = useState<Keyword | null>(null);
  const [coverage, setCoverage] = useState<CoverageItem[] | null>(null);
  const [phrase, setPhrase] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const r = await api.get<Keyword[]>("/keywords");
    setKeywords(r.data);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setCoverage(null);
    void api.get<CoverageItem[]>(`/keywords/${selected.id}/coverage`).then((r) => setCoverage(r.data));
  }, [selected]);

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!phrase.trim()) return;
    setAdding(true);
    try {
      await api.post("/keywords", { phrase });
      toast.success(`Keyword “${phrase}” ditambahkan.`);
      setPhrase("");
      void load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menambah keyword.");
    } finally {
      setAdding(false);
    }
  };

  if (!keywords) return <PageLoader />;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Keywords" description="Satu keyword bisa dibidik banyak konten — pantau dari sini" />
        <CardBody className="space-y-4">
          <form onSubmit={onAdd} className="flex gap-2">
            <Input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="Tambah keyword baru…" />
            <Button type="submit" loading={adding}>
              <Icon name="plus" className="size-4" />
            </Button>
          </form>

          {keywords.length === 0 ? (
            <EmptyState title="Belum ada keyword" />
          ) : (
            <ul className="space-y-1.5">
              {keywords.map((k) => (
                <li key={k.id}>
                  <button
                    onClick={() => setSelected(k)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors",
                      selected?.id === k.id
                        ? "border-accent bg-accent-soft"
                        : "border-line hover:bg-surface2",
                    )}
                  >
                    <span className="font-medium">{k.phrase}</span>
                    <Badge tone={(k.usage_count ?? 0) > 1 ? "warn" : "neutral"}>
                      {k.usage_count ?? 0} konten
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={selected ? `Coverage — “${selected.phrase}”` : "Coverage"}
          description="Lebih dari satu konten primary pada keyword yang sama = indikasi kanibalisasi"
        />
        <CardBody>
          {!selected ? (
            <EmptyState title="Pilih keyword" description="Klik salah satu keyword untuk melihat konten yang membidiknya." />
          ) : coverage === null ? (
            <PageLoader />
          ) : coverage.length === 0 ? (
            <EmptyState title="Belum dibidik konten mana pun" />
          ) : (
            <ul className="space-y-2">
              {coverage.map((c) => (
                <li
                  key={c.content_id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <Link to={`/contents/${c.content_id}`} className="block truncate text-sm font-medium hover:text-accent">
                      {c.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      {c.is_primary && <Badge tone="info">Primary</Badge>}
                    </div>
                  </div>
                  <Icon name="chevron-right" className="size-4 shrink-0 text-ink3" />
                </li>
              ))}
            </ul>
          )}
          {/* NEXT: skor analisis per konten (0–100) & saran AI assist —
              RELASI: backend modul keyword (docs Fablerace 06 §1 & §5). */}
        </CardBody>
      </Card>
    </div>
  );
}
