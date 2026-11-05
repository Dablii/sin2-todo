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

// Vánoční modul typy
export type GiftStatus = 'IDEA' | 'PURCHASED' | 'WRAPPED' | 'DELIVERED';

export interface GiftIdea {
  id: string;
  title: string;
  price?: number;
  url?: string;
  note?: string;
  status: GiftStatus;
  createdAt: number;
}

export interface ChristmasRecipient {
  id: string;
  userId: string;
  name: string;
  relationship?: string;
  budgetLimit?: number;
  gifts: GiftIdea[];
  createdAt: number;
  updatedAt: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  title: string;
  url?: string;
  estimatedPrice?: number;
  note?: string;
  priority: Priority;
  isCompleted?: boolean;
  createdAt: number;
}

// Plánovač a Rozvrh (Study Plan & Calendar)
export type EventCategory = 'STUDY' | 'EXAM' | 'SPORT' | 'LEISURE' | 'PERSONAL';
export type RecurrenceFrequency = 'NONE' | 'WEEKLY' | 'DAILY';

export interface ScheduleEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: EventCategory;
  startTime: string; // HH:mm např. "14:00"
  endTime: string;   // HH:mm např. "15:30"
  date?: string;     // YYYY-MM-DD (pro jednorázové události a zkoušky)
  recurrence: RecurrenceFrequency; // NONE | WEEKLY | DAILY
  daysOfWeek?: number[]; // 1 = Po, 2 = Út, 3 = St, 4 = Čt, 5 = Pá, 6 = So, 7 = Ne
  color?: string;
  isCompleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

