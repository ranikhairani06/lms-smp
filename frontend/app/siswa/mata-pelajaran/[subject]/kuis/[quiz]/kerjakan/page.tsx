import { Suspense } from "react";
import { QuizWork } from "../../../../../_components/quiz";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <QuizWork />
    </Suspense>
  );
}
