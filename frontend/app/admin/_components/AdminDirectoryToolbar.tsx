"use client";

import { SearchField, SelectField, adminStyles as s } from "./AdminUI";

type AdminDirectoryToolbarProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  searchPlaceholder: string;
  category: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: string[];
  variant?: "default" | "student";
};

export default function AdminDirectoryToolbar({
  keyword,
  onKeywordChange,
  searchPlaceholder,
  category,
  onCategoryChange,
  categoryOptions,
  variant = "default",
}: AdminDirectoryToolbarProps) {
  return (
    <div className={`${s.toolbar} ${s.managementToolbar} ${variant === "student" ? s.managementToolbarStudent : ""}`}>
      <SearchField value={keyword} onChange={onKeywordChange} placeholder={searchPlaceholder} />
      <div className={s.toolbarSpacer} />
      <SelectField value={category} onChange={onCategoryChange} options={categoryOptions} />
    </div>
  );
}
