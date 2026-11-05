import { Suspense } from "react";
import { Subjects } from "../_components/screens";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <Subjects />
    </Suspense>
  );
}
