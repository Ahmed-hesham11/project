"use client";

import { ArrowDownUp } from "lucide-react";

import { CourseLevel, PriceFilter, SortOption } from "./course-dashboard.types";

interface CourseFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  priceFilter: PriceFilter;
  onPriceFilterChange: (value: PriceFilter) => void;
  levelFilter: "all" | CourseLevel;
  onLevelFilterChange: (value: "all" | CourseLevel) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
}

export function CourseFilterBar({
  search,
  onSearchChange,
  priceFilter,
  onPriceFilterChange,
  levelFilter,
  onLevelFilterChange,
  sortBy,
  onSortByChange,
}: CourseFilterBarProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_200px_180px]">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title, category, grade..."
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-secondary)] outline-none transition focus:border-[var(--primary-light)]"
        />

        <select
          value={priceFilter}
          onChange={(event) => onPriceFilterChange(event.target.value as PriceFilter)}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-secondary)] outline-none transition focus:border-[var(--primary-light)]"
        >
          <option value="all">All Pricing</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        <select
          value={levelFilter}
          onChange={(event) => onLevelFilterChange(event.target.value as "all" | CourseLevel)}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-secondary)] outline-none transition focus:border-[var(--primary-light)]"
        >
          <option value="all">All Grades</option>
          <option value="Beginner">1st Secondary</option>
          <option value="Intermediate">2nd Secondary</option>
          <option value="Advanced">3rd Secondary</option>
        </select>

        <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-secondary)]">
          <ArrowDownUp className="h-4 w-4" />
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as SortOption)}
            className="h-11 w-full bg-transparent outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </label>
      </div>
    </div>
  );
}
