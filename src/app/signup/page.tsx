import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Kayıt Ol</h1>
          <p className="text-muted-foreground text-sm">
            Ücretsiz hesap oluşturun, hemen başlayın
          </p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
