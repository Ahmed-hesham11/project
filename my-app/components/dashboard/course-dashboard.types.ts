import { Course } from "@/types/course";

export type CourseLevel = Course["level"];

export type SortOption = "newest" | "price-low" | "price-high";
export type PriceFilter = "all" | "free" | "paid";

export interface CourseStatusMap {
  [courseId: string]: boolean;
}
