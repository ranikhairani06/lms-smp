import { Suspense } from "react";
import { QuizResult } from "../../../../../_components/quiz";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <QuizResult />
    </Suspense>
  );
}
