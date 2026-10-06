import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldHint } from "@/components/ui/fields";
import { ApiError } from "@/lib/api/client";
import { CONFIG } from "@/lib/config";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/api/mock";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Masuk</h1>
      <p className="mt-1 text-sm text-ink3">Kelola konten dan tim Anda dari satu panel.</p>

      {CONFIG.useMock && (
        <div className="mt-4 rounded-lg border border-accent/30 bg-accent-soft px-3.5 py-2.5 text-xs text-ink2">
          Mode demo (mock) aktif — masuk dengan <b>{DEMO_EMAIL}</b> / <b>{DEMO_PASSWORD}</b>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email" type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@perusahaan.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Kata sandi</Label>
            <Link to="/auth/forgot" className="mb-1.5 text-xs text-accent hover:underline">
              Lupa sandi?
            </Link>
          </div>
          <Input
            id="password" type="password" required autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <FieldHint error>{error}</FieldHint>}

        <Button type="submit" loading={loading} className="w-full">
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink3">
        Belum punya akun?{" "}
        <Link to="/auth/register" className="font-medium text-accent hover:underline">
          Daftar & mulai trial
        </Link>
      </p>
    </div>
  );
}
