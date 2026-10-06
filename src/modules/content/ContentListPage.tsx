// Daftar konten: filter status + pencarian (sinkron dengan query URL dari
// pencarian topbar), pagination envelope, aksi publish/hapus dengan
// konfirmasi dialog gaya sweet-alert.
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api/client";
import type { Content, ContentStatus, ListMeta } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/fields";
import { Icon } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, Th, Td, Pagination } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/Tabs";
import { PageLoader } from "@/components/ui/Spinner";
import { useDialog } from "@/app/providers/DialogProvider";
import { useToast } from "@/app/providers/ToastProvider";

const STATUSES: Array<{ value: "" | ContentStatus; label: string }> = [
  { value: "", label: "Semua status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "scheduled", label: "Terjadwal" },
  { value: "archived", label: "Arsip" },
];

export function ContentListPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const dialog = useDialog();
  const toast = useToast();

  const [items, setItems] = useState<Content[] | null>(null);
  const [meta, setMeta] = useState<ListMeta>({ page: 1, per_page: 10, total: 0 });

  const search = params.get("search") ?? "";
  const status = params.get("status") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));

  const load = useCallback(async () => {
    const q = new URLSearchParams({ page: String(page), per_page: "10" });
    if (search) q.set("search", search);
    if (status) q.set("status", status);
    const r = await api.get<Content[]>(`/contents?${q}`);
    setItems(r.data);
    if (r.meta) setMeta(r.meta);
  }, [page, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const onPublish = async (c: Content) => {
    if (!(await dialog.confirm({ title: "Terbitkan konten?", text: `“${c.title}” akan tampil publik.` }))) return;
    await api.post(`/contents/${c.id}/publish`);
    toast.success("Konten diterbitkan.");
    void load();
  };

  const onDelete = async (c: Content) => {
    const yes = await dialog.confirm({
      title: "Hapus konten?",
      text: `“${c.title}” dipindahkan ke sampah (soft delete).`,
      tone: "danger",
      confirmText: "Ya, hapus",
    });
    if (!yes) return;
    await api.del(`/contents/${c.id}`);
    toast.success("Konten dihapus.");
    void load();
  };

  return (
    <div className="space-y-4">
      {/* Bar filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 md:max-w-xs">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink3" />
          <Input
            className="pl-9"
            placeholder="Cari judul…"
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") setParam("search", (e.target as HTMLInputElement).value);
            }}
          />
        </div>
        <Select className="w-44" value={status} onChange={(e) => setParam("status", e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
        <div className="flex-1" />
        <Button onClick={() => navigate("/contents/new")}>
          <Icon name="plus" className="size-4" /> Tambah Konten
        </Button>
      </div>

      <Card>
        {items === null ? (
          <PageLoader />
        ) : items.length === 0 ? (
          <EmptyState
            title="Tidak ada konten"
            description={search ? `Tidak ada hasil untuk “${search}”.` : "Mulai dengan menulis konten pertama Anda."}
            action={<Button size="sm" onClick={() => navigate("/contents/new")}>Tulis konten</Button>}
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Judul</Th>
                  <Th>Status</Th>
                  <Th>Penulis</Th>
                  <Th>Dibuat</Th>
                  <Th className="w-28 text-right">Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="group hover:bg-surface2/50">
                    <Td>
                      <Link to={`/contents/${c.id}`} className="font-medium hover:text-accent">{c.title}</Link>
                      <span className="block text-xs text-ink3">/{c.slug}</span>
                    </Td>
                    <Td><StatusBadge status={c.status} /></Td>
                    <Td className="text-ink2">{c.author_name ?? "—"}</Td>
                    <Td className="text-ink3">{formatDate(c.created_at)}</Td>
                    <Td>
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {c.status !== "published" && (
                          <button
                            title="Terbitkan" aria-label={`Terbitkan ${c.title}`}
                            onClick={() => void onPublish(c)}
                            className="rounded-md p-1.5 text-ink3 hover:bg-ok-soft hover:text-ok"
                          >
                            <Icon name="check" className="size-4" />
                          </button>
                        )}
                        <Link
                          to={`/contents/${c.id}`} title="Sunting" aria-label={`Sunting ${c.title}`}
                          className="rounded-md p-1.5 text-ink3 hover:bg-accent-soft hover:text-accent"
                        >
                          <Icon name="pencil" className="size-4" />
                        </Link>
                        <button
                          title="Hapus" aria-label={`Hapus ${c.title}`}
                          onClick={() => void onDelete(c)}
                          className="rounded-md p-1.5 text-ink3 hover:bg-danger-soft hover:text-danger"
                        >
                          <Icon name="trash" className="size-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={meta.page} perPage={meta.per_page} total={meta.total} onPage={(p) => setParam("page", String(p))} />
          </>
        )}
      </Card>
    </div>
  );
}
