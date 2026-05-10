import { redirect } from "next/navigation";

export default async function ShortMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/menu/${slug}`);
}
