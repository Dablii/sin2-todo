import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, Section, Task, UserProfile, TaskStatus } from '@/types';

// ================= USERS =================
export async function saveUserProfile(user: { uid: string; email: string | null; displayName: string | null }): Promise<void> {
  if (!user.uid) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Uživatel',
      createdAt: Date.now()
    });
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => d.data() as UserProfile);
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

// ================= PROJECTS =================
export function subscribeUserProjects(userId: string, callback: (projects: Project[]) => void) {
  // Query projects where user is owner or member
  const q = query(
    collection(db, 'projects'),
    where('memberIds', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  }, (err) => {
    console.error('Error subscribing to projects:', err);
  });
}

export async function getProject(projectId: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, 'projects', projectId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Project;
}

export async function createProject(data: { title: string; description: string; ownerId: string }): Promise<string> {
  const docRef = await addDoc(collection(db, 'projects'), {
    title: data.title,
    description: data.description || '',
    ownerId: data.ownerId,
    memberIds: [data.ownerId],
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return docRef.id;
}

export async function addMemberToProject(projectId: string, userId: string): Promise<void> {
  const ref = doc(db, 'projects', projectId);
  await updateDoc(ref, {
    memberIds: arrayUnion(userId),
    updatedAt: Date.now()
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  // Delete project doc
  await deleteDoc(doc(db, 'projects', projectId));
  
  // Clean up sections and tasks
  const secSnap = await getDocs(query(collection(db, 'sections'), where('projectId', '==', projectId)));
  for (const s of secSnap.docs) {
    await deleteDoc(s.ref);
  }
  const taskSnap = await getDocs(query(collection(db, 'tasks'), where('projectId', '==', projectId)));
  for (const t of taskSnap.docs) {
    await deleteDoc(t.ref);
  }
}

// ================= SECTIONS =================
export function subscribeSections(projectId: string, callback: (sections: Section[]) => void) {
  const q = query(
    collection(db, 'sections'),
    where('projectId', '==', projectId)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Section));
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(list);
  }, (err) => {
    console.error('Error subscribing to sections:', err);
  });
}

export async function createSection(projectId: string, title: string, order: number = 0): Promise<string> {
  const docRef = await addDoc(collection(db, 'sections'), {
    projectId,
    title,
    order,
    createdAt: Date.now()
  });
  return docRef.id;
}

export async function deleteSection(sectionId: string): Promise<void> {
  await deleteDoc(doc(db, 'sections', sectionId));
}

// ================= TASKS =================
export function subscribeTasks(projectId: string, callback: (tasks: Task[]) => void) {
  const q = query(
    collection(db, 'tasks'),
    where('projectId', '==', projectId)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    callback(list);
  }, (err) => {
    console.error('Error subscribing to tasks:', err);
  });
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'tasks'), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return docRef.id;
}

export async function updateTask(taskId: string, data: Partial<Task>): Promise<void> {
  const ref = doc(db, 'tasks', taskId);
  await updateDoc(ref, {
    ...data,
    updatedAt: Date.now()
  });
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const ref = doc(db, 'tasks', taskId);
  await updateDoc(ref, {
    status,
    updatedAt: Date.now()
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', taskId));
}

// ================= SEED DEMO DATA =================
export async function seedDemoProject(userId: string, userName: string): Promise<string> {
  // Create project: Organizace školní akce
  const projectId = await createProject({
    title: 'Organizace školní akce',
    description: 'Ukázkový projekt z MVP specifikace – koordinace příprav, propagace a zajištění prostor.',
    ownerId: userId
  });

  // Create sections
  const marketingSecId = await createSection(projectId, 'Marketing', 0);
  const organizaceSecId = await createSection(projectId, 'Organizace', 1);

  // Helper date formatted YYYY-MM-DD
  const today = new Date();
  const formatOffsetDate = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Task 1: Připravit plakát (Section: Marketing, In Progress, High priority)
  await createTask({
    projectId,
    sectionId: marketingSecId,
    title: 'Připravit plakát',
    description: 'Vytvořit a schválit grafický návrh plakátu pro tisk a sociální sítě.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    deadline: formatOffsetDate(2),
    assigneeId: userId,
    assigneeName: userName,
    subtasks: [
      { id: 'sub-1', title: 'Vytvořit grafiku', isCompleted: true },
      { id: 'sub-2', title: 'Schválit návrh', isCompleted: false },
      { id: 'sub-3', title: 'Odeslat do tiskárny', isCompleted: false }
    ],
    order: 0
  });

  // Task 2: Zajistit prostory (Section: Organizace, To Do, High priority)
  await createTask({
    projectId,
    sectionId: organizaceSecId,
    title: 'Zajistit prostory',
    description: 'Rezervace auly, kontrola ozvučení a seatingu.',
    status: 'TODO',
    priority: 'HIGH',
    deadline: formatOffsetDate(-1), // Overdue for timeline testing!
    assigneeId: userId,
    assigneeName: userName,
    subtasks: [
      { id: 'sub-4', title: 'Kontaktovat správce budovy', isCompleted: true },
      { id: 'sub-5', title: 'Ověřit techniku a mikrofony', isCompleted: false }
    ],
    order: 1
  });

  // Task 3: Občerstvení pro hosty (Section: Organizace, Done, Medium priority)
  await createTask({
    projectId,
    sectionId: organizaceSecId,
    title: 'Objednat catering',
    description: 'Zajistit kávu, vodu a drobné pohoštění pro účastníky.',
    status: 'DONE',
    priority: 'MEDIUM',
    deadline: formatOffsetDate(5),
    assigneeId: userId,
    assigneeName: userName,
    subtasks: [
      { id: 'sub-6', title: 'Vybrat dodavatele', isCompleted: true },
      { id: 'sub-7', title: 'Potvrdit počty porcí', isCompleted: true }
    ],
    order: 2
  });

  return projectId;
}
