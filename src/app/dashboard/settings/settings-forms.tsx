"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateProfile, updateBusinessInfo } from "@/lib/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function SettingsForms({
  fullName, email, businessName, phone, address,
}: {
  fullName: string; email: string; businessName: string; phone: string; address: string;
}) {
  const [profilePending, startProfile] = useTransition();
  const [bizPending, startBiz] = useTransition();

  function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startProfile(async () => {
      try {
        await updateProfile(fd);
        toast.success("Profil güncellendi");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleBiz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startBiz(async () => {
      try {
        await updateBusinessInfo(fd);
        toast.success("İşletme bilgileri güncellendi");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Ad Soyad</Label>
              <Input id="full_name" name="full_name" defaultValue={fullName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" defaultValue={email} disabled />
              <p className="text-xs text-muted-foreground">E-posta değiştirilemez</p>
            </div>
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İşletme Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBiz} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">İşletme Adı</Label>
              <Input id="business_name" name="business_name" defaultValue={businessName} placeholder="örn. Güzellik Salonu Ayşe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={phone} placeholder="+90 555 000 00 00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input id="address" name="address" defaultValue={address} placeholder="İşletme adresi" />
            </div>
            <Button type="submit" disabled={bizPending}>
              {bizPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Tehlikeli Bölge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Hesabınızı sildiğinizde tüm veriler kalıcı olarak silinir.
          </p>
          <Button variant="destructive" disabled>Hesabı Sil</Button>
        </CardContent>
      </Card>
    </>
  );
}
