"use client";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

export type SavedMaterial = { id: string; subject: string; title: string; description: string; content: string; topic: string; targets: string[]; files: string[]; status: string };
export type Question = { id: number; type: string; text: string; weight: number; options: string[]; answer: string };
export type SavedAssessment = { id: string; subject: string; title: string; type: string; instructions: string; targets: string[]; start: string; end: string; questions: Question[]; status: string };
type Workspace = { materials: SavedMaterial[]; assessments: SavedAssessment[]; grades: Record<string, { scores: number[]; feedback: string }>; read: string[]; closed: string[] };
const initial: Workspace = { materials: [], assessments: [], grades: {}, read: [], closed: [] };
const StoreContext = createContext<{ data: Workspace; save: (update: Partial<Workspace>) => void }>({ data: initial, save: () => {} });
const serverSnapshot = () => null;
export function TeacherDataProvider({ userId, children }: { userId: number; children: ReactNode }) {
  const key = `eduspace-teacher-preview-v1-${userId}`;
  const subscribe = useCallback((callback: () => void) => { window.addEventListener("storage", callback); window.addEventListener("teacher-preview", callback); return () => { window.removeEventListener("storage", callback); window.removeEventListener("teacher-preview", callback); }; }, []);
  const snapshot = useCallback(() => { try { return localStorage.getItem(key); } catch { return null; } }, [key]);
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const data = useMemo<Workspace>(() => { try { const value = JSON.parse(raw || "null"); return value && Array.isArray(value.materials) && Array.isArray(value.assessments) && Array.isArray(value.read) && Array.isArray(value.closed) && value.grades ? value : initial; } catch { return initial; } }, [raw]);
  const save = (update: Partial<Workspace>) => { localStorage.setItem(key, JSON.stringify({ ...data, ...update })); window.dispatchEvent(new Event("teacher-preview")); };
  return <StoreContext.Provider value={{ data, save }}>{children}</StoreContext.Provider>;
}
export const useTeacherData = () => useContext(StoreContext);
