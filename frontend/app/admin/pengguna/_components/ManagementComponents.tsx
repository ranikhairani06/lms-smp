"use client";

import type { ComponentProps, ReactNode } from "react";
import AdminDirectoryToolbar from "@/app/admin/_components/AdminDirectoryToolbar";
import {
  Field,
  Modal,
  PageHeading,
  Pagination,
  StatCard,
  StatusBadge,
  type Tone,
} from "@/app/admin/_components/AdminUI";
import styles from "./management.module.css";

export function ManagementPageHeader(props: ComponentProps<typeof PageHeading>) {
  return <PageHeading {...props} />;
}

export type ManagementStat = {
  label: string;
  value: string;
  icon: string;
  tone: Tone;
};

export function ManagementStatCard({
  item,
  variant = "directory",
}: {
  item: ManagementStat;
  variant?: "directory" | "student";
}) {
  // Bagian tampilan: varian siswa menempatkan angka di atas label statistik.
  return (
    <StatCard
      {...item}
      compact
      valueFirst={variant === "student"}
      valueTone={variant === "student" && item.tone === "warning" ? "warning" : variant === "student" && item.tone === "danger" ? "danger" : undefined}
    />
  );
}

export function ManagementToolbar(props: ComponentProps<typeof AdminDirectoryToolbar>) {
  return <AdminDirectoryToolbar {...props} />;
}

export function ManagementTable({
  children,
  tableClassName,
  className = "",
  footer,
  variant = "default",
}: {
  children: ReactNode;
  tableClassName: string;
  className?: string;
  footer?: ReactNode;
  variant?: "default" | "student";
}) {
  return (
    <div className={`${styles.tableFrame} ${className} ${variant === "student" ? styles.studentTableFrame : ""}`}>
      <table className={`${tableClassName} ${styles.managementTable} ${variant === "student" ? styles.studentDirectoryTable : ""}`}>{children}</table>
      {footer}
    </div>
  );
}

export function ManagementStatusBadge(props: ComponentProps<typeof StatusBadge>) {
  return <StatusBadge {...props} />;
}

export function ManagementActionButtons({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${styles.actionButtons} ${className}`}>{children}</div>;
}

export function ManagementPagination(props: ComponentProps<typeof Pagination>) {
  return <Pagination {...props} />;
}

export function ManagementModal(props: ComponentProps<typeof Modal>) {
  return <Modal {...props} />;
}

export function ManagementFormField(props: ComponentProps<typeof Field>) {
  return <Field {...props} />;
}
