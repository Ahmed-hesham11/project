import { MathCurrentCourses } from "@/components/sections/MathCurrentCourses";
import { MathFeatures } from "@/components/sections/MathFeatures";
import { MathHero } from "@/components/sections/MathHero";

export default function HomePage() {
  return (
    <>
      <MathHero />
      <MathFeatures />
      <MathCurrentCourses />
    </>
  );
}