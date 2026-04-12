-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "unlocksLessonId" TEXT;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "unlocksLessonId" TEXT;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_unlocksLessonId_fkey" FOREIGN KEY ("unlocksLessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_unlocksLessonId_fkey" FOREIGN KEY ("unlocksLessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
