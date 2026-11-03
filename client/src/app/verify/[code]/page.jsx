import VerifyCertificate from "@/features/VerifyCertificate";

export const metadata = { title: "Verify certificate | Synapsis NSS" };

export default async function Page({ params }) {
  const { code } = await params;
  // key: remount on a new code so stale results never flash
  return <VerifyCertificate key={code} code={code.toUpperCase()} />;
}
