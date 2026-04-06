import { BookOpen } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { StudentCourseBrowser } from "@/components/dashboard/student-course-browser";
import type {
  Course,
  LearningBlock,
  LearningBlockCourse,
  Certificate,
} from "@/lib/types/database";
import type { CourseProgressInfo, CatalogSidebarData } from "@/components/dashboard/student-course-browser";

// ── Helpers ──────────────────────────────────────────────────────

function toDateStr(iso: string) {
  return iso.split("T")[0]; // YYYY-MM-DD
}

/**
 * Returns Mon-Fri of the ISO week that contains `today`.
 */
function currentWeekdays(today: Date): { label: string; date: Date }[] {
  const d = today.getDay(); // 0=Sun … 6=Sat
  const daysFromMonday = d === 0 ? 6 : d - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);

  return ["Mon", "Tue", "Wed", "Thu", "Fri"].map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { label, date };
  });
}

export async function StudentCourseCatalog() {
  const supabase = await createClient();

  // ── Auth ──────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Core data ─────────────────────────────────────────────────
  const [
    coursesRes,
    blocksRes,
    blockCoursesRes,
    lessonsRes,
    submissionsRes,
    progressRes,
    certificatesRes,
  ] = await Promise.all([
    supabase.from("courses").select("*").order("created_at", { ascending: true }),
    supabase.from("learning_blocks").select("*").order("order_index", { ascending: true }),
    supabase.from("learning_block_courses").select("*").order("order_index", { ascending: true }),
    supabase.from("lessons").select("id, course_id, title, order_index").order("order_index", { ascending: true }),
    user
      ? supabase.from("submissions").select("lesson_id").eq("student_id", user.id)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("lesson_progress").select("lesson_id, updated_at").eq("student_id", user.id)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("certificates").select("id, course_id, issued_at").eq("student_id", user.id).order("issued_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const courses = (coursesRes.data ?? []) as Course[];

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[1.75rem] bg-muted/50 px-6 py-16 text-center shadow-ambient">
        <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="font-display text-lg font-semibold">No courses yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Courses will appear here once an administrator adds them.
        </p>
      </div>
    );
  }

  // ── Learning path ─────────────────────────────────────────────
  const blocks = (blocksRes.data ?? []) as LearningBlock[];
  const blockCourses = (blockCoursesRes.data ?? []) as LearningBlockCourse[];

  const courseById = new Map<string, Course>();
  for (const c of courses) courseById.set(c.id, c);

  const coursesByBlock = new Map<string, Course[]>();
  for (const bc of blockCourses) {
    const c = courseById.get(bc.course_id);
    if (!c) continue;
    const existing = coursesByBlock.get(bc.block_id) ?? [];
    existing.push(c);
    coursesByBlock.set(bc.block_id, existing);
  }

  const learningPath = blocks
    .map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      courses: coursesByBlock.get(b.id) ?? [],
    }))
    .filter((b) => b.courses.length > 0);

  // ── Progress computation ──────────────────────────────────────
  type LessonRow = { id: string; course_id: string; title: string; order_index: number };
  const allLessons = (lessonsRes.data ?? []) as LessonRow[];

  const lessonsByCourse = new Map<string, LessonRow[]>();
  for (const l of allLessons) {
    const list = lessonsByCourse.get(l.course_id) ?? [];
    list.push(l);
    lessonsByCourse.set(l.course_id, list);
  }

  const submittedLessonIds = new Set(
    ((submissionsRes.data ?? []) as { lesson_id: string }[]).map((s) => s.lesson_id)
  );

  type ProgressRow = { lesson_id: string; updated_at: string };
  const progressRows = (progressRes.data ?? []) as ProgressRow[];
  const progressLessonIds = new Set(progressRows.map((p) => p.lesson_id));

  const courseProgressMap: Record<string, CourseProgressInfo> = {};
  for (const course of courses) {
    const lessons = lessonsByCourse.get(course.id) ?? [];
    const totalLessons = lessons.length;
    if (totalLessons === 0) {
      courseProgressMap[course.id] = {
        totalLessons: 0,
        submittedLessons: 0,
        pct: 0,
        firstLessonId: null,
        resumeLessonId: null,
      };
      continue;
    }
    const submittedLessons = lessons.filter((l) => submittedLessonIds.has(l.id)).length;
    const pct = Math.round((submittedLessons / totalLessons) * 100);
    const firstLessonId = lessons[0]?.id ?? null;
    // resume = most recent lesson with any activity (progress or submission)
    const lastActiveLesson = [...lessons]
      .reverse()
      .find((l) => progressLessonIds.has(l.id) || submittedLessonIds.has(l.id));
    const resumeLessonId = lastActiveLesson?.id ?? null;

    courseProgressMap[course.id] = {
      totalLessons,
      submittedLessons,
      pct,
      firstLessonId,
      resumeLessonId,
    };
  }

  // ── Streak computation (current week Mon-Fri) ─────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activityDates = new Set(progressRows.map((p) => toDateStr(p.updated_at)));

  const weekdays = currentWeekdays(today);
  const streakDays = weekdays.map(({ label, date }) => ({
    label,
    active: !(date.getTime() > today.getTime()) && activityDates.has(toDateStr(date.toISOString())),
    isFuture: date.getTime() > today.getTime(),
  }));

  // Current consecutive streak (from today backwards)
  let streakCount = 0;
  const checkDate = new Date(today);
  for (let i = 0; i < 30; i++) {
    if (activityDates.has(toDateStr(checkDate.toISOString()))) {
      streakCount++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // ── Milestones: next unsubmitted lesson per course ────────────
  const milestones: CatalogSidebarData["milestones"] = [];

  // Prioritise courses where student has started but not finished
  const startedCourses = courses.filter((c) => {
    const p = courseProgressMap[c.id];
    return p && p.submittedLessons > 0 && p.submittedLessons < p.totalLessons;
  });

  for (const course of startedCourses) {
    if (milestones.length >= 3) break;
    const lessons = lessonsByCourse.get(course.id) ?? [];
    const nextLesson = lessons.find((l) => !submittedLessonIds.has(l.id));
    if (nextLesson) {
      milestones.push({
        id: nextLesson.id,
        title: nextLesson.title,
        subtitle: course.title,
        courseId: course.id,
        lessonId: nextLesson.id,
      });
    }
  }

  // Fill remaining slots from not-started courses
  if (milestones.length < 3) {
    const notStarted = courses.filter((c) => {
      const p = courseProgressMap[c.id];
      return p && p.submittedLessons === 0 && p.totalLessons > 0;
    });
    for (const course of notStarted) {
      if (milestones.length >= 3) break;
      const firstLesson = lessonsByCourse.get(course.id)?.[0];
      if (firstLesson) {
        milestones.push({
          id: firstLesson.id,
          title: firstLesson.title,
          subtitle: course.title,
          courseId: course.id,
          lessonId: firstLesson.id,
        });
      }
    }
  }

  // ── Badges (certificates) ─────────────────────────────────────
  type CertRow = { id: string; course_id: string; issued_at: string };
  const certRows = (certificatesRes.data ?? []) as CertRow[];

  const badges = certRows.slice(0, 6).map((cert) => ({
    id: cert.id,
    courseTitle: courseById.get(cert.course_id)?.title ?? "Course",
    courseId: cert.course_id,
  }));

  const sidebarData: CatalogSidebarData = {
    streakDays,
    streakCount,
    milestones,
    badges,
  };

  return (
    <StudentCourseBrowser
      courses={courses}
      learningPath={learningPath}
      courseProgressMap={courseProgressMap}
      sidebarData={sidebarData}
    />
  );
}
