import type { ReactNode } from "react";
import styles from "./state.module.css";

type StateProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: StateProps) {
  return (
    <section className={styles.errorState} role="alert">
      <svg
        className={styles.errorIcon}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 3.5 21 19a1 1 0 0 1-.87 1.5H3.87A1 1 0 0 1 3 19l9-15.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
      </svg>
      <div className={styles.stateContent}>
        <p className="text-l12 fw-bold">Terjadi kesalahan</p>
        <h2 className="text-h5 fw-bold">{title}</h2>
        {description ? <div className={`text-p16 ${styles.description}`}>{description}</div> : null}
        {action ? <div className={styles.stateActions}>{action}</div> : null}
      </div>
    </section>
  );
}

export function EmptyState({ title, description, action }: StateProps) {
  return (
    <section className={styles.emptyState}>
      <svg
        className={styles.emptyIcon}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2h7A2.5 2.5 0 0 1 21 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-10Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <h2 className="text-h5">{title}</h2>
      {description ? <div className={`text-p16 ${styles.description}`}>{description}</div> : null}
      {action ? <div className={styles.stateActions}>{action}</div> : null}
    </section>
  );
}

export function LoadingState({
  title = "Memuat...",
  description,
  action,
}: Partial<StateProps> = {}) {
  return (
    <section
      className={styles.loadingState}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className={styles.spinner} aria-hidden="true" />
      <div className={styles.stateContent}>
        <h2 className="text-h5">{title}</h2>
        {description ? <div className={`text-p16 ${styles.description}`}>{description}</div> : null}
        {action ? <div className={styles.stateActions}>{action}</div> : null}
      </div>
    </section>
  );
}
