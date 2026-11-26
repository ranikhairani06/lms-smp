import type { ReactNode } from "react";
import AdminIcon from "./AdminIcons";
import { AdminTableIconButton, Button, StatusBadge, type Tone } from "./AdminUI";
import styles from "./AdminReusableRows.module.css";

// Bagian tampilan: badge rombel ringkas untuk sel tabel.
export function RombelBadge({ children }: { children: ReactNode }) {
  return <span className={styles.rombelBadge}>{children}</span>;
}

// Bagian tampilan: tombol ikon tabel menggunakan gaya admin yang sudah tersedia.
export const IconActionButton = AdminTableIconButton;

// Bagian tampilan: tombol kecil untuk aksi membuka kunci akun.
export function UnlockButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button className={styles.unlockButton} onClick={onClick}>{label}</Button>;
}

export type StudentRowProps = {
  nisn: string;
  name: string;
  classLabel: string;
  gender: string;
  status: string;
  statusTone: Tone;
  activity: string;
  onView: () => void;
  onEdit: () => void;
  onUnlock?: () => void;
  unlockLabel: string;
  viewLabel: string;
  editLabel: string;
};

// Bagian tampilan: baris manajemen siswa; track kolom diwarisi dari grid induk.
export function StudentRow({
  nisn,
  name,
  classLabel,
  gender,
  status,
  statusTone,
  activity,
  onView,
  onEdit,
  onUnlock,
  unlockLabel,
  viewLabel,
  editLabel,
}: StudentRowProps) {
  return (
    <div className={styles.studentRow} role="row">
      <div className={styles.cell} role="cell">{nisn}</div>
      <div className={`${styles.cell} ${styles.strongCell}`} role="cell">{name}</div>
      <div className={styles.cell} role="cell"><RombelBadge>{classLabel}</RombelBadge></div>
      <div className={styles.cell} role="cell">{gender}</div>
      <div className={styles.cell} role="cell"><StatusBadge tone={statusTone} outlined>{status}</StatusBadge></div>
      <div className={styles.cell} role="cell">{activity}</div>
      <div className={`${styles.cell} ${styles.actionsCell}`} role="cell">
        {onUnlock && <UnlockButton label={unlockLabel} onClick={onUnlock} />}
        <div className={styles.actionGroup}>
          <IconActionButton icon="eye-linear" title={viewLabel} ariaLabel={viewLabel} onClick={onView} />
          <IconActionButton icon="pen-2-linear" title={editLabel} ariaLabel={editLabel} onClick={onEdit} />
        </div>
      </div>
    </div>
  );
}

export type AcademicPeriodRowProps = {
  icon: string;
  tone: Tone;
  title: string;
  subtitle: string;
  dateRange: string;
  roomCount: string;
  roomDetail?: string;
  status: string;
  statusTone: Tone;
  actions?: ReactNode;
};

// Bagian tampilan: ringkasan periode akademik dengan kolom dari grid induk.
export function AcademicPeriodRow({
  icon,
  tone,
  title,
  subtitle,
  dateRange,
  roomCount,
  roomDetail,
  status,
  statusTone,
  actions,
}: AcademicPeriodRowProps) {
  return (
    <div className={styles.periodRow} role="row">
      <div className={styles.periodTitleCell} role="cell">
        <span className={`${styles.periodIcon} ${styles[`tone_${tone}`]}`}><AdminIcon name={icon} /></span>
        <span className={styles.stackText}><strong>{title}</strong><small>{subtitle}</small></span>
      </div>
      <div className={styles.periodDate} role="cell"><AdminIcon name="calendar-linear" />{dateRange}</div>
      <div className={styles.periodRooms} role="cell"><strong>{roomCount}</strong>{roomDetail && <small>{roomDetail}</small>}</div>
      <div className={styles.cell} role="cell"><StatusBadge tone={statusTone}>{status}</StatusBadge></div>
      <div className={styles.periodActions} role="cell">{actions}</div>
    </div>
  );
}

export type ParentRowProps = {
  name: string;
  relationship: string;
  studentLabel: string;
  phone: string;
  status: string;
  statusTone: Tone;
  lastAccess: string;
  onView: () => void;
  onEdit: () => void;
  onHistory: () => void;
  viewLabel: string;
  editLabel: string;
  historyLabel: string;
};

// Bagian tampilan: baris orang tua/wali dengan badge siswa terhubung dan aksi.
export function ParentRow({
  name,
  relationship,
  studentLabel,
  phone,
  status,
  statusTone,
  lastAccess,
  onView,
  onEdit,
  onHistory,
  viewLabel,
  editLabel,
  historyLabel,
}: ParentRowProps) {
  return (
    <div className={styles.parentRow} role="row">
      <div className={styles.parentNameCell} role="cell"><strong>{name}</strong><small>{relationship}</small></div>
      <div className={styles.cell} role="cell"><span className={styles.studentLink}><AdminIcon name="square-academic-cap-linear" />{studentLabel}</span></div>
      <div className={styles.cell} role="cell">{phone}</div>
      <div className={styles.cell} role="cell"><StatusBadge tone={statusTone}>{status}</StatusBadge></div>
      <div className={styles.cell} role="cell">{lastAccess}</div>
      <div className={`${styles.cell} ${styles.actionGroup}`} role="cell">
        <IconActionButton className={styles.parentActionButton} icon="eye-linear" title={viewLabel} ariaLabel={viewLabel} onClick={onView} />
        <IconActionButton className={styles.parentActionButton} icon="pen-2-linear" title={editLabel} ariaLabel={editLabel} onClick={onEdit} />
        <IconActionButton className={styles.parentActionButton} icon="history-linear" title={historyLabel} ariaLabel={historyLabel} onClick={onHistory} />
      </div>
    </div>
  );
}

export type ClassSummaryItemProps = {
  classLabel: string;
  title: string;
  teacher: string;
  studentCountLabel: string;
  href?: string;
  detailsLabel: string;
  onDetails?: () => void;
};

// Bagian tampilan: item ringkasan kelas dengan tautan atau callback detail.
export function ClassSummaryItem({
  classLabel,
  title,
  teacher,
  studentCountLabel,
  href,
  detailsLabel,
  onDetails,
}: ClassSummaryItemProps) {
  const details = href ? (
    <a className={styles.detailsLink} href={href}>{detailsLabel}<AdminIcon name="arrow-right-linear" /></a>
  ) : (
    <button className={styles.detailsLink} type="button" onClick={onDetails}>{detailsLabel}<AdminIcon name="arrow-right-linear" /></button>
  );

  return (
    <div className={styles.classSummaryItem}>
      <span className={styles.classLabel}>{classLabel}</span>
      <span className={styles.stackText}><strong>{title}</strong><small>{teacher}</small></span>
      <span className={styles.studentCount}>{studentCountLabel}</span>
      {details}
    </div>
  );
}
