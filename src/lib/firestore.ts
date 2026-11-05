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
import { Project, Section, Task, UserProfile, TaskStatus, ChristmasRecipient, GiftIdea, WishlistItem, Priority, ScheduleEvent } from '@/types';

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

// ================= CHRISTMAS MODULE =================

export function subscribeChristmasRecipients(userId: string, callback: (recipients: ChristmasRecipient[]) => void) {
  const q = query(
    collection(db, 'christmas_recipients'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        gifts: data.gifts || [],
        ...data
      } as unknown as ChristmasRecipient;
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  }, (err) => {
    console.error('Error subscribing to christmas recipients:', err);
  });
}

export async function addChristmasRecipient(
  userId: string,
  data: { name: string; relationship?: string; budgetLimit?: number }
): Promise<string> {
  const now = Date.now();
  const docRef = await addDoc(collection(db, 'christmas_recipients'), {
    userId,
    name: data.name.trim(),
    relationship: data.relationship?.trim() || '',
    budgetLimit: data.budgetLimit || 0,
    gifts: [],
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
}

export async function updateChristmasRecipient(
  recipientId: string,
  data: Partial<Omit<ChristmasRecipient, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'christmas_recipients', recipientId), {
    ...data,
    updatedAt: Date.now()
  });
}

export async function deleteChristmasRecipient(recipientId: string): Promise<void> {
  await deleteDoc(doc(db, 'christmas_recipients', recipientId));
}

export async function addGiftToRecipient(
  recipientId: string,
  gift: Omit<GiftIdea, 'id' | 'createdAt'>
): Promise<void> {
  const recipientRef = doc(db, 'christmas_recipients', recipientId);
  const snap = await getDoc(recipientRef);
  if (!snap.exists()) return;

  const currentGifts: GiftIdea[] = snap.data().gifts || [];
  const newGift: GiftIdea = {
    id: `gift-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: gift.title.trim(),
    price: gift.price || 0,
    url: gift.url?.trim() || '',
    note: gift.note?.trim() || '',
    status: gift.status || 'IDEA',
    createdAt: Date.now()
  };

  await updateDoc(recipientRef, {
    gifts: [...currentGifts, newGift],
    updatedAt: Date.now()
  });
}

export async function updateGiftInRecipient(
  recipientId: string,
  giftId: string,
  updates: Partial<GiftIdea>
): Promise<void> {
  const recipientRef = doc(db, 'christmas_recipients', recipientId);
  const snap = await getDoc(recipientRef);
  if (!snap.exists()) return;

  const currentGifts: GiftIdea[] = snap.data().gifts || [];
  const updatedGifts = currentGifts.map(g => (g.id === giftId ? { ...g, ...updates } : g));

  await updateDoc(recipientRef, {
    gifts: updatedGifts,
    updatedAt: Date.now()
  });
}

export async function deleteGiftFromRecipient(
  recipientId: string,
  giftId: string
): Promise<void> {
  const recipientRef = doc(db, 'christmas_recipients', recipientId);
  const snap = await getDoc(recipientRef);
  if (!snap.exists()) return;

  const currentGifts: GiftIdea[] = snap.data().gifts || [];
  const updatedGifts = currentGifts.filter(g => g.id !== giftId);

  await updateDoc(recipientRef, {
    gifts: updatedGifts,
    updatedAt: Date.now()
  });
}

// ================= WISHLIST =================

export function subscribeWishlist(userId: string, callback: (items: WishlistItem[]) => void) {
  const q = query(
    collection(db, 'christmas_wishlist'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as WishlistItem));
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  }, (err) => {
    console.error('Error subscribing to wishlist:', err);
  });
}

export async function addWishlistItem(
  userId: string,
  data: { title: string; url?: string; estimatedPrice?: number; note?: string; priority: Priority }
): Promise<string> {
  const docRef = await addDoc(collection(db, 'christmas_wishlist'), {
    userId,
    title: data.title.trim(),
    url: data.url?.trim() || '',
    estimatedPrice: data.estimatedPrice || 0,
    note: data.note?.trim() || '',
    priority: data.priority || 'MEDIUM',
    isCompleted: false,
    createdAt: Date.now()
  });
  return docRef.id;
}

export async function updateWishlistItem(
  itemId: string,
  data: Partial<Omit<WishlistItem, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'christmas_wishlist', itemId), {
    ...data
  });
}

export async function deleteWishlistItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'christmas_wishlist', itemId));
}

// ================= SCHEDULE & STUDY PLANNER =================
export function subscribeScheduleEvents(userId: string, callback: (events: ScheduleEvent[]) => void) {
  const q = query(
    collection(db, 'schedule_events'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleEvent));
    // Sort by startTime
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    callback(list);
  }, (err) => {
    console.error('Error subscribing to schedule events:', err);
  });
}

export async function createScheduleEvent(data: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'schedule_events'), {
    ...data,
    isCompleted: data.isCompleted ?? false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return docRef.id;
}

export async function createMultipleScheduleEvents(events: Array<Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const promises = events.map(event =>
    addDoc(collection(db, 'schedule_events'), {
      ...event,
      isCompleted: event.isCompleted ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
  );
  await Promise.all(promises);
}

export async function updateScheduleEvent(
  eventId: string,
  data: Partial<Omit<ScheduleEvent, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'schedule_events', eventId), {
    ...data,
    updatedAt: Date.now()
  });
}

export async function deleteScheduleEvent(eventId: string): Promise<void> {
  await deleteDoc(doc(db, 'schedule_events', eventId));
}


