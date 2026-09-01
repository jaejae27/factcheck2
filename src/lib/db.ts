import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import {
  Room,
  Student,
  Team,
  InvestigationData,
  EvidenceCard,
  HelpRequest,
  PeerReview,
  TeacherReview,
  StudentReflection,
  TeacherObservation,
  SchoolRecordDraft,
  StudentRole,
} from '../types';

// Helper to generate 6-digit random room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ----------------- ROOMS -----------------
export async function createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'roomCode' | 'presentationState'>): Promise<{ room: Room; teams: Team[] }> {
  const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const roomCode = generateRoomCode();
  
  const room: Room = {
    ...roomData,
    id: roomId,
    roomCode,
    activeStep: 1,
    status: 'active',
    peerReviewEnabled: roomData.peerReviewEnabled ?? true,
    teacherReviewEnabled: roomData.teacherReviewEnabled ?? true,
    teacherWeight: roomData.teacherWeight || 70,
    peerWeight: roomData.peerWeight || 30,
    presentationState: {
      active: false,
      teamId: null,
      slideIndex: 0,
      allowStudentControl: true,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, 'rooms', roomId), room);

  // Auto-generate teams for this room in a single atomic batch
  const teams = await createTeamsForRoom(roomId, room.teamCount);

  return { room, teams };
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  try {
    const docSnap = await getDoc(doc(db, 'rooms', roomId));
    if (docSnap.exists()) {
      return docSnap.data() as Room;
    }
    return null;
  } catch (err) {
    console.error('Error getting room by ID:', err);
    return null;
  }
}

export async function getRoomByCode(roomCode: string): Promise<Room | null> {
  try {
    const q = query(collection(db, 'rooms'), where('roomCode', '==', roomCode.trim().toUpperCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Room;
    }
    return null;
  } catch (err) {
    console.error('Error getting room by code:', err);
    return null;
  }
}

export async function getTeacherRooms(teacherId: string): Promise<Room[]> {
  try {
    const q = query(collection(db, 'rooms'), where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => d.data() as Room);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Error getting teacher rooms:', err);
    return [];
  }
}

export async function updateRoom(roomId: string, updates: Partial<Room>): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function updateRoomStep(roomId: string, activeStep: number): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), {
    activeStep,
    updatedAt: Date.now(),
  });
}

export async function updateRoomPresentation(roomId: string, presentationState: Room['presentationState']): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), {
    presentationState,
    updatedAt: Date.now(),
  });
}


export async function deleteRoom(roomId: string): Promise<void> {
  try {
    // 1. Find all teams in this room to delete their investigations
    const teamsQ = query(collection(db, 'teams'), where('roomId', '==', roomId));
    const teamsSnap = await getDocs(teamsQ);
    const teamIds = teamsSnap.docs.map((d) => d.id);

    // Delete investigations for each team
    for (const teamId of teamIds) {
      try {
        await deleteDoc(doc(db, 'investigations', teamId));
      } catch (e) {
        console.warn(`Failed to delete investigation for team ${teamId}:`, e);
      }
    }

    // Helper to delete all docs in a collection matching roomId
    const collectionsToClean = [
      'teams',
      'students',
      'evidence',
      'helpRequests',
      'peerReviews',
      'teacherReviews',
      'reflections',
      'teacherObservations',
      'schoolRecordDrafts',
    ];

    for (const colName of collectionsToClean) {
      try {
        const q = query(collection(db, colName), where('roomId', '==', roomId));
        const snap = await getDocs(q);
        const batch = writeBatch(db);
        snap.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        if (snap.docs.length > 0) {
          await batch.commit();
        }
      } catch (colErr) {
        console.warn(`Error cleaning collection ${colName} for room ${roomId}:`, colErr);
      }
    }

    // Finally delete the room document itself
    await deleteDoc(doc(db, 'rooms', roomId));
  } catch (err) {
    console.error('Error completely deleting room:', err);
    // Fallback delete room doc
    await deleteDoc(doc(db, 'rooms', roomId));
  }
}

export function subscribeRoom(roomId: string, callback: (room: Room | null) => void) {
  return onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Room);
    } else {
      callback(null);
    }
  }, (err) => {
    console.error('Room subscription error:', err);
  });
}

