import { Suspense } from "react";
import { SubjectDetail } from "../../_components/screens";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <SubjectDetail />
    </Suspense>
  );
}
