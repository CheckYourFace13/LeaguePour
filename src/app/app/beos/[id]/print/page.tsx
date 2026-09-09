import { redirect } from "next/navigation";

// This route used to render its own (invalid) nested <html>/<body> with an onClick handler
// directly in a Server Component - a hard server error on every real request. Moved to
// src/app/beo-print/[id] (its own top-level route, outside the VenueSprocket dashboard shell).
// Kept as a redirect so any existing bookmark/link still works.
export default async function LegacyBeoPrintRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/beo-print/${id}`);
}
