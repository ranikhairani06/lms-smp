import { Suspense } from "react";
import { QuizIntro } from "../../../../_components/quiz";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <QuizIntro />
    </Suspense>
  );
}
