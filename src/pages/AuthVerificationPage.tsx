import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Play,
  Copy,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Code,
  GraduationCap,
} from 'lucide-react';
import axios from 'axios';

export const AuthVerificationPage: React.FC = () => {
  const { user, token, isAuthenticated, logout } = useAuth();

  // Test states
  const [activeTab, setActiveTab] = useState<'overview' | 'api-tests' | 'jwt-inspector' | 'code-review'>('overview');
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/auth/profile');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST'>('GET');
  const [customToken, setCustomToken] = useState<string>(token || '');
  const [useTokenHeader, setUseTokenHeader] = useState<boolean>(true);
  const [requestBody, setRequestBody] = useState<string>('{}');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Synchronize customToken when user logs in/out
  React.useEffect(() => {
    if (token) {
      setCustomToken(token);
    }
  }, [token]);

  // Decode JWT payload helper
  const getDecodedPayload = () => {
    const t = customToken || token;
    if (!t) return null;
    try {
      const parts = t.split('.');
      if (parts.length !== 3) return null;
      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch {
      return null;
    }
  };

  const decodedPayload = getDecodedPayload();

  // Run live API test
  const handleExecuteApiTest = async (endpoint: string, method: 'GET' | 'POST', body?: any) => {
    setIsLoading(true);
    setApiResponse(null);
    setResponseStatus(null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useTokenHeader && customToken) {
      headers['Authorization'] = `Bearer ${customToken}`;
    }

    try {
      const res = await axios({
        method,
        url: endpoint,
        headers,
        data: method === 'POST' ? body || JSON.parse(requestBody || '{}') : undefined,
        validateStatus: () => true, // Don't throw for 4xx/5xx so we display status code
      });

      setResponseStatus(res.status);
      setApiResponse(res.data);
    } catch (err: any) {
      setResponseStatus(err.response?.status || 500);
      setApiResponse(err.response?.data || { error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="auth-verification-page" className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              <span>STEP 3: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Authentication & Security Engine
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Complete authentication implementation featuring bcrypt password hashing (10 salt rounds),
              stateless JSON Web Tokens (JWT), Express middleware verification, role-based authorization,
              and strict protection against password leaks and duplicate registrations.
            </p>
          </div>

          {/* Active Session Status Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[280px]">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Current Session</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isAuthenticated
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isAuthenticated ? 'AUTHENTICATED' : 'ANONYMOUS'}
              </span>
            </div>
            {isAuthenticated && user ? (
              <div className="space-y-1 text-xs text-slate-700">
                <div className="font-bold text-slate-900">{user.name}</div>
                <div className="text-slate-500 font-mono text-[11px]">{user.email}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                      user.role === 'ADMIN'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Role: {user.role}
                  </span>
                  {user.roll_number && (
                    <span className="text-[11px] text-slate-600 font-mono">
                      Roll: {user.roll_number}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No active JWT session. Log in as Student or Admin to generate a cryptographic token.
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-b border-slate-200 flex items-center gap-2 sm:gap-4 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 px-1 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Architecture & Security Flow
          </button>
          <button
            onClick={() => setActiveTab('api-tests')}
            className={`pb-3 border-b-2 px-1 transition whitespace-nowrap ${
              activeTab === 'api-tests'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Live API Test Runner
          </button>
          <button
            onClick={() => setActiveTab('jwt-inspector')}
            className={`pb-3 border-b-2 px-1 transition whitespace-nowrap ${
              activeTab === 'jwt-inspector'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. JWT Token Inspector
          </button>
          <button
            onClick={() => setActiveTab('code-review')}
            className={`pb-3 border-b-2 px-1 transition whitespace-nowrap ${
              activeTab === 'code-review'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Implementation Code
          </button>
        </div>
      </div>

      {/* TAB 1: ARCHITECTURE OVERVIEW & SECURITY RULES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Rules & Mandates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Mandatory Security Rules Enforced</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Zero Plain-Text Storage:</strong> Every password is hashed with salted bcrypt (10 rounds) before hitting MySQL.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Zero Password Leakage:</strong> APIs completely omit <code>password</code> and <code>password_hash</code> from responses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Email & Required Validation:</strong> Strict RFC 5322 regex checks on email, required roll number for students.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Duplicate Prevention:</strong> Prevents collisions for email addresses and student roll numbers (409 Conflict).</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-sm mb-3">
                <Lock className="w-5 h-5 text-indigo-600" />
                <span>Role-Based Access Control (RBAC)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Student Role Restrictions:</strong> Students cannot access administrative question management or reports (returns <strong>403 Forbidden</strong>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Unauthenticated Protection:</strong> Requests missing Authorization headers or bearing expired tokens receive <strong>401 Unauthorized</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Stateless Token Verification:</strong> Signature and expiration are validated via HMAC SHA-256 with <code>ENV.JWT.SECRET</code>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Client Persistence:</strong> Context synchronizes localStorage and verifies token against <code>/api/auth/profile</code> on startup.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Authentication Flow Diagram */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span>Step-by-Step Authentication Lifecycle</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 mb-1">Step A: Registration</div>
                <div className="text-slate-600 space-y-1">
                  <div>1. Candidate enters Name, Roll No, Email, Password.</div>
                  <div>2. Server validates format & duplicate constraints.</div>
                  <div>3. <code>bcrypt.hash(password, 10)</code> computes salted hash.</div>
                  <div>4. Insert into MySQL <code>users</code> table.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 mb-1">Step B: Login & JWT</div>
                <div className="text-slate-600 space-y-1">
                  <div>1. User submits Email and Password.</div>
                  <div>2. Query user by email from MySQL.</div>
                  <div>3. <code>bcrypt.compare()</code> verifies match.</div>
                  <div>4. <code>jwt.sign(payload, SECRET)</code> creates token.</div>
                  <div>5. Token + safe user metadata sent to client.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 mb-1">Step C: Auth Middleware</div>
                <div className="text-slate-600 space-y-1">
                  <div>1. Client sends <code>Authorization: Bearer &lt;token&gt;</code>.</div>
                  <div>2. <code>authenticateToken</code> checks presence.</div>
                  <div>3. <code>jwt.verify()</code> confirms valid signature.</div>
                  <div>4. Decoded payload attached to <code>req.user</code>.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 mb-1">Step D: RBAC Middleware</div>
                <div className="text-slate-600 space-y-1">
                  <div>1. <code>requireRole('ADMIN')</code> checks clearance.</div>
                  <div>2. If <code>req.user.role !== 'ADMIN'</code>: HTTP 403.</div>
                  <div>3. If valid: proceeds to controller handler.</div>
                  <div>4. Controller executes business logic safely.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE API TEST RUNNER */}
      {activeTab === 'api-tests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>Interactive REST API Test Console</span>
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Trigger protected and public endpoints below to observe HTTP status codes, authorization header handling,
              and role enforcement live.
            </p>

            {/* Quick Test Preset Buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setApiEndpoint('/api/auth/profile');
                  setTestMethod('GET');
                  setUseTokenHeader(true);
                  handleExecuteApiTest('/api/auth/profile', 'GET');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition"
              >
                GET /api/auth/profile (Authenticated)
              </button>

              <button
                onClick={() => {
                  setApiEndpoint('/api/auth/admin-only');
                  setTestMethod('GET');
                  setUseTokenHeader(true);
                  handleExecuteApiTest('/api/auth/admin-only', 'GET');
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-medium transition"
              >
                GET /api/auth/admin-only (RBAC Admin)
              </button>

              <button
                onClick={() => {
                  setApiEndpoint('/api/auth/student-only');
                  setTestMethod('GET');
                  setUseTokenHeader(true);
                  handleExecuteApiTest('/api/auth/student-only', 'GET');
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium transition"
              >
                GET /api/auth/student-only (RBAC Student)
              </button>

              <button
                onClick={() => {
                  setApiEndpoint('/api/auth/profile');
                  setTestMethod('GET');
                  setUseTokenHeader(false);
                  handleExecuteApiTest('/api/auth/profile', 'GET');
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-medium transition"
              >
                Test 401: GET /profile (No Token)
              </button>
            </div>

            {/* Custom Request Form */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">HTTP Method</label>
                  <select
                    value={testMethod}
                    onChange={(e) => setTestMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-semibold"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Endpoint URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                    <button
                      onClick={() => handleExecuteApiTest(apiEndpoint, testMethod)}
                      disabled={isLoading}
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      <span>Send Request</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="toggle-auth-header"
                  checked={useTokenHeader}
                  onChange={(e) => setUseTokenHeader(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="toggle-auth-header" className="text-xs text-slate-700 font-medium">
                  Include <code>Authorization: Bearer &lt;token&gt;</code> in request header
                </label>
              </div>
            </div>

            {/* Live Response Panel */}
            {apiResponse !== null && (
              <div className="mt-6 border-t border-slate-100 pt-5 animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Response Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                        responseStatus === 200 || responseStatus === 201
                          ? 'bg-emerald-100 text-emerald-800'
                          : responseStatus === 401
                          ? 'bg-amber-100 text-amber-800'
                          : responseStatus === 403
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      HTTP {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 201 ? 'CREATED' : responseStatus === 401 ? 'UNAUTHORIZED' : responseStatus === 403 ? 'FORBIDDEN' : ''}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-emerald-400 font-mono text-xs max-h-72">
                  <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: JWT TOKEN INSPECTOR */}
      {activeTab === 'jwt-inspector' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Cryptographic JWT Token Claims</span>
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Inspect the active signed JWT token payload issued by the Express authentication server.
            </p>

            {token ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Raw Encoded JWT (Compact String)</label>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 break-all select-all">
                    {token}
                  </div>
                </div>

                {decodedPayload && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Decoded Claims (Payload)</label>
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-amber-300 overflow-x-auto">
                      <pre>{JSON.stringify(decodedPayload, null, 2)}</pre>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-slate-500 text-[11px]">Subject / User ID</div>
                        <div className="font-bold text-slate-900">{decodedPayload.id}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-slate-500 text-[11px]">Enforced Role</div>
                        <div className="font-bold text-slate-900">{decodedPayload.role}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-slate-500 text-[11px]">Roll Number</div>
                        <div className="font-bold text-slate-900">{decodedPayload.roll_number || 'N/A (Admin)'}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-slate-500 text-[11px]">Expires In</div>
                        <div className="font-bold text-slate-900">
                          {decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toLocaleTimeString() : '24 Hours'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-700">No active JWT in browser localStorage</div>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Log in with a student or admin test account to generate and inspect a JWT.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                >
                  Go to Login Page
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: IMPLEMENTATION CODE */}
      {activeTab === 'code-review' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span>Core Security Implementations</span>
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Review the complete source code for authentication controllers, middleware, and route protection.
            </p>

            <div className="space-y-6 text-xs">
              <div>
                <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-4 py-2 rounded-t-xl font-mono text-[11px]">
                  <span>backend/middleware/auth.middleware.ts</span>
                  <span className="text-slate-400">JWT Authentication & Role Authorization</span>
                </div>
                <div className="bg-slate-900 rounded-b-xl p-4 text-emerald-400 font-mono overflow-x-auto max-h-64">
                  <pre>{`// 1. Verify Authorization Bearer JWT Token
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT.SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// 2. Role-Based Authorization Guard (RBAC)
export const requireRole = (...allowedRoles: ('STUDENT' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. Clearance restricted to ' + allowedRoles.join(' or ')
      });
      return;
    }
    next();
  };
};`}</pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-4 py-2 rounded-t-xl font-mono text-[11px]">
                  <span>backend/controllers/auth.controller.ts (Password Hashing & Token Issuance)</span>
                  <span className="text-slate-400">bcrypt 10 Rounds & Zero Leakage</span>
                </div>
                <div className="bg-slate-900 rounded-b-xl p-4 text-emerald-400 font-mono overflow-x-auto max-h-64">
                  <pre>{`// Password Hashing on Registration:
const saltRounds = 10;
const password_hash = await bcrypt.hash(password, saltRounds);

// Password Verification on Login:
const isPasswordValid = await bcrypt.compare(password, user.password_hash);
if (!isPasswordValid) {
  return res.status(401).json({ success: false, message: 'Invalid email or password.' });
}

// Token Generation:
const token = jwt.sign(tokenPayload, ENV.JWT.SECRET, { expiresIn: '24h' });

// Safe Return: Never return password or password_hash
res.status(200).json({
  success: true,
  token,
  user: { id: user.id, name: user.name, email: user.email, roll_number: user.roll_number, role: user.role }
});`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
