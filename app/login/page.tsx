"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileCheck2,
  Loader2,
  LockKeyhole,
  Mail,
  Network,
  ShieldCheck,
  Sparkles,
  User,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthRole, AuthUser, authService } from "@/services/authService";

const VERIFICATION_CODE = "123456";
const AUTH_STORAGE_KEY = "medlink-auth-user";

const securityBadges = [
  "DID-ready",
  "PIPL-aware",
  "Smart Contract Access Control",
  "No real medical data used"
];

const modules = [
  {
    label: "MediChain",
    detail: "Consent ledger",
    icon: ShieldCheck,
    className: "left-1/2 top-3 -translate-x-1/2",
    color: "from-sky-400 to-blue-500"
  },
  {
    label: "MediRoute",
    detail: "Referral logic",
    icon: Network,
    className: "bottom-4 left-4 md:left-10",
    color: "from-emerald-400 to-sky-500"
  },
  {
    label: "MediRx",
    detail: "Prescription route",
    icon: FileCheck2,
    className: "bottom-4 right-4 md:right-10",
    color: "from-blue-300 to-sky-400"
  }
];

const roleOptions = [
  "Patient",
  "Doctor",
  "Hospital Admin",
  "Pharmacy / Distributor",
  "Regulator"
];

const roleMap: Record<string, AuthRole> = {
  Patient: "research-observer",
  Doctor: "clinician",
  "Hospital Admin": "admin",
  "Pharmacy / Distributor": "care-coordinator",
  Regulator: "research-observer"
};

type TabMode = "login" | "register";
type ToastState = {
  id: number;
  title: string;
  description?: string;
  tone: "success" | "error";
};

