"use client";

import { useEffect, useState } from "react";

export type QuizAttempt = {
  answers: Record<number, number>;
  submitted: boolean;
  duration: number;
  submittedAt?: string;
  serverScore?: number | null;
  serverStatus?: string;
  passingScore?: number | null;
};

const UPDATE_EVENT = "eduspace:quiz-updated";

export function readQuizAttempts(
  subject: string,
  quiz: string,
): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(
      `eduspace-student:${subject}:${quiz}:attempts`,
    );

    if (!raw) return [];

    const saved = JSON.parse(raw);

    // Membaca data lama yang sebelumnya tersimpan sebagai satu hasil
    return Array.isArray(saved) ? saved : saved?.submitted ? [saved] : [];
  } catch {
    return [];
  }
}

export function saveQuizAttempt(
  subject: string,
  quiz: string,
  attempt: QuizAttempt,
) {
  const key = `eduspace-student:${subject}:${quiz}:attempts`;
  const attempts = readQuizAttempts(subject, quiz);

  localStorage.setItem(key, JSON.stringify([...attempts, attempt]));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function readBestQuizAttempt(
  subject: string,
  quiz: string,
): QuizAttempt | null {
  const attempts = readQuizAttempts(subject, quiz).filter(
    (attempt) => attempt.submitted && typeof attempt.serverStatus === "string" && typeof attempt.submittedAt === "string",
  );

  return attempts.reduce<QuizAttempt | null>((best, current) => {
    if (!best) return current;

    const currentScore = current.serverScore ?? -1;
    const bestScore = best.serverScore ?? -1;

    // Kalau nilainya sama, gunakan percobaan yang lebih baru
    if (currentScore > bestScore) return current;
    if (
      currentScore === bestScore &&
      current.submittedAt &&
      best.submittedAt &&
      current.submittedAt > best.submittedAt
    ) {
      return current;
    }

    return best;
  }, null);
}

export function useQuizAttempt(subject: string, quiz: string) {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const refresh = () => {
      setAttempt(readBestQuizAttempt(subject, quiz));
    };

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(UPDATE_EVENT, refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(UPDATE_EVENT, refresh);
    };
  }, [subject, quiz]);

  return attempt;
}
