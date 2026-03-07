// ─── Enum types matching PostgreSQL enums ───────────────────

export type UserRole = "admin" | "instructor" | "student";

export type CoursePillar =
  | "Digital Literacy"
  | "Career Readiness"
  | "Life Skills"
  | "Cultural Identity";

export type SubmissionStatus = "pending" | "reviewed";

// ─── Row types (what SELECT returns) ────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  pillar: CoursePillar;
  description: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
}

export interface Submission {
  id: string;
  student_id: string;
  lesson_id: string;
  file_url: string;
  status: SubmissionStatus;
  grade: number | null;
  feedback: string;
  created_at: string;
}

// ─── Insert types (what INSERT expects) ─────────────────────

export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string;
  role?: UserRole;
  created_at?: string;
}

export interface CourseInsert {
  id?: string;
  title: string;
  pillar: CoursePillar;
  description?: string;
  created_at?: string;
}

export interface LessonInsert {
  id?: string;
  course_id: string;
  title: string;
  content?: string;
  order_index?: number;
  created_at?: string;
}

export interface SubmissionInsert {
  id?: string;
  student_id: string;
  lesson_id: string;
  file_url?: string;
  status?: SubmissionStatus;
  grade?: number | null;
  feedback?: string;
  created_at?: string;
}

// ─── Update types (what UPDATE expects) ─────────────────────
// Supabase expects: id/created_at as never, other columns optional

export interface ProfileUpdate {
  id?: never;
  email?: string;
  full_name?: string;
  role?: UserRole;
  created_at?: never;
}

export interface CourseUpdate {
  id?: never;
  title?: string;
  pillar?: CoursePillar;
  description?: string;
  created_at?: never;
}

export interface LessonUpdate {
  id?: never;
  course_id?: string;
  title?: string;
  content?: string;
  order_index?: number;
  created_at?: never;
}

export interface SubmissionUpdate {
  id?: never;
  student_id?: string;
  lesson_id?: string;
  file_url?: string;
  status?: SubmissionStatus;
  grade?: number | null;
  feedback?: string;
  created_at?: never;
}

// ─── Supabase Database type for typed client ────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      courses: {
        Row: Course;
        Insert: CourseInsert;
        Update: CourseUpdate;
      };
      lessons: {
        Row: Lesson;
        Insert: LessonInsert;
        Update: LessonUpdate;
      };
      submissions: {
        Row: Submission;
        Insert: SubmissionInsert;
        Update: SubmissionUpdate;
      };
    };
    Enums: {
      user_role: UserRole;
      course_pillar: CoursePillar;
      submission_status: SubmissionStatus;
    };
  };
}
