// Editor konten — layar inti panel: judul + WYSIWYG (TipTap) di kolom utama,
// panel samping untuk status/slug/excerpt/SEO. Dipakai untuk /contents/new
// maupun /contents/:id (mode ditentukan ada-tidaknya param id).
// RELASI: components/editor/RichTextEditor — WYSIWYG; mock/back-end lewat
// lib/api/client dengan kontrak yang sama.
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api/client";
import type { Content, ContentStatus, ContentType } from "@/lib/api/types";
import { slugify } from "@/lib/utils";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Label, Select, Textarea, FieldHint } from "@/components/ui/fields";
import { PageLoader } from "@/components/ui/Spinner";
import { useDialog } from "@/app/providers/DialogProvider";
import { useToast } from "@/app/providers/ToastProvider";

interface FormState {
  title: string;
  slug: string;
  slugTouched: boolean;
  excerpt: string;
  body: string;
  status: ContentStatus;
  content_type_id: string;
  meta_title: string;
  meta_description: string;
}

const EMPTY: FormState = {
  title: "", slug: "", slugTouched: false, excerpt: "", body: "",
  status: "draft", content_type_id: "", meta_title: "", meta_description: "",
};

export function ContentEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const dialog = useDialog();
  const toast = useToast();

  const [form, setForm] = useState<FormState | null>(isNew ? EMPTY : null);
  const [types, setTypes] = useState<ContentType[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void api.get<ContentType[]>("/content-types").then((r) => {
      setTypes(r.data);
      if (isNew) {
        setForm((f) => (f ? { ...f, content_type_id: f.content_type_id || r.data[0]?.id || "" } : f));
      }
    });
    if (!isNew) {
      void api.get<Content>(`/contents/${id}`).then((r) => {
        const c = r.data;
        setForm({
          title: c.title, slug: c.slug, slugTouched: true, excerpt: c.excerpt,
          body: c.body, status: c.status, content_type_id: c.content_type_id,
          meta_title: "", meta_description: "",
          // NEXT: muat blok SEO dari GET /contents/:id (field content_seo)
          // saat backend modul keyword mengembalikannya.
        });
      });
    }
  }, [id, isNew]);

  const slugPreview = useMemo(
    () => (form ? (form.slugTouched && form.slug ? slugify(form.slug) : slugify(form.title)) : ""),
    [form],
  );

  if (!form) return <PageLoader />;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async (publish = false) => {
    if (!form.title.trim()) {
      await dialog.alert({ tone: "warning", title: "Judul wajib diisi", text: "Beri judul sebelum menyimpan." });
      return;
    }
    if (publish) {
      const ok = await dialog.confirm({
        title: "Terbitkan sekarang?",
        text: "Konten akan langsung tampil publik dan masuk sitemap.",
        confirmText: "Terbitkan",
      });
      if (!ok) return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: slugPreview,
        excerpt: form.excerpt,
        body: form.body,
        status: publish ? ("published" as const) : form.status,
        content_type_id: form.content_type_id,
      };
      if (isNew) {
        const r = await api.post<Content>("/contents", payload);
        toast.success(publish ? "Konten diterbitkan." : "Draft tersimpan.");
        navigate(`/contents/${r.data.id}`, { replace: true });
      } else {
        await api.patch<Content>(`/contents/${id}`, payload);
        toast.success(publish ? "Konten diterbitkan." : "Perubahan tersimpan.");
        if (publish) set("status", "published");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {/* Kolom utama */}
      <div className="space-y-4 xl:col-span-2">
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Judul konten…"
          className="h-12 !text-lg font-semibold"
          aria-label="Judul konten"
        />
        <RichTextEditor value={form.body} onChange={(html) => set("body", html)} />
      </div>

      {/* Panel samping */}
      <div className="space-y-5">
        <Card>
          <CardHeader title="Penerbitan" />
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={form.status} onChange={(e) => set("status", e.target.value as ContentStatus)}>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="scheduled">Terjadwal</option>
                <option value="published">Published</option>
                <option value="archived">Arsip</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Tipe konten</Label>
              <Select id="type" value={form.content_type_id} onChange={(e) => set("content_type_id", e.target.value)}>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" loading={saving} onClick={() => void save(false)}>
                Simpan
              </Button>
              <Button className="flex-1" loading={saving} onClick={() => void save(true)}>
                Terbitkan
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Ringkasan & URL" />
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slugTouched ? form.slug : slugPreview}
                onChange={(e) => {
                  set("slugTouched", true);
                  set("slug", e.target.value);
                }}
                placeholder="otomatis-dari-judul"
              />
              <FieldHint>URL: /{slugPreview || "…"} — dicek unik oleh backend saat simpan.</FieldHint>
            </div>
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Ringkasan 1–2 kalimat…" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="SEO" description="Meta untuk hasil pencarian & share" />
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="mtitle">Meta title</Label>
              <Input id="mtitle" value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} placeholder={form.title || "Sama dengan judul"} />
            </div>
            <div>
              <Label htmlFor="mdesc">Meta description</Label>
              <Textarea
                id="mdesc" value={form.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
                placeholder="Kosongkan untuk otomatis dari excerpt…" maxLength={155}
              />
              <FieldHint>{form.meta_description.length}/155 karakter</FieldHint>
            </div>
            {/* NEXT: chip keyword terpasang + skor analisis on-save 0–100 dari
                backend modul keyword (RELASI: src/modules/keyword). */}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
