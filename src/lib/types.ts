export type UserRole = 'Administrator' | 'Team Leader' | 'Team Member';

export type TaskStatus = 'To-do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';

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
  content: string;
}

export interface Revision {
  id: string;
  timestamp: string;
  author: User;
  change: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignees: User[];
  dueDate: string;
  revisions: Revision[];
  comments: Comment[];
  files: File[];
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'task-assigned' | 'comment' | 'status-change';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}
