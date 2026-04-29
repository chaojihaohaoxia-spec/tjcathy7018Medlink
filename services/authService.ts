export type AuthRole = "clinician" | "care-coordinator" | "admin" | "research-observer";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  hospitalId: string;
  organization: string;
  avatarUrl?: string;
  permissions: string[];
};

export type LoginCredentials = {
  email: string;
  password: string;
};

const AUTH_STORAGE_KEY = "medlink-auth-user";

const demoUsers: AuthUser[] = [
  {
    id: "usr-001",
    name: "Dr. Mira Wong",
    email: "mira.wong@westchina.example",
    role: "clinician",
    hospitalId: "hosp-west-china",
    organization: "West China Hospital, Sichuan University",
    permissions: ["patients.read", "triage.review", "consent.request", "prescriptions.route"]
  },
  {
    id: "usr-002",
    name: "Leo Park",
    email: "leo.park@jinjiang-community.example",
    role: "care-coordinator",
    hospitalId: "hosp-jinjiang-community",
    organization: "Chengdu Jinjiang District Community Health Center",
    permissions: ["patients.read", "journey.coordinate", "claims.prepare"]
  }
];

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function persistUser(user: AuthUser) {
  if (canUseStorage()) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const normalizedEmail = credentials.email.trim().toLowerCase();
    const matchedUser = demoUsers.find((user) => user.email.toLowerCase() === normalizedEmail) ?? demoUsers[0];

    if (!credentials.password.trim()) {
      throw new Error("Password is required for the MedLink demo login.");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    persistUser(matchedUser);
    return matchedUser;
  },

  logout() {
    if (canUseStorage()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  getCurrentUser() {
    if (!canUseStorage()) {
      return null;
    }

    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },

  getDemoUsers() {
    return demoUsers;
  },

  hasPermission(user: AuthUser | null, permission: string) {
    return Boolean(user?.permissions.includes(permission));
  }
};
