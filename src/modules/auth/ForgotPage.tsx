import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/fields";
import { useDialog } from "@/app/providers/DialogProvider";

export function ForgotPage() {
  const dialog = useDialog();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // NEXT: endpoint POST /auth/forgot di backend (kirim email reset bertoken);
    // sementara tampilkan konfirmasi generik — tidak membocorkan ada/tidaknya akun.
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    await dialog.alert({
      tone: "success",
      title: "Permintaan terkirim",
      text: `Jika ${email} terdaftar, tautan reset akan dikirim ke email tersebut.`,
    });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Lupa kata sandi</h1>
      <p className="mt-1 text-sm text-ink3">Masukkan email akun Anda; kami kirimkan tautan reset.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@perusahaan.com" />
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Kirim tautan reset
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink3">
        <Link to="/auth/login" className="font-medium text-accent hover:underline">
          ← Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  );
}
