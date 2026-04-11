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
  can_edit_courses: boolean;
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

export type LessonMaterialKind = "link" | "file" | "video";

export interface LessonMaterial {
  id: string;
  lesson_id: string;
  title: string;
  kind: LessonMaterialKind;
  url: string;
  thumbnail_url: string | null;
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

/** Per-lesson progress (e.g. video watched) */
export interface LessonProgress {
  student_id: string;
  lesson_id: string;
  video_watched_at: string | null;
  updated_at: string;
}

/** Admin links an instructor to a student for reviews / grading scope */
export interface InstructorStudentAssignment {
  id: string;
  instructor_id: string;
  student_id: string;
  created_at: string;
}

export interface Cohort {
  id: string;
  instructor_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CohortStudent {
  cohort_id: string;
  student_id: string;
  joined_at: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  file_url: string | null;
  issued_by: string | null;
  issued_at: string;
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

export interface LessonMaterialInsert {
  id?: string;
  lesson_id: string;
  title: string;
  kind?: LessonMaterialKind;
  url: string;
  thumbnail_url?: string | null;
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

export interface LessonProgressInsert {
  student_id: string;
  lesson_id: string;
  video_watched_at?: string | null;
  updated_at?: string;
}

export interface InstructorStudentAssignmentInsert {
  id?: string;
  instructor_id: string;
  student_id: string;
  created_at?: string;
}

export interface CertificateInsert {
  id?: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  file_url?: string | null;
  issued_by?: string | null;
  issued_at?: string;
  created_at?: string;
}

// ─── Update types (what UPDATE expects) ─────────────────────
// Supabase expects: id/created_at as never, other columns optional

export interface ProfileUpdate {
  id?: never;
  email?: string;
  full_name?: string;
  role?: UserRole;
  can_edit_courses?: boolean;
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

export interface LessonMaterialUpdate {
  id?: never;
  lesson_id?: string;
  title?: string;
  kind?: LessonMaterialKind;
  url?: string;
  thumbnail_url?: string | null;
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

export interface CertificateUpdate {
  id?: never;
  student_id?: string;
  course_id?: string;
  certificate_number?: string;
  file_url?: string | null;
  issued_by?: string | null;
  issued_at?: string;
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
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: CourseInsert;
        Update: CourseUpdate;
        Relationships: [];
      };
      learning_paths: {
        Row: LearningPath;
        Insert: Omit<LearningPath, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<LearningPath, "id" | "created_at">> & { id?: never; created_at?: never };
        Relationships: [];
      };
      learning_blocks: {
        Row: LearningBlock;
        Insert: Omit<LearningBlock, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<LearningBlock, "id" | "created_at">> & { id?: never; created_at?: never };
        Relationships: [];
      };
      learning_block_courses: {
        Row: LearningBlockCourse;
        Insert: Omit<LearningBlockCourse, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<LearningBlockCourse, "id" | "created_at">> & { id?: never; created_at?: never };
        Relationships: [];
      };
      lessons: {
        Row: Lesson;
        Insert: LessonInsert;
        Update: LessonUpdate;
        Relationships: [];
      };
      lesson_materials: {
        Row: LessonMaterial;
        Insert: LessonMaterialInsert;
        Update: LessonMaterialUpdate;
        Relationships: [];
      };
      submissions: {
        Row: Submission;
        Insert: SubmissionInsert;
        Update: SubmissionUpdate;
        Relationships: [];
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: LessonProgressInsert;
        Update: Partial<Omit<LessonProgress, "student_id" | "lesson_id">> & {
          student_id?: never;
          lesson_id?: never;
        };
        Relationships: [];
      };
      instructor_student_assignments: {
        Row: InstructorStudentAssignment;
        Insert: InstructorStudentAssignmentInsert;
        Update: Partial<Omit<InstructorStudentAssignment, "id" | "created_at">> & {
          id?: never;
          created_at?: never;
        };
        Relationships: [];
      };
      cohorts: {
        Row: Cohort;
        Insert: Omit<Cohort, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Cohort, "id" | "created_at">> & { id?: never; created_at?: never };
        Relationships: [];
      };
      cohort_students: {
        Row: CohortStudent;
        Insert: Omit<CohortStudent, "joined_at"> & { joined_at?: string };
        Update: never;
        Relationships: [];
      };
      certificates: {
        Row: Certificate;
        Insert: CertificateInsert;
        Update: CertificateUpdate;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: UserRole;
      course_pillar: CoursePillar;
      course_category: CourseCategory;
      submission_status: SubmissionStatus;
    };
  };
}
