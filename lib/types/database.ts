// ─── Enum types matching PostgreSQL enums ───────────────────

export type UserRole = "admin" | "instructor" | "student";

export type CoursePillar =
  | "Digital Literacy"
  | "Career Readiness"
  | "Life Skills"
  | "Cultural Identity";

export type CourseCategory = "Word" | "Excel" | "Slides" | "Other";

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
  category: CourseCategory;
  description: string;
  created_at: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface LearningBlock {
  id: string;
  path_id: string;
  title: string;
  subtitle: string;
  order_index: number;
  created_at: string;
}

export interface LearningBlockCourse {
  id: string;
  block_id: string;
  course_id: string;
  order_index: number;
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
  category?: CourseCategory;
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
  category?: CourseCategory;
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
      learning_paths: {
        Row: LearningPath;
        Insert: Omit<LearningPath, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<LearningPath, "id" | "created_at">> & { id?: never; created_at?: never };
      };
      learning_blocks: {
        Row: LearningBlock;
        Insert: Omit<LearningBlock, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<LearningBlock, "id" | "created_at">> & { id?: never; created_at?: never };
      };
      learning_block_courses: {
        Row: LearningBlockCourse;
        Insert: Omit<LearningBlockCourse, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<LearningBlockCourse, "id" | "created_at">> & { id?: never; created_at?: never };
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
      course_category: CourseCategory;
      submission_status: SubmissionStatus;
    };
  };
}
