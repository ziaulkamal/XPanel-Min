// Pengaturan tenant bertab: Umum / API Keys / Webhooks. Submenu sidebar
// menautkan langsung ke tiap tab via sub-path (/settings, /settings/apikeys,
// /settings/webhooks) — RELASI: app/nav.ts & app/router.tsx.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api/client";
import type { ApiKey, Webhook } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Label, FieldHint } from "@/components/ui/fields";
import { Tabs } from "@/components/ui/Tabs";
import { Table, Th, Td } from "@/components/ui/Table";
import { useDialog } from "@/app/providers/DialogProvider";
import { useToast } from "@/app/providers/ToastProvider";

const TABS = [
  { key: "", label: "Umum" },
  { key: "apikeys", label: "API Keys" },
  { key: "webhooks", label: "Webhooks" },
];

export function SettingsPage() {
  const { tab = "" } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <Tabs items={TABS} value={tab} onChange={(k) => navigate(k ? `/settings/${k}` : "/settings")} />
      {tab === "" && <GeneralTab />}
      {tab === "apikeys" && <ApiKeysTab />}
      {tab === "webhooks" && <WebhooksTab />}
    </div>
  );
}

function GeneralTab() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "Workspace Demo", domain: "" });

  return (
    <Card className="max-w-2xl">
      <CardHeader title="Profil tenant" description="Identitas situs/workspace ini" />
      <CardBody className="space-y-4">
        <div>
          <Label htmlFor="tname">Nama tenant</Label>
          <Input id="tname" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="tdomain">Custom domain</Label>
          <Input id="tdomain" value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} placeholder="blog.perusahaan.com" />
          <FieldHint>
            Arahkan CNAME ke edge platform; TLS diterbitkan otomatis setelah verifikasi.
          </FieldHint>
        </div>
        <div className="pt-1">
          <Button onClick={() => toast.success("Pengaturan disimpan.")}>Simpan Perubahan</Button>
          {/* NEXT: PATCH /tenants/current saat backend modul tenant hidup. */}
        </div>
      </CardBody>
    </Card>
  );
}

function ApiKeysTab() {
  const dialog = useDialog();
  const [keys, setKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    void api.get<ApiKey[]>("/apikeys").then((r) => setKeys(r.data));
  }, []);

  const onCreate = async () => {
    // NEXT: POST /apikeys — plaintext key tampil SEKALI di modal sukses,
    // lalu hanya prefix yang tersimpan (konsep keamanan backend 08 §4).
    await dialog.alert({
      tone: "info",
      title: "Pembuatan key menyusul",
      text: "Endpoint API key aktif bersama backend. Key hanya akan ditampilkan sekali saat dibuat.",
    });
  };

  return (
    <Card>
      <CardHeader
        title="API Keys"
        description="Kredensial frontend/integrasi untuk membaca konten published"
        actions={<Button size="sm" onClick={() => void onCreate()}>Buat Key</Button>}
      />
      <Table>
        <thead>
          <tr>
            <Th>Nama</Th><Th>Key</Th><Th>Scope</Th><Th>Terakhir dipakai</Th><Th>Dibuat</Th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k.id} className="hover:bg-surface2/50">
              <Td className="font-medium">{k.name}</Td>
              <Td><code className="rounded bg-surface2 px-2 py-0.5 text-xs">{k.prefix}</code></Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {k.scopes.map((s) => <Badge key={s} tone="info">{s}</Badge>)}
                </div>
              </Td>
              <Td className="text-ink3">{formatDate(k.last_used_at)}</Td>
              <Td className="text-ink3">{formatDate(k.created_at)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function WebhooksTab() {
  const [hooks, setHooks] = useState<Webhook[]>([]);

  useEffect(() => {
    void api.get<Webhook[]>("/webhooks").then((r) => setHooks(r.data));
  }, []);

  return (
    <Card>
      <CardHeader
        title="Webhooks"
        description="Jembatan automasi keluar: build hook frontend, Zapier/n8n, dsb."
      />
      <Table>
        <thead>
          <tr><Th>URL</Th><Th>Event</Th><Th>Status</Th></tr>
        </thead>
        <tbody>
          {hooks.map((h) => (
            <tr key={h.id} className="hover:bg-surface2/50">
              <Td className="max-w-md truncate font-mono text-xs">{h.url}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {h.events.map((e) => <Badge key={e} tone="neutral">{e}</Badge>)}
                </div>
              </Td>
              <Td><Badge tone={h.is_active ? "ok" : "neutral"}>{h.is_active ? "Aktif" : "Nonaktif"}</Badge></Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* NEXT: form tambah webhook + log pengiriman (webhook_deliveries)
          dengan status retry — RELASI: backend modul webhook/jobs. */}
    </Card>
  );
}
