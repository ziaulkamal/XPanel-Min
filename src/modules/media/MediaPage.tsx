// Media library: grid thumbnail + hapus dengan konfirmasi. Alur upload nyata
// (presign → PUT MinIO → confirm) menyusul bersama backend.
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { ListMeta, MediaItem } from "@/lib/api/types";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/Table";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/Tabs";
import { useDialog } from "@/app/providers/DialogProvider";
import { useToast } from "@/app/providers/ToastProvider";

export function MediaPage() {
  const dialog = useDialog();
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [meta, setMeta] = useState<ListMeta>({ page: 1, per_page: 12, total: 0 });
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const r = await api.get<MediaItem[]>(`/media?page=${page}&per_page=12`);
    setItems(r.data);
    if (r.meta) setMeta(r.meta);
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const onUpload = async () => {
    // NEXT: alur nyata — pilih file → POST /media/presign (validasi MIME+kuota)
    // → PUT langsung ke MinIO → POST /media/:id/confirm (RELASI: backend
    // Fablerace internal/modules/media, docs/07-storage-media.md §2).
    await dialog.alert({
      tone: "info",
      title: "Upload menyusul bersama backend",
      text: "Alur presigned-upload ke MinIO diaktifkan saat panel terhubung ke backend Fablerace.",
    });
  };

  const onDelete = async (m: MediaItem) => {
    const yes = await dialog.confirm({
      title: "Hapus media?",
      text: `“${m.file_name}” dihapus permanen dari storage.`,
      tone: "danger",
      confirmText: "Ya, hapus",
    });
    if (!yes) return;
    await api.del(`/media/${m.id}`);
    toast.success("Media dihapus.");
    void load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink3">{meta.total} berkas</p>
        <Button onClick={() => void onUpload()}>
          <Icon name="upload" className="size-4" /> Upload Media
        </Button>
      </div>

      {items === null ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState title="Media library kosong" description="Unggah gambar atau dokumen pertama Anda." />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <Card key={m.id} className="group overflow-hidden">
                <div className="relative aspect-video bg-surface2">
                  {m.url && <img src={m.url} alt={m.alt_text} className="size-full object-cover" />}
                  <button
                    onClick={() => void onDelete(m)}
                    aria-label={`Hapus ${m.file_name}`}
                    className="absolute right-2 top-2 rounded-md bg-side/70 p-1.5 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
                  >
                    <Icon name="trash" className="size-3.5" />
                  </button>
                </div>
                <div className="px-3.5 py-2.5">
                  <p className="truncate text-xs font-medium">{m.file_name}</p>
                  <p className="mt-0.5 text-[10px] text-ink3">
                    {formatBytes(m.size_bytes)} · {formatDate(m.created_at)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <Pagination page={meta.page} perPage={meta.per_page} total={meta.total} onPage={setPage} />
          </Card>
        </>
      )}
    </div>
  );
}
