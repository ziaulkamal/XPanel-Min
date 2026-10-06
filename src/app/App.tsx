// Komposisi provider (urutan: Theme → Auth → Toast → Dialog) + router.
// Pola yang sama dengan cmd/api/main.go di backend: komposisi hanya di sini.
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastProvider } from "./providers/ToastProvider";
import { DialogProvider } from "./providers/DialogProvider";
import { router } from "./router";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <DialogProvider>
            <RouterProvider router={router} />
          </DialogProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
