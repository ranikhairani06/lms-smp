import { Suspense } from "react";
import { LearningProgress } from "../_components/screens";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <LearningProgress />
    </Suspense>
  );
}
