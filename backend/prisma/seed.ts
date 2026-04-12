import { PrismaClient, CourseLevel, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@waleed.com" },
    update: { passwordHash, role: UserRole.ADMIN },
    create: { email: "admin@waleed.com", passwordHash, role: UserRole.ADMIN },
  });
  const superAdminPasswordHash = await bcrypt.hash("SuperAdmin@12345", 12);
  await prisma.user.upsert({
    where: { email: "superadmin@waleed.com" },
    update: { passwordHash: superAdminPasswordHash, role: UserRole.SUPER_ADMIN },
    create: { email: "superadmin@waleed.com", passwordHash: superAdminPasswordHash, role: UserRole.SUPER_ADMIN },
  });
  await prisma.adminPermission.upsert({
    where: { adminId: admin.id },
    update: {
      canManageCourses: true,
      canManageUsers: true,
      canManageContent: true,
      canManagePayments: true,
    },
    create: {
      adminId: admin.id,
      canManageCourses: true,
      canManageUsers: true,
      canManageContent: true,
      canManagePayments: true,
    },
  });

  await prisma.mentor.upsert({
    where: { id: "mentor-waleed" },
    update: {},
    create: {
      id: "mentor-waleed",
      name: "وليد زيادي",
      role: "مدرس الرياضيات",
      bio: "شرح مبسط للرياضيات للمرحلة الثانوية.",
      avatar: "/images/avatar-user.svg",
    },
  });

  const courseInputs = [
    {
      id: "course-ui-foundations",
      slug: "geometry-foundations",
      title: "الهندسة الفراغية والمستوية",
      tagline: "شرح مبسط للهندسة مع تدريبات متدرجة ونماذج شاملة للمراجعة.",
      description:
        "كورس متكامل في الهندسة الفراغية والمستوية للمرحلة الثانوية يركز على الفهم والتأسيس.",
      category: "رياضيات",
      level: CourseLevel.BEGINNER,
      duration: "15 ساعة",
      lessonsCount: 38,
      students: 850,
      rating: 4.8,
      price: "79",
      image: "/images/course-ui-foundations.svg",
      featured: true,
      tags: ["هندسة", "تدريبات", "مراجعة"],
    },
    {
      id: "course-frontend-motion",
      slug: "calculus-first-term",
      title: "التفاضل والتكامل - الفصل الأول",
      tagline: "شرح متدرج للتفاضل والتكامل من الأساس وحتى أسئلة الامتحانات.",
      description:
        "كورس يشرح التفاضل والتكامل للفصل الأول بأسلوب واضح مع تدريبات كثيرة.",
      category: "رياضيات",
      level: CourseLevel.INTERMEDIATE,
      duration: "22 ساعة",
      lessonsCount: 52,
      students: 980,
      rating: 5,
      price: "99",
      image: "/images/course-frontend-motion.svg",
      featured: true,
      tags: ["تفاضل", "تكامل", "الفصل الأول"],
    },
    {
      id: "course-learning-products",
      slug: "advanced-algebra",
      title: "كورس الجبر المتقدم - توجيهي علمي",
      tagline: "تأسيس قوي في الجبر المتقدم مع تدريب على أصعب المسائل.",
      description:
        "كورس الجبر المتقدم لطلاب التوجيهي العلمي يركز على بناء الفهم وحل الأسئلة.",
      category: "رياضيات",
      level: CourseLevel.ADVANCED,
      duration: "18 ساعة",
      lessonsCount: 45,
      students: 1250,
      rating: 4.9,
      price: "129",
      image: "/images/course-learning-products.svg",
      featured: true,
      tags: ["جبر", "توجيهي", "متقدم"],
    },
  ];

  for (const input of courseInputs) {
    const course = await prisma.course.upsert({
      where: { slug: input.slug },
      update: {
        title: input.title,
        tagline: input.tagline,
        description: input.description,
        category: input.category,
        level: input.level,
        duration: input.duration,
        lessonsCount: input.lessonsCount,
        students: input.students,
        rating: input.rating,
        price: input.price,
        image: input.image,
        featured: input.featured,
        mentorId: "mentor-waleed",
      },
      create: {
        id: input.id,
        slug: input.slug,
        title: input.title,
        tagline: input.tagline,
        description: input.description,
        category: input.category,
        level: input.level,
        duration: input.duration,
        lessonsCount: input.lessonsCount,
        students: input.students,
        rating: input.rating,
        price: input.price,
        image: input.image,
        featured: input.featured,
        mentorId: "mentor-waleed",
      },
    });

    await prisma.courseTag.deleteMany({ where: { courseId: course.id } });
    await prisma.courseTag.createMany({
      data: input.tags.map((name) => ({ courseId: course.id, name })),
    });

    if (input.id === "course-learning-products") {
      await prisma.quizAttempt.deleteMany({
        where: { quiz: { lesson: { module: { courseId: course.id } } } },
      });
      await prisma.submission.deleteMany({
        where: { assignment: { lesson: { module: { courseId: course.id } } } },
      });
      await prisma.question.deleteMany({
        where: { quiz: { lesson: { module: { courseId: course.id } } } },
      });
      await prisma.quiz.deleteMany({
        where: { lesson: { module: { courseId: course.id } } },
      });
      await prisma.assignment.deleteMany({
        where: { lesson: { module: { courseId: course.id } } },
      });
      await prisma.lesson.deleteMany({
        where: { module: { courseId: course.id } },
      });
      await prisma.courseModule.deleteMany({ where: { courseId: course.id } });

      const moduleA = await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: "مفاهيم الجبر المتقدم",
          sortOrder: 1,
        },
      });

      const lesson1 = await prisma.lesson.create({
        data: {
          moduleId: moduleA.id,
          title: "المعادلات والمتباينات",
          description: "فيديو شرح + واجب + كويز",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration: "20 دقيقة",
          sortOrder: 1,
          isLocked: false,
        },
      });

      const lesson2 = await prisma.lesson.create({
        data: {
          moduleId: moduleA.id,
          title: "الاقترانات والتحويلات",
          description: "يفتح بعد إنهاء واجب وكويز الدرس السابق",
          videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
          duration: "22 دقيقة",
          sortOrder: 2,
          isLocked: false,
        },
      });

      await prisma.assignment.create({
        data: {
          lessonId: lesson1.id,
          title: "واجب الدرس الأول",
          description: "اكتب خطوات حل 3 مسائل",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const quiz = await prisma.quiz.create({
        data: {
          lessonId: lesson1.id,
          title: "Quiz 1",
        },
      });

      await prisma.question.createMany({
        data: [
          {
            quizId: quiz.id,
            questionText: "قيمة x في المعادلة x + 2 = 5",
            options: ["1", "2", "3", "4"],
            correctAnswer: "3",
          },
          {
            quizId: quiz.id,
            questionText: "حل المتباينة x > 7",
            options: ["x < 7", "x = 7", "x > 7", "x <= 7"],
            correctAnswer: "x > 7",
          },
        ],
      });

      await prisma.assignment.create({
        data: {
          lessonId: lesson2.id,
          title: "واجب الدرس الثاني",
          description: "حل تدريبات التحويلات",
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: {},
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
