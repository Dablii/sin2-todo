export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Section {
  id: string;
  projectId: string;
  title: string;
  order: number;
  createdAt: number;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  sectionId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  deadline?: string; // Format: YYYY-MM-DD
  assigneeId?: string;
  assigneeName?: string;
  subtasks: Subtask[];
  order: number;
  createdAt: number;
  updatedAt: number;
}