// ----------------- TEAMS -----------------
export async function createTeamsForRoom(roomId: string, teamCount: number): Promise<Team[]> {
  const batch = writeBatch(db);
  const now = Date.now();
  const createdTeams: Team[] = [];

  for (let i = 1; i <= teamCount; i++) {
    const teamId = `${roomId}_team_${i}`;
    const team: Team = {
      id: teamId,
      roomId,
      teamNumber: i,
      teamName: `수사 ${i}팀`,
      topicId: '',
      topicTitle: '',
      claim: '',
      assignedRoles: {},
      currentStep: 1,
      progressPercent: 0,
      evidenceCount: 0,
      hasCounterEvidence: false,
      helpRequested: false,
      lastActive: now,
    };
    batch.set(doc(db, 'teams', teamId), team);
    createdTeams.push(team);

    // Also initialize investigation document
    const inv: InvestigationData = {
      teamId,
      roomId,
      initialBelief: '',
      initialReason: '',
      investigationQuestions: [],
      hypothesis: '',
      evidencePlan: {
        neededDataTypes: [],
        targetSources: [],
        searchKeywords: [],
      },
      jointSynthesis: {
        commonFindings: '',
        conflictingFindings: '',
        reasonForConflict: '',
        conditionDifferences: '',
        unexpectedEvidence: '',
        missingContextExceptions: '',
        warrantScope: '',
      },
      finalVerdict: '',
      decisiveEvidenceSummary: '',
      beliefChangeComparison: {
        initial: '',
        final: '',
        changedReason: '',
      },
      reportThesis: {
        researchTitle: '',
        limitations: '',
        futureQuestions: '',
      },
      peerReviewDeliberation: {
        action: '',
        modificationReason: '',
      },
      updatedAt: now,
    };
    batch.set(doc(db, 'investigations', teamId), inv);
  }

  // Atomically commit all teams and investigation docs in a single request
  await batch.commit();
  return createdTeams;
}

export async function getTeamsByRoom(roomId: string): Promise<Team[]> {
  try {
    const q = query(collection(db, 'teams'), where('roomId', '==', roomId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => d.data() as Team);
    return list.sort((a, b) => a.teamNumber - b.teamNumber);
  } catch (err) {
    console.error('Error getting teams:', err);
    return [];
  }
}

export function subscribeTeamsByRoom(roomId: string, callback: (teams: Team[]) => void) {
  const q = query(collection(db, 'teams'), where('roomId', '==', roomId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as Team);
    list.sort((a, b) => a.teamNumber - b.teamNumber);
    callback(list);
  }, (err) => {
    console.error('Teams subscription error:', err);
  });
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
  await updateDoc(doc(db, 'teams', teamId), {
    ...updates,
    lastActive: Date.now(),
  });
}

// ----------------- ROOMS -----------------
export async function toggleRoomJoinLock(roomId: string, lockJoin: boolean): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), {
    lockJoin,
    updatedAt: Date.now(),
  });
}

export async function updateRoomNavigationMode(roomId: string, navigationMode: 'TEACHER_CONTROLLED' | 'FREE_EXPLORATION'): Promise<void> {
  await updateDoc(doc(db, 'rooms', roomId), {
    navigationMode,
    updatedAt: Date.now(),
  });
}

// ----------------- STUDENTS -----------------
export async function registerStudentInRoom(
  roomId: string,
  grade: number,
  classNumber: number,
  studentNumber: number,
  name: string,
  teamId: string
): Promise<Student> {
  const studentId = `${roomId}_s_${grade}_${classNumber}_${studentNumber}`;
  const studentDoc = await getDoc(doc(db, 'students', studentId));
  
  if (studentDoc.exists()) {
    const existing = studentDoc.data() as Student;
    // Keep existing teamId if already assigned and valid, otherwise use newly provided teamId
    const effectiveTeamId = existing.teamId || teamId;
    const updated: Student = {
      ...existing,
      name: name || existing.name,
      teamId: effectiveTeamId,
      lastActive: Date.now(),
      isReconnected: true,
    };
    await updateDoc(doc(db, 'students', studentId), {
      name: updated.name,
      teamId: effectiveTeamId,
      lastActive: Date.now(),
    });
    return updated;
  }

  const student: Student = {
    id: studentId,
    roomId,
    grade,
    classNumber,
    studentNumber,
    name: name.trim(),
    teamId: teamId || '',
    role: null,
    joinedAt: Date.now(),
    lastActive: Date.now(),
    isReconnected: false,
  };

  await setDoc(doc(db, 'students', studentId), student);
  return student;
}

