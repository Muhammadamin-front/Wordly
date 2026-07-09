import { apiFetch } from "@/lib/api";

export interface Classroom {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  created_at: string;
  member_count: number;
}

export interface StudentClass {
  id: string;
  name: string;
  description: string | null;
}

export interface Assignment {
  id: string;
  title: string;
  instructions: string | null;
  target_reviews: number;
  due_at: string;
  created_at: string;
}

export interface StudentStat {
  user_id: string;
  display_name: string;
  level: number;
  current_streak: number;
  total_reviews: number;
}

export interface AssignmentAnalytics {
  assignment: Assignment;
  completed: number;
  total: number;
  progress: { user_id: string; reviews: number; done: boolean }[];
}

export interface ClassAnalytics {
  students: StudentStat[];
  assignments: AssignmentAnalytics[];
}

export interface StudentAssignment {
  assignment: Assignment;
  reviews: number;
  done: boolean;
  overdue: boolean;
}

export const teacherApi = {
  classes: () => apiFetch<Classroom[]>("/teacher/classes", { auth: true }),

  createClass: (name: string, description?: string) =>
    apiFetch<Classroom>("/teacher/classes", {
      method: "POST",
      body: { name, description },
      auth: true,
    }),

  analytics: (classId: string) =>
    apiFetch<ClassAnalytics>(`/teacher/classes/${classId}/analytics`, { auth: true }),

  createAssignment: (
    classId: string,
    body: { title: string; instructions?: string; target_reviews: number; due_at: string }
  ) =>
    apiFetch<Assignment>(`/teacher/classes/${classId}/assignments`, {
      method: "POST",
      body,
      auth: true,
    }),

  archive: (classId: string) =>
    apiFetch<{ message: string }>(`/teacher/classes/${classId}`, {
      method: "DELETE",
      auth: true,
    }),
};

export const studentApi = {
  join: (code: string) =>
    apiFetch<StudentClass>("/classes/join", { method: "POST", body: { code }, auth: true }),

  myClasses: () => apiFetch<StudentClass[]>("/me/classes", { auth: true }),

  assignments: (classId: string) =>
    apiFetch<StudentAssignment[]>(`/classes/${classId}/assignments`, { auth: true }),
};