function persistLocalUser(user: AuthUser) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function createPrototypeUser(input: {
  name: string;
  email: string;
  roleLabel: string;
}): AuthUser {
  return {
    id: `usr-demo-${Date.now()}`,
    name: input.name,
    email: input.email,
    role: roleMap[input.roleLabel] ?? "research-observer",
    hospitalId: input.roleLabel === "Patient" ? "patient-network" : "hosp-jinjiang-community",
    organization: input.roleLabel === "Patient" ? "Demo Patient Portal" : "MedLink Prototype Network",
    permissions:
      input.roleLabel === "Patient"
        ? ["patients.read", "journey.coordinate"]
        : ["patients.read", "triage.review", "consent.request", "prescriptions.route"]
  };
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<TabMode>("login");
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [loginEmail, setLoginEmail] = useState("mira.wong@westchina.example");
  const [loginCode, setLoginCode] = useState("");
  const [loginCountdown, setLoginCountdown] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerRole, setRegisterRole] = useState(roleOptions[0]);
  const [registerCode, setRegisterCode] = useState("");
  const [registerConsent, setRegisterConsent] = useState(false);
  const [registerCountdown, setRegisterCountdown] = useState(0);
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    if (loginCountdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setLoginCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loginCountdown]);

  useEffect(() => {
    if (registerCountdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRegisterCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [registerCountdown]);

  const showToast = (toast: Omit<ToastState, "id">) => {
    const id = Date.now();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  };

  const sendLoginCode = () => {
    if (!loginEmail.trim()) {
      showToast({
        title: "Email required",
        description: "Enter an email address before requesting a code.",
        tone: "error"
      });
      return;
    }

    setLoginCountdown(60);
    showToast({
      title: "Demo verification code sent: 123456",
      description: "Use this prototype code to continue.",
      tone: "success"
    });
  };

  const sendRegisterCode = () => {
    if (!registerEmail.trim()) {
      showToast({
        title: "Email required",
        description: "Enter an email address before requesting a code.",
        tone: "error"
      });
      return;
    }

    setRegisterCountdown(60);
    showToast({
      title: "Demo verification code sent: 123456",
      description: "Use this prototype code to create the account.",
      tone: "success"
    });
  };

  const handleLogin = async () => {
    if (!loginEmail.trim()) {
      showToast({
        title: "Email required",
        description: "Enter your demo email address.",
        tone: "error"
      });
      return;
    }

    if (loginCode !== VERIFICATION_CODE) {
      showToast({
        title: "Invalid verification code",
        description: "Use 123456 for this MedLink prototype.",
        tone: "error"
      });
      return;
    }

    setLoginLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await login({ email: loginEmail, password: "demo-verification" });
    router.push("/journey");
  };

  const handleDemoPatient = async () => {
    setLoginLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    authService.logout();
    persistLocalUser(
      createPrototypeUser({
        name: "Demo Patient",
        email: "patient.demo@medlink.example",
        roleLabel: "Patient"
      })
    );
    window.location.assign("/journey");
  };

  const handleRegister = async () => {
    if (!registerName.trim() || !registerEmail.trim() || !registerRole) {
      showToast({
        title: "Missing registration details",
        description: "Complete name, email, and role before creating the account.",
        tone: "error"
      });
      return;
    }

    if (!registerConsent) {
      showToast({
        title: "Consent required",
        description: "Agree to the simulated privacy and prototype terms to continue.",
        tone: "error"
      });
      return;
    }

    if (registerCode !== VERIFICATION_CODE) {
      showToast({
        title: "Invalid verification code",
        description: "Use 123456 for this MedLink prototype.",
        tone: "error"
      });
      return;
    }

    setRegisterLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    authService.logout();
    persistLocalUser(
      createPrototypeUser({
        name: registerName.trim(),
        email: registerEmail.trim(),
        roleLabel: registerRole
      })
    );
    window.location.assign("/journey");
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-sky-50 to-slate-50 px-5 py-8 sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative hidden min-h-[620px] flex-col justify-between lg:flex"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-700">
              <LockKeyhole className="h-3.5 w-3.5" />
              Secure prototype access
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight text-slate-900">
              Verify identity before coordinating care across the MedLink network.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
              This demo uses simulated verification and local prototype sessions to show how consent, routing, and audit modules fit together.
            </p>
          </div>

          <div className="relative h-[380px]">
            <div className="absolute inset-6 rounded-full border border-sky-400/10 bg-sky-50" />
            <div className="absolute inset-20 rounded-full border border-sky-200/70" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 380" aria-hidden="true">
              <motion.path
                d="M280 174 L280 72"
                stroke="rgba(14, 165, 233, 0.28)"
                strokeWidth="1.5"
                strokeDasharray="8 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.25 }}
              />
              <motion.path
                d="M280 190 L138 295"
                stroke="rgba(20, 184, 166, 0.34)"
                strokeWidth="1.5"
                strokeDasharray="8 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              />
              <motion.path
                d="M280 190 L422 295"
                stroke="rgba(59, 130, 246, 0.34)"
                strokeWidth="1.5"
                strokeDasharray="8 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.55 }}
              />
            </svg>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="glass-card absolute left-1/2 top-1/2 z-10 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-600">Identity node</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">did:medlink:login</p>
                </div>
              </div>
            </motion.div>

            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.label}
                  className={`glass-card absolute z-20 w-40 rounded-2xl p-4 ${module.className}`}
                  animate={{ y: [0, index % 2 === 0 ? 8 : -8, 0] }}
                  transition={{ duration: 4 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{module.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{module.detail}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {securityBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 ">
                <Check className="h-4 w-4 shrink-0 text-emerald-700" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 28, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="glass-card mx-auto w-full max-w-xl rounded-2xl p-5 sm:p-7"
        >
          <div className="mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-900">Access MedLink</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter the demo verification code to continue into the patient journey.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(["login", "register"] as TabMode[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-white hover:text-sky-600"
                }`}
              >
                {tab === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="grid gap-4"
              >
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Email
                  <span className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      type="email"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                      placeholder="clinician@hospital.example"
                    />
                  </span>
                </label>

                <button
                  type="button"
                  onClick={sendLoginCode}
                  disabled={loginCountdown > 0}
                  className="glass-button h-12 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loginCountdown > 0 ? `Resend in ${loginCountdown}s` : "Send Verification Code"}
                </button>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Verification code
                  <input
                    value={loginCode}
                    onChange={(event) => setLoginCode(event.target.value)}
                    inputMode="numeric"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                    placeholder="123456"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="primary-button h-12 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Login
                  {!loginLoading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>

                <button
                  type="button"
                  onClick={handleDemoPatient}
                  disabled={loginLoading}
                  className="glass-button h-12 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Continue as Demo Patient
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="grid gap-4"
              >
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Full name
                  <input
                    value={registerName}
                    onChange={(event) => setRegisterName(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                    placeholder="Avery Chen"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Email
                  <input
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    type="email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                    placeholder="name@example.edu"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Role
                  <span className="relative">
                    <select
                      value={registerRole}
                      onChange={(event) => setRegisterRole(event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-sky-400"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role} className="bg-white text-slate-900">
                          {role}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </span>
                </label>

                <button
                  type="button"
                  onClick={sendRegisterCode}
                  disabled={registerCountdown > 0}
                  className="glass-button h-12 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registerCountdown > 0 ? `Resend in ${registerCountdown}s` : "Send Verification Code"}
                </button>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Verification code
                  <input
                    value={registerCode}
                    onChange={(event) => setRegisterCode(event.target.value)}
                    inputMode="numeric"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400"
                    placeholder="123456"
                  />
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                  <input
                    checked={registerConsent}
                    onChange={(event) => setRegisterConsent(event.target.checked)}
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 bg-white accent-sky-500"
                  />
                  <span>I agree to the simulated data privacy and prototype terms.</span>
                </label>

                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={registerLoading}
                  className="primary-button h-12 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create Account
                  {!registerLoading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      <div className="fixed right-4 top-20 z-50 grid w-[calc(100vw-2rem)] max-w-sm gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xl "
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    toast.tone === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {toast.tone === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-xs leading-5 text-slate-500">{toast.description}</p> : null}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
