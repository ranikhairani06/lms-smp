"use client";

import { useEffect, useState } from "react";
import { questions } from "./data";

export type QuizAttempt = {
  answers: Record<number, number>;
  submitted: boolean;
  duration: number;
  submittedAt?: string;
};

const UPDATE_EVENT = "eduspace:quiz-updated";

export function readQuizAttempts(
  subject: string,
  quiz: string,
): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(
      `eduspace-demo:${subject}:${quiz}:attempts`,
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
  const key = `eduspace-demo:${subject}:${quiz}:attempts`;
  const attempts = readQuizAttempts(subject, quiz);

  localStorage.setItem(key, JSON.stringify([...attempts, attempt]));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function readBestQuizAttempt(
  subject: string,
  quiz: string,
): QuizAttempt | null {
  const attempts = readQuizAttempts(subject, quiz).filter(
    (attempt) => attempt.submitted,
  );

  return attempts.reduce<QuizAttempt | null>((best, current) => {
    if (!best) return current;

    const currentScore = quizScore(current.answers).score;
    const bestScore = quizScore(best.answers).score;

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

export function quizScore(answers: Record<number, number>) {
  const correct = questions.filter(
    (question, index) => answers[index] === question.answer,
  ).length;

  return {
    correct,
    total: questions.length,
    score: Math.round((correct / questions.length) * 100),
  };
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