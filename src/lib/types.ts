

export enum UserRole {
  DIREKTUR_UTAMA = "Direktur Utama",
  DIREKTUR_OPERASIONAL = "Direktur Operasional",
  JURNALIS = "Jurnalis",
  SOCIAL_MEDIA_OFFICER = "Social Media Officer",
  DESAIN_GRAFIS = "Desain Grafis",
  MARKETING = "Marketing",
  FINANCE = "Finance",
}

export enum TaskCategory {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export type TaskStatus = 'To-do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';

export type LocalizedString = {
  en: string;
  id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
}

export interface File {
  id: string;
  name: string;
  type: 'video' | 'image' | 'illustration' | 'document';
  url: string;
  size: string;
}

export interface Comment {
  id: string;
  author: User;
  timestamp: string;
  content: LocalizedString;
}

export interface Revision {
  id: string;
  timestamp: string;
  author: User;
  change: LocalizedString;
}

export type Evaluator = "AI" | "Direktur Operasional" | "Direktur Bisnis" | "Direktur Utama";

export interface Task {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  status: TaskStatus;
  assignees: User[];
  dueDate: string;
  revisions: Revision[];
  comments: Comment[];
  files: File[];
  createdAt: string;
  category: TaskCategory; // Priority: low, medium, high
  
  // New performance value system
  valueCategory: "Rendah" | "Menengah" | "Tinggi";
  value: number; // 10, 20, 40
  evaluator: Evaluator;
  approvedBy: "Direktur Utama" | null;
}

export interface LeaderboardEntry {
    id: string;
    rank: number;
    name: string;
    score: number;
    tasksCompleted: number;
    avatarUrl: string;
    role: UserRole;
}

export interface DetailedReportEntry {
    id: string;
    taskId: string;
    employeeName: string;
    taskTitle: LocalizedString;
    role: UserRole;
    priority: string;
    deadline: string;
    completedOn: string;
    status: string;
    revisions: number;
    taskScore: number;
    aiJustification: LocalizedString;
    reviewer: string;
    assessmentDate: string;
}
