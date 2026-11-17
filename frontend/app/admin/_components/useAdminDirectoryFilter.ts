"use client";

import { useMemo, useState } from "react";

type AdminDirectoryFilterOptions<T> = {
  items: T[];
  getSearchText: (item: T) => string;
  matchesCategory: (item: T, category: string) => boolean;
  initialCategory: string;
};

export default function useAdminDirectoryFilter<T>({
  items,
  getSearchText,
  matchesCategory,
  initialCategory,
}: AdminDirectoryFilterOptions<T>) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const filtered = useMemo(() => items.filter((item) => (
    getSearchText(item).toLowerCase().includes(keyword.toLowerCase())
    && matchesCategory(item, category)
  )), [items, getSearchText, matchesCategory, keyword, category]);

  return { keyword, setKeyword, category, setCategory, filtered };
}
