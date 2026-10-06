// Anggota tenant + undangan via Modal; role mengikuti hierarki RBAC backend.
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { Member, RoleSlug } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Label, Select, FieldHint } from "@/components/ui/fields";
import { Icon } from "@/components/ui/icons";
import { Modal } from "@/components/modal/Modal";
import { Table, Th, Td } from "@/components/ui/Table";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/app/providers/ToastProvider";

const ROLE_META: Record<RoleSlug, { label: string; tone: "info" | "ok" | "warn" | "neutral" }> = {
  owner: { label: "Owner", tone: "info" },
  admin: { label: "Admin", tone: "info" },
  editor: { label: "Editor", tone: "ok" },
  author: { label: "Author", tone: "ok" },
  contributor: { label: "Contributor", tone: "warn" },
  viewer: { label: "Viewer", tone: "neutral" },
};

export function MembersPage() {
  const toast = useToast();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState<{ email: string; role: RoleSlug }>({ email: "", role: "editor" });
  const [sending, setSending] = useState(false);

  const load = async () => {
    const r = await api.get<Member[]>("/users");
    setMembers(r.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const onInvite = async () => {
    if (!invite.email.includes("@")) return;
    setSending(true);
    try {
      await api.post("/users/invites", { email: invite.email, role_slug: invite.role });
      toast.success(`Undangan terkirim ke ${invite.email}.`);
      setShowInvite(false);
      setInvite({ email: "", role: "editor" });
      void load();
    } finally {
      setSending(false);
    }
  };

  if (!members) return <PageLoader />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Anggota"
          description={`${members.length} anggota aktif di tenant ini`}
          actions={
            <Button size="sm" onClick={() => setShowInvite(true)}>
              <Icon name="plus" className="size-3.5" /> Undang Anggota
            </Button>
          }
        />
        <Table>
          <thead>
            <tr>
              <Th>Nama</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Bergabung</Th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.user_id} className="hover:bg-surface2/50">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                      {m.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="font-medium">{m.name}</span>
                  </div>
                </Td>
                <Td className="text-ink2">{m.email}</Td>
                <Td>
                  <Badge tone={ROLE_META[m.role_slug].tone}>{ROLE_META[m.role_slug].label}</Badge>
                </Td>
                <Td className="text-ink3">{formatDate(m.joined_at)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {/* NEXT: ubah role & cabut akses per baris (dropdown aksi) + guard
            "owner terakhir tidak bisa diturunkan" — mengikuti aturan backend. */}
      </Card>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Undang Anggota" size="md">
        <div className="space-y-4">
          <div>
            <Label htmlFor="iemail">Email</Label>
            <Input id="iemail" type="email" value={invite.email} onChange={(e) => setInvite((s) => ({ ...s, email: e.target.value }))} placeholder="rekan@perusahaan.com" />
          </div>
          <div>
            <Label htmlFor="irole">Role</Label>
            <Select id="irole" value={invite.role} onChange={(e) => setInvite((s) => ({ ...s, role: e.target.value as RoleSlug }))}>
              <option value="admin">Admin — kelola tenant tanpa billing</option>
              <option value="editor">Editor — kelola semua konten</option>
              <option value="author">Author — tulis & terbitkan milik sendiri</option>
              <option value="contributor">Contributor — tulis draft saja</option>
              <option value="viewer">Viewer — hanya melihat</option>
            </Select>
            <FieldHint>Role Owner tidak dapat diberikan lewat undangan.</FieldHint>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowInvite(false)}>Batal</Button>
            <Button loading={sending} onClick={() => void onInvite()}>Kirim Undangan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
