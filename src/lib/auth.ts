import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ADMINS_FILE = join(process.cwd(), "src/content/data/admins.json");
const SESSIONS_FILE = join(process.cwd(), "src/content/data/sessions.json");
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface Admin {
  email: string;
  passwordHash: string;
  resetToken: string | null;
  resetTokenExpiry: string | null;
  createdAt: string;
}

export interface Session {
  email: string;
  token: string;
  expiresAt: number;
}

// File-based session store (persists across server restarts)
function getSessions(): Map<string, Session> {
  try {
    if (!existsSync(SESSIONS_FILE)) {
      return new Map();
    }
    const data = readFileSync(SESSIONS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function saveSessions(sessions: Map<string, Session>): void {
  const obj = Object.fromEntries(sessions);
  writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2));
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function getAdmins(): { admins: Admin[] } {
  try {
    const data = readFileSync(ADMINS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { admins: [] };
  }
}

function saveAdmins(data: { admins: Admin[] }): void {
  writeFileSync(ADMINS_FILE, JSON.stringify(data, null, 2));
}

export function isValidEmail(email: string): boolean {
  const admins = getAdmins();
  return admins.admins.some(
    (admin) => admin.email.toLowerCase() === email.toLowerCase()
  );
}

export function validateCredentials(email: string, password: string): boolean {
  const admins = getAdmins();
  const admin = admins.admins.find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );

  if (!admin?.passwordHash) {
    return false;
  }

  return admin.passwordHash === hashPassword(password);
}

export function createSession(email: string): string {
  const token = randomBytes(32).toString("hex");
  const session: Session = {
    email,
    token,
    expiresAt: Date.now() + SESSION_DURATION,
  };
  const sessions = getSessions();
  sessions.set(token, session);
  saveSessions(sessions);
  return token;
}

export function validateSession(token: string): Session | null {
  const sessions = getSessions();
  const session = sessions.get(token);
  if (!session) {
    return null;
  }
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    saveSessions(sessions);
    return null;
  }
  return session;
}

export function destroySession(token: string): void {
  const sessions = getSessions();
  sessions.delete(token);
  saveSessions(sessions);
}

export function setPassword(email: string, password: string): boolean {
  const admins = getAdmins();
  const adminIndex = admins.admins.findIndex(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );

  if (adminIndex === -1) {
    return false;
  }

  admins.admins[adminIndex].passwordHash = hashPassword(password);
  admins.admins[adminIndex].resetToken = null;
  admins.admins[adminIndex].resetTokenExpiry = null;
  saveAdmins(admins);
  return true;
}

export function createResetToken(email: string): string | null {
  const admins = getAdmins();
  const adminIndex = admins.admins.findIndex(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );

  if (adminIndex === -1) {
    return null;
  }

  const resetToken = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  admins.admins[adminIndex].resetToken = resetToken;
  admins.admins[adminIndex].resetTokenExpiry = expiry.toISOString();
  saveAdmins(admins);

  return resetToken;
}

export function validateResetToken(token: string): string | null {
  const admins = getAdmins();
  const admin = admins.admins.find((a) => a.resetToken === token);

  if (!admin?.resetTokenExpiry) {
    return null;
  }

  if (new Date() > new Date(admin.resetTokenExpiry)) {
    return null;
  }

  return admin.email;
}

export function resetPasswordWithToken(
  token: string,
  newPassword: string
): boolean {
  const email = validateResetToken(token);
  if (!email) {
    return false;
  }
  return setPassword(email, newPassword);
}

export function addAdmin(email: string): boolean {
  const admins = getAdmins();

  if (
    admins.admins.some((a) => a.email.toLowerCase() === email.toLowerCase())
  ) {
    return false; // Already exists
  }

  admins.admins.push({
    email: email.toLowerCase(),
    passwordHash: "",
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date().toISOString(),
  });

  saveAdmins(admins);
  return true;
}

export function removeAdmin(email: string): boolean {
  const admins = getAdmins();
  const initialLength = admins.admins.length;

  admins.admins = admins.admins.filter(
    (a) => a.email.toLowerCase() !== email.toLowerCase()
  );

  if (admins.admins.length === initialLength) {
    return false;
  }

  saveAdmins(admins);
  return true;
}

export function listAdmins(): string[] {
  const admins = getAdmins();
  return admins.admins.map((a) => a.email);
}

export function hasPasswordSet(email: string): boolean {
  const admins = getAdmins();
  const admin = admins.admins.find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );
  return !!admin?.passwordHash;
}
