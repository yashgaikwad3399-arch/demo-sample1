export interface HealthStatus {
  status: 'online' | 'degraded' | 'offline';
  server: {
    uptimeSeconds: number;
    environment: string;
    nodeVersion: string;
    timestamp: string;
  };
  database: {
    status: 'connected' | 'disconnected';
    details: string;
    target: string;
  };
  api: {
    version: string;
    activeStage: string;
  };
}

export interface SystemInfo {
  name: string;
  roleSupport: string[];
  supportedSubjects: { code: string; name: string }[];
  architecture: {
    frontend: string;
    backend: string;
    database: string;
    security: string;
  };
  roadmap: {
    currentStep: string;
    nextStep: string;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  roll_number: string | null;
  role: 'STUDENT' | 'ADMIN';
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface RegisterStudentData {
  name: string;
  email: string;
  roll_number: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AvailableExam {
  id: number;
  code: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingPercentage: number;
  totalQuestions: number;
  totalMarks: number;
  subjectTag: string;
  status: string;
  syllabus: string[];
}

export interface ExamHistoryItem {
  id: number;
  subjectId: number;
  subject?: string;
  subjectName: string;
  subjectCode: string;
  date?: string;
  isoDate?: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  totalMarks: number;
  scoreDisplay?: string;
  percentage: number;
  percentageDisplay?: string;
  resultStatus?: string;
  status: string;
  passed: boolean;
  passingPercentage: number;
  startTime: string;
  endTime: string | null;
}

export interface LatestResultResponse {
  success: boolean;
  hasAttempted: boolean;
  latestResult: ExamHistoryItem | null;
  message?: string;
}

export interface AvailableExamsResponse {
  success: boolean;
  count: number;
  exams: AvailableExam[];
}

export interface ExamHistoryResponse {
  success: boolean;
  count: number;
  history: ExamHistoryItem[];
}

export interface ExamInstructionDetails {
  id: number;
  code: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingPercentage: number;
  totalQuestions: number;
  totalMarks: number;
  rules: string[];
}

export interface ExamQuestion {
  id: number;
  questionNumber: number;
  subjectId: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  difficulty: string;
  marks: number;
}

export interface ExamQuestionsResponse {
  success: boolean;
  subject: {
    id: number;
    code: string;
    name: string;
    durationMinutes: number;
    passingPercentage: number;
  };
  count: number;
  questions: ExamQuestion[];
}

export interface SubmitExamPayload {
  subjectCode: string;
  startTime: string;
  answers: Record<string, string | null>;
  isAutoSubmitted?: boolean;
}

export interface ExamSubmissionResult {
  success: boolean;
  message: string;
  attemptId: number;
  result: {
    attemptId: number;
    subjectId: number;
    subjectName: string;
    subjectCode: string;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredCount: number;
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
    passingPercentage: number;
    status: string;
    startTime: string;
    endTime: string;
  };
}

export interface ItemizedAnswerReview {
  questionId: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedOption: string | null;
  correctOption: string;
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
  explanation: string;
}

export interface SeedQuestion {
  id?: number;
  subject_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation: string;
}

export interface AdminQuestionItem {
  id: number;
  subject_id: number;
  subject_name?: string;
  subject_code?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation: string;
}

export interface AdminOverviewStats {
  totalStudents: number;
  totalQuestions: number;
  javaQuestions: number;
  sqlQuestions: number;
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  overallPassRate: number;
  avgScorePercentage: number;
  subjectsCount: number;
}

export interface AdminStudentItem {
  id: number;
  name: string;
  roll_number: string | null;
  email: string;
  role: string;
  department?: string;
  semester?: string;
  phone?: string;
  created_at: string;
  stats: {
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    highestScore: number;
    lastAttemptDate: string | null;
  };
}

export interface AdminAttemptItem {
  id: number;
  user_id: number;
  student_name: string;
  roll_number: string;
  student_email: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  passing_percentage: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  total_marks: number;
  percentage: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT';
  start_time: string;
  end_time: string | null;
}

export interface ExamResultReviewResponse {
  success: boolean;
  attempt: {
    id: number;
    userId: number;
    studentName: string;
    rollNumber: string;
    subjectId: number;
    subjectName: string;
    subjectCode: string;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    totalMarks: number;
    percentage: number;
    status: string;
    passed: boolean;
    passingPercentage: number;
    startTime: string;
    endTime: string;
  };
  itemizedReview: ItemizedAnswerReview[];
}




