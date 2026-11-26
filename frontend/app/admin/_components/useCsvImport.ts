"use client";

import { useState } from "react";

type CsvImportResult = {
  importedCount?: number;
  message?: string;
  rowErrorSummary: string;
  response: unknown;
};

type CsvImportOptions = {
  endpoint?: string;
  entityLabel: string;
  onSuccess?: (result: CsvImportResult) => void | Promise<void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getImportPayload(response: unknown) {
  if (!isRecord(response)) return {};
  return isRecord(response.data) ? response.data : response;
}

function getImportedCount(response: unknown): number | undefined {
  const payload = getImportPayload(response);
  const count = payload.imported_count ?? payload.imported ?? payload.success_count ?? payload.successful;
  return typeof count === "number" && Number.isFinite(count) ? count : undefined;
}

function getRowErrorSummary(response: unknown): string {
  const payload = getImportPayload(response);
  const failures = payload.failures;
  if (Array.isArray(failures) && failures.length > 0) {
    const lines = failures.slice(0, 3).map((failure, index) => {
      if (!isRecord(failure)) return `Baris ${index + 1}: data tidak valid.`;
      const row = typeof failure.row === "number" ? failure.row : typeof failure.row_number === "number" ? failure.row_number : index + 1;
      const errors = Array.isArray(failure.errors) ? failure.errors.filter((item): item is string => typeof item === "string") : [];
      return `Baris ${row}: ${errors.join(", ") || "data tidak valid."}`;
    });
    return `${lines.join(" ")}${failures.length > 3 ? ` Dan ${failures.length - 3} baris lainnya.` : ""}`;
  }

  const errors = payload.errors;
  if (isRecord(errors)) {
    const messages = Object.entries(errors).flatMap(([field, messages]) =>
      Array.isArray(messages) ? messages.filter((item): item is string => typeof item === "string").map((message) => `${field}: ${message}`) : [],
    );
    return messages.slice(0, 3).join(" ");
  }
  return "";
}

function responseMessage(response: unknown): string | undefined {
  if (!isRecord(response)) return undefined;
  if (typeof response.message === "string") return response.message;
  return isRecord(response.data) && typeof response.data.message === "string" ? response.data.message : undefined;
}

// Bagian perilaku: validasi CSV, unggah, dan ringkasan hasil bersama untuk direktori admin.
export default function useCsvImport({ endpoint, entityLabel, onSuccess }: CsvImportOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rowErrorSummary, setRowErrorSummary] = useState("");

  const importFile = async (file: File | null) => {
    setError("");
    setSuccess("");
    setRowErrorSummary("");
    if (!file) return;

    const isCsvExtension = file.name.toLowerCase().endsWith(".csv");
    const acceptedTypes = ["text/csv", "application/csv"];
    const mimeType = file.type.split(";")[0].trim().toLowerCase();
    if (!isCsvExtension || (mimeType !== "" && !acceptedTypes.includes(mimeType))) {
      setError("File tidak sesuai format. Pilih file CSV (.csv).");
      return;
    }
    let fileContents = "";
    try {
      fileContents = await file.text();
    } catch {
      setError("File CSV tidak dapat dibaca. Pilih file lain lalu coba lagi.");
      return;
    }
    if (file.size === 0 || !fileContents.trim()) {
      setError("File CSV kosong. Pilih file yang berisi data.");
      return;
    }
    if (!endpoint) {
      setError(`Import CSV ${entityLabel} belum tersedia karena endpoint backend belum disediakan.`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/${endpoint.replace(/^\/+|\/+$/g, "")}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: formData,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const rowErrors = getRowErrorSummary(payload);
        if (rowErrors) setRowErrorSummary(rowErrors);
        const responseText = responseMessage(payload);
        const message = rowErrors
          ? `Data CSV tidak lolos validasi: ${rowErrors}`
          : responseText ?? `Import CSV ${entityLabel} gagal (HTTP ${response.status}).`;
        throw new Error(message);
      }

      const result: CsvImportResult = {
        importedCount: getImportedCount(payload),
        message: responseMessage(payload),
        rowErrorSummary: getRowErrorSummary(payload),
        response: payload,
      };
      setSuccess(result.message ?? (result.importedCount === undefined
        ? `Import CSV ${entityLabel} berhasil.`
        : `${result.importedCount} ${entityLabel} berhasil diimpor.`));
      setRowErrorSummary(result.rowErrorSummary);
      await onSuccess?.(result);
    } catch (uploadError) {
      setError(uploadError instanceof TypeError
        ? "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi."
        : uploadError instanceof Error ? uploadError.message : `Import CSV ${entityLabel} gagal. Periksa koneksi lalu coba lagi.`);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, rowErrorSummary, importFile };
}