export async function updateStudentTeam(studentId: string, teamId: string): Promise<void> {
  await updateDoc(doc(db, 'students', studentId), {
    teamId,
    lastActive: Date.now(),
  });
}

export async function updateStudentRole(studentId: string, role: StudentRole | null, teamId: string): Promise<void> {
  await updateDoc(doc(db, 'students', studentId), {
    role,
    lastActive: Date.now(),
  });

  if (teamId && role) {
    const teamDoc = await getDoc(doc(db, 'teams', teamId));
    if (teamDoc.exists()) {
      const teamData = teamDoc.data() as Team;
      const assignedRoles = { ...teamData.assignedRoles, [role]: studentId };
      await updateDoc(doc(db, 'teams', teamId), {
        assignedRoles,
        lastActive: Date.now(),
      });
    }
  }
}

export function subscribeStudentsByRoom(roomId: string, callback: (students: Student[]) => void) {
  const q = query(collection(db, 'students'), where('roomId', '==', roomId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as Student);
    list.sort((a, b) => a.studentNumber - b.studentNumber);
    callback(list);
  }, (err) => {
    console.error('Students subscription error:', err);
  });
}

export async function getStudentsByRoom(roomId: string): Promise<Student[]> {
  try {
    const q = query(collection(db, 'students'), where('roomId', '==', roomId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => d.data() as Student);
    return list.sort((a, b) => a.studentNumber - b.studentNumber);
  } catch (err) {
    console.error('Error getting students:', err);
    return [];
  }
}

// ----------------- INVESTIGATIONS -----------------
export async function getInvestigationByTeam(teamId: string): Promise<InvestigationData | null> {
  try {
    const snap = await getDoc(doc(db, 'investigations', teamId));
    if (snap.exists()) {
      return snap.data() as InvestigationData;
    }
    return null;
  } catch (err) {
    console.error('Error getting investigation:', err);
    return null;
  }
}

export async function saveInvestigation(teamId: string, updates: Partial<InvestigationData>): Promise<void> {
  const refDoc = doc(db, 'investigations', teamId);
  const snap = await getDoc(refDoc);
  if (snap.exists()) {
    await updateDoc(refDoc, {
      ...updates,
      updatedAt: Date.now(),
    });
  } else {
    await setDoc(refDoc, {
      ...updates,
      teamId,
      updatedAt: Date.now(),
    });
  }
}

export function subscribeInvestigationByTeam(teamId: string, callback: (inv: InvestigationData | null) => void) {
  return onSnapshot(doc(db, 'investigations', teamId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as InvestigationData);
    } else {
      callback(null);
    }
  }, (err) => {
    console.error('Investigation subscription error:', err);
  });
}

// ----------------- EVIDENCE CARDS -----------------
export async function addEvidenceCard(cardData: Omit<EvidenceCard, 'id' | 'createdAt'>): Promise<EvidenceCard> {
  const cardId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const card: EvidenceCard = {
    ...cardData,
    id: cardId,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'evidence', cardId), card);

  // Update team evidence count & counter evidence flag
  const teamDoc = await getDoc(doc(db, 'teams', card.teamId));
  if (teamDoc.exists()) {
    const team = teamDoc.data() as Team;
    const isCounter = card.stance === 'refutes' || card.stance === 'condition';
    await updateDoc(doc(db, 'teams', card.teamId), {
      evidenceCount: (team.evidenceCount || 0) + 1,
      hasCounterEvidence: team.hasCounterEvidence || isCounter,
      lastActive: Date.now(),
    });
  }

  return card;
}

export async function updateEvidenceCard(cardId: string, updates: Partial<EvidenceCard>): Promise<void> {
  await updateDoc(doc(db, 'evidence', cardId), updates);
}

export async function deleteEvidenceCard(cardId: string, teamId: string): Promise<void> {
  await deleteDoc(doc(db, 'evidence', cardId));
  
  // Recalculate team evidence count
  const q = query(collection(db, 'evidence'), where('teamId', '==', teamId));
  const snap = await getDocs(q);
  const cards = snap.docs.map(d => d.data() as EvidenceCard);
  const hasCounter = cards.some(c => c.stance === 'refutes' || c.stance === 'condition');
  
  await updateDoc(doc(db, 'teams', teamId), {
    evidenceCount: cards.length,
    hasCounterEvidence: hasCounter,
    lastActive: Date.now(),
  });
}

