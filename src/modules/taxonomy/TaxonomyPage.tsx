// Taxonomy & term berjenjang: daftar taxonomy di kiri, pohon term di kanan,
// tambah term via Modal (basis modal yang sama dengan sweet-alert).
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import type { Taxonomy, Term } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Label, Select } from "@/components/ui/fields";
import { Icon } from "@/components/ui/icons";
import { Modal } from "@/components/modal/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/Tabs";
import { useToast } from "@/app/providers/ToastProvider";

export function TaxonomyPage() {
  const toast = useToast();
  const [taxonomies, setTaxonomies] = useState<Taxonomy[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTerm, setNewTerm] = useState({ name: "", parent_id: "" });

  useEffect(() => {
    void api.get<Taxonomy[]>("/taxonomies").then((r) => {
      setTaxonomies(r.data);
      setActiveId((cur) => cur ?? r.data[0]?.id ?? null);
    });
  }, []);

  const loadTerms = useCallback(async (taxId: string) => {
    const r = await api.get<Term[]>(`/taxonomies/${taxId}/terms`);
    setTerms(r.data);
  }, []);

  useEffect(() => {
    if (activeId) void loadTerms(activeId);
  }, [activeId, loadTerms]);

  const active = taxonomies?.find((t) => t.id === activeId) ?? null;

  // Susun pohon term (parent → anak) utk render berjenjang.
  const tree = useMemo(() => {
    const roots = terms.filter((t) => !t.parent_id);
    const childrenOf = (id: string) => terms.filter((t) => t.parent_id === id);
    return { roots, childrenOf };
  }, [terms]);

  const addTerm = async () => {
    if (!activeId || !newTerm.name.trim()) return;
    await api.post(`/taxonomies/${activeId}/terms`, {
      name: newTerm.name.trim(),
      parent_id: newTerm.parent_id || null,
    });
    toast.success(`Term “${newTerm.name}” ditambahkan.`);
    setShowAdd(false);
    setNewTerm({ name: "", parent_id: "" });
    void loadTerms(activeId);
  };

  if (!taxonomies) return <PageLoader />;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Daftar taxonomy */}
      <Card>
        <CardHeader title="Taxonomy" description="Kategori hierarkis atau tag datar" />
        <CardBody className="space-y-1.5">
          {taxonomies.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors",
                t.id === activeId
                  ? "border-accent bg-accent-soft font-medium text-accent"
                  : "border-line hover:bg-surface2",
              )}
            >
              <span>{t.name}</span>
              <Badge tone={t.is_hierarchical ? "info" : "neutral"}>
                {t.is_hierarchical ? "Hierarkis" : "Datar"}
              </Badge>
            </button>
          ))}
          {/* NEXT: form tambah taxonomy kustom (POST /taxonomies) — jarang
              dipakai, ditunda agar laman tetap sederhana. */}
        </CardBody>
      </Card>

      {/* Pohon term */}
      <Card className="lg:col-span-2">
        <CardHeader
          title={active ? `Term — ${active.name}` : "Term"}
          actions={
            <Button size="sm" onClick={() => setShowAdd(true)} disabled={!active}>
              <Icon name="plus" className="size-3.5" /> Tambah Term
            </Button>
          }
        />
        <CardBody>
          {terms.length === 0 ? (
            <EmptyState title="Belum ada term" description="Tambahkan term pertama untuk taxonomy ini." />
          ) : (
            <ul className="space-y-1">
              {tree.roots.map((root) => (
                <TermNode key={root.id} term={root} childrenOf={tree.childrenOf} depth={0} />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Modal tambah term */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Term" size="md">
        <div className="space-y-4">
          <div>
            <Label htmlFor="tname">Nama term</Label>
            <Input id="tname" value={newTerm.name} onChange={(e) => setNewTerm((s) => ({ ...s, name: e.target.value }))} placeholder="mis. Tutorial" />
          </div>
          {active?.is_hierarchical && (
            <div>
              <Label htmlFor="tparent">Induk (opsional)</Label>
              <Select id="tparent" value={newTerm.parent_id} onChange={(e) => setNewTerm((s) => ({ ...s, parent_id: e.target.value }))}>
                <option value="">— Tanpa induk —</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAdd(false)}>Batal</Button>
            <Button onClick={() => void addTerm()}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TermNode({
  term,
  childrenOf,
  depth,
}: {
  term: Term;
  childrenOf: (id: string) => Term[];
  depth: number;
}) {
  const children = childrenOf(term.id);
  return (
    <li>
      <div
        className="flex items-center gap-2.5 rounded-lg border border-line px-3.5 py-2.5 text-sm hover:bg-surface2"
        style={{ marginLeft: depth * 24 }}
      >
        {depth > 0 && <Icon name="chevron-right" className="size-3.5 text-ink3" />}
        <Icon name="list-tree" className="size-4 text-accent" />
        <span className="font-medium">{term.name}</span>
        <span className="text-xs text-ink3">/{term.slug}</span>
      </div>
      {children.length > 0 && (
        <ul className="mt-1 space-y-1">
          {children.map((c) => (
            <TermNode key={c.id} term={c} childrenOf={childrenOf} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
