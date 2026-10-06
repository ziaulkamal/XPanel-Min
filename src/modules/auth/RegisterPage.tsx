import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldHint } from "@/components/ui/fields";
import { ApiError } from "@/lib/api/client";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", tenant: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.tenant);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Pendaftaran gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Daftar</h1>
      <p className="mt-1 text-sm text-ink3">Trial 14 hari — tanpa kartu kredit.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Nama lengkap</Label>
          <Input id="name" required value={form.name} onChange={set("name")} placeholder="Nama Anda" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} placeholder="nama@perusahaan.com" />
        </div>
        <div>
          <Label htmlFor="tenant">Nama situs / workspace</Label>
          <Input id="tenant" required value={form.tenant} onChange={set("tenant")} placeholder="mis. Blog Perusahaan" />
        </div>
        <div>
          <Label htmlFor="password">Kata sandi</Label>
          <Input id="password" type="password" required autoComplete="new-password" value={form.password} onChange={set("password")} placeholder="Minimal 8 karakter" />
        </div>

        {error && <FieldHint error>{error}</FieldHint>}

        <Button type="submit" loading={loading} className="w-full">
          Buat akun
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink3">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="font-medium text-accent hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