export function subscribeEvidenceByTeam(teamId: string, callback: (cards: EvidenceCard[]) => void) {
  const q = query(collection(db, 'evidence'), where('teamId', '==', teamId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as EvidenceCard);
    list.sort((a, b) => a.evidenceNumber - b.evidenceNumber);
    callback(list);
  }, (err) => {
    console.error('Evidence by team subscription error:', err);
  });
}

export function subscribeEvidenceByRoom(roomId: string, callback: (cards: EvidenceCard[]) => void) {
  const q = query(collection(db, 'evidence'), where('roomId', '==', roomId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as EvidenceCard);
    list.sort((a, b) => a.createdAt - b.createdAt);
    callback(list);
  }, (err) => {
    console.error('Evidence by room subscription error:', err);
  });
}

export async function getEvidenceByRoom(roomId: string): Promise<EvidenceCard[]> {
  try {
    const q = query(collection(db, 'evidence'), where('roomId', '==', roomId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => d.data() as EvidenceCard);
    return list.sort((a, b) => a.createdAt - b.createdAt);
  } catch (err) {
    console.error('Error getting evidence by room:', err);
    return [];
  }
}

// ----------------- IMAGE UPLOAD (FIREBASE STORAGE WITH FALLBACK) -----------------
export async function uploadEvidenceImage(file: File, teamId: string): Promise<string> {
  try {
    const storagePath = `evidence/${teamId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const imageRef = ref(storage, storagePath);
    const snapshot = await uploadBytesResumable(imageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (err) {
    console.warn('Storage upload error, falling back to data URL encoding:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// ----------------- HELP REQUESTS -----------------
export async function sendHelpRequest(
  roomId: string,
  teamId: string,
  teamNumber: number,
  studentId: string,
  studentName: string,
  reason: string
): Promise<void> {
  const reqId = 'help_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const helpReq: HelpRequest = {
    id: reqId,
    roomId,
    teamId,
    teamNumber,
    studentId,
    studentName,
    reason,
    status: 'pending',
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'helpRequests', reqId), helpReq);
  await updateDoc(doc(db, 'teams', teamId), {
    helpRequested: true,
    helpReason: reason,
    helpStatus: 'pending',
  });
}

export async function resolveHelpRequest(requestId: string, teamId?: string, teacherReply: string = '지원 완료'): Promise<void> {
  await updateDoc(doc(db, 'helpRequests', requestId), {
    status: 'resolved',
    teacherReply,
    resolvedAt: Date.now(),
  });

  if (teamId) {
    await updateDoc(doc(db, 'teams', teamId), {
      helpRequested: false,
      helpStatus: 'resolved',
      teacherHint: teacherReply,
    });
  }
}

export async function sendDirectTeacherHint(teamId: string, hint: string): Promise<void> {
  await updateDoc(doc(db, 'teams', teamId), {
    teacherHint: hint,
    helpRequested: false,
    helpStatus: 'resolved',
    lastActive: Date.now(),
  });
}

export function subscribeHelpRequestsByRoom(roomId: string, callback: (reqs: HelpRequest[]) => void) {
  const q = query(collection(db, 'helpRequests'), where('roomId', '==', roomId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as HelpRequest);
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  }, (err) => {
    console.error('Help requests subscription error:', err);
  });
}

// ----------------- PEER REVIEWS -----------------
export async function submitPeerReview(review: Omit<PeerReview, 'id' | 'createdAt'>): Promise<void> {
  const reviewId = `peer_${review.fromStudentId}_${review.targetTeamId}`;
  const docData: PeerReview = {
    ...review,
    id: reviewId,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, 'peerReviews', reviewId), docData);
}

export function subscribePeerReviewsByRoom(roomId: string, callback: (reviews: PeerReview[]) => void) {
  const q = query(collection(db, 'peerReviews'), where('roomId', '==', roomId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as PeerReview);
    callback(list);
  }, (err) => {
    console.error('Peer review subscription error:', err);
  });
}

export async function getPeerReviewsForTeam(roomId: string, targetTeamId: string): Promise<PeerReview[]> {
  try {
    const q = query(
      collection(db, 'peerReviews'),
      where('roomId', '==', roomId),
      where('targetTeamId', '==', targetTeamId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as PeerReview);
  } catch (err) {
    console.error('Error getting peer reviews for team:', err);
    return [];
  }
}

// ----------------- TEACHER REVIEWS -----------------
export async function saveTeacherReview(review: Omit<TeacherReview, 'id' | 'createdAt'>): Promise<void> {
  const reviewId = `trev_${review.roomId}_${review.teamId}`;
  const docData: TeacherReview = {
    ...review,
    id: reviewId,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, 'teacherReviews', reviewId), docData);
}

export function subscribeTeacherReviewsByRoom(roomId: string, callback: (reviews: TeacherReview[]) => void) {
  const q = query(collection(db, 'teacherReviews'), where('roomId', '==', roomId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as TeacherReview);
    callback(list);
  }, (err) => {
    console.error('Teacher reviews subscription error:', err);
  });
}

// ----------------- REFLECTIONS -----------------
export async function submitStudentReflection(reflection: Omit<StudentReflection, 'id' | 'submittedAt'>): Promise<void> {
  const refId = `refl_${reflection.roomId}_${reflection.studentId}`;
  const docData: StudentReflection = {
    ...reflection,
    id: refId,
    submittedAt: Date.now(),
  };
  await setDoc(doc(db, 'reflections', refId), docData);
}

export function subscribeReflectionsByRoom(roomId: string, callback: (reflections: StudentReflection[]) => void) {
  const q = query(collection(db, 'reflections'), where('roomId', '==', roomId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as StudentReflection);
    list.sort((a, b) => a.studentNumber - b.studentNumber);
    callback(list);
  }, (err) => {
    console.error('Reflections subscription error:', err);
  });
}

export async function getReflectionsByRoom(roomId: string): Promise<StudentReflection[]> {
  try {
    const q = query(collection(db, 'reflections'), where('roomId', '==', roomId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => d.data() as StudentReflection);
    return list.sort((a, b) => a.studentNumber - b.studentNumber);
  } catch (err) {
    console.error('Error getting reflections by room:', err);
    return [];
  }
}

// ----------------- TEACHER OBSERVATIONS -----------------
export async function saveTeacherObservation(obs: Omit<TeacherObservation, 'id' | 'updatedAt'>): Promise<void> {
  const obsId = `obs_${obs.roomId}_${obs.studentId}`;
  const docData: TeacherObservation = {
    ...obs,
    id: obsId,
    updatedAt: Date.now(),
  };
  await setDoc(doc(db, 'teacherObservations', obsId), docData);
}

export function subscribeTeacherObservationsByRoom(roomId: string, callback: (obsList: TeacherObservation[]) => void) {
  const q = query(collection(db, 'teacherObservations'), where('roomId', '==', roomId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as TeacherObservation);
    callback(list);
  }, (err) => {
    console.error('Teacher observation subscription error:', err);
  });
}

// ----------------- SCHOOL RECORD DRAFTS (세특) -----------------
export async function saveSchoolRecordDraft(draft: Omit<SchoolRecordDraft, 'id'>): Promise<void> {
  const draftId = `draft_${draft.roomId}_${draft.studentId}`;
  const docData: SchoolRecordDraft = {
    ...draft,
    id: draftId,
    generatedAt: draft.generatedAt || Date.now(),
  };
  await setDoc(doc(db, 'schoolRecordDrafts', draftId), docData);
}

export function subscribeSchoolRecordDraftsByRoom(roomId: string, callback: (drafts: SchoolRecordDraft[]) => void) {
  const q = query(collection(db, 'schoolRecordDrafts'), where('roomId', '==', roomId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => d.data() as SchoolRecordDraft);
    list.sort((a, b) => a.studentNumber - b.studentNumber);
    callback(list);
  }, (err) => {
    console.error('Record drafts subscription error:', err);
  });
}

// Aliases for convenience
export const subscribeHelpRequests = subscribeHelpRequestsByRoom;
export const subscribePeerReviews = subscribePeerReviewsByRoom;
export const subscribeTeacherReviews = subscribeTeacherReviewsByRoom;
export const subscribeStudentReflections = subscribeReflectionsByRoom;
export const subscribeSchoolRecords = subscribeSchoolRecordDraftsByRoom;
export const submitTeacherReview = saveTeacherReview;
export const getEvidenceCardsForRoom = getEvidenceByRoom;
export const getInvestigation = getInvestigationByTeam;



