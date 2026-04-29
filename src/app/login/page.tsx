import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Giriş Yap</h1>
          <p className="text-muted-foreground text-sm">Hesabınıza giriş yapın</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
