"use client";

import type { ComponentProps, ReactNode } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import AdminDirectoryToolbar from "@/app/admin/_components/AdminDirectoryToolbar";
import {
  Field,
  Modal,
  PageHeading,
  Pagination,
  StatCard,
  StatusBadge,
  adminStyles as s,
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
  if (variant === "student") {
    return (
      <div className={s.studentStatCard}>
        <div className={`${s.statIcon} ${s[`tone_${item.tone}`]}`}>
          <AdminIcon name={item.icon} size={20} />
        </div>
        <div className={s.studentStatContent}>
          <strong className={s.studentStatValue}>{item.value}</strong>
          <span className={s.studentStatLabel}>{item.label}</span>
        </div>
      </div>
    );
  }

  return <StatCard {...item} compact />;
}

export function ManagementToolbar(props: ComponentProps<typeof AdminDirectoryToolbar>) {
  return <AdminDirectoryToolbar {...props} />;
}

export function ManagementTable({
  children,
  tableClassName,
  className = "",
  footer,
}: {
  children: ReactNode;
  tableClassName: string;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <div className={`${styles.tableFrame} ${className}`}>
      <table className={tableClassName}>{children}</table>
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
