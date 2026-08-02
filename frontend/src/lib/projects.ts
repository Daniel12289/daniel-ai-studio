import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Project, ProjectFile, Framework } from "../types";

function projectsCol(uid: string) {
  return collection(db, "users", uid, "projects");
}

export async function createProject(
  uid: string,
  data: { name: string; description: string; framework: Framework; files: ProjectFile[]; templateId?: string | null }
): Promise<string> {
  const ref = doc(projectsCol(uid));
  await setDoc(ref, {
    ownerUid: uid,
    name: data.name,
    description: data.description,
    framework: data.framework,
    files: data.files,
    templateId: data.templateId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProjectFiles(uid: string, projectId: string, files: ProjectFile[]) {
  await setDoc(
    doc(projectsCol(uid), projectId),
    { files, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function renameProject(uid: string, projectId: string, name: string) {
  await setDoc(doc(projectsCol(uid), projectId), { name, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteProject(uid: string, projectId: string) {
  await deleteDoc(doc(projectsCol(uid), projectId));
}

export async function duplicateProject(uid: string, project: Project): Promise<string> {
  return createProject(uid, {
    name: `${project.name} (copy)`,
    description: project.description,
    framework: project.framework,
    files: project.files,
    templateId: project.templateId,
  });
}

export async function getProject(uid: string, projectId: string): Promise<Project | null> {
  const snap = await getDoc(doc(projectsCol(uid), projectId));
  if (!snap.exists()) return null;
  return toProject(snap.id, snap.data());
}

export async function listProjects(uid: string): Promise<Project[]> {
  const q = query(projectsCol(uid), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProject(d.id, d.data()));
}

function toProject(id: string, data: any): Project {
  const toMillis = (v: unknown) => (v instanceof Timestamp ? v.toMillis() : Date.now());
  return {
    id,
    ownerUid: data.ownerUid,
    name: data.name,
    description: data.description,
    framework: data.framework,
    files: data.files || [],
    templateId: data.templateId ?? null,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}
