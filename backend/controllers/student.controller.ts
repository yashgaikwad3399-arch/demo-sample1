import { Request, Response } from 'express';
import { dbService } from '../database/dbService';

/**
 * Controller for Student Portal APIs
 * All endpoints require valid JWT authentication and STUDENT role clearance.
 */

// 1. GET /api/student/profile
export const getStudentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Unauthorized. User session missing.' });
      return;
    }

    const user = await dbService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Student record not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        roll_number: user.roll_number,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student profile.',
      error: error.message,
    });
  }
};

// 2. GET /api/student/exams
export const getAvailableExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const exams = await dbService.getAvailableExams();
    
    // Map with user-friendly examination track details
    const formattedExams = exams.map((exam) => ({
      id: exam.id,
      code: exam.code,
      title: exam.name,
      description: exam.description,
      durationMinutes: exam.duration_minutes || 30,
      passingPercentage: exam.passing_percentage || 50.0,
      totalQuestions: Number(exam.question_count) || 5,
      totalMarks: Number(exam.total_possible_marks) || 5,
      subjectTag: exam.code === 'JAVA' ? 'Core Java Programming' : 'Database Management & SQL',
      status: 'AVAILABLE',
      syllabus: exam.code === 'JAVA'
        ? ['OOP & Inheritance', 'Exception Handling', 'Collections API', 'JVM & Threading']
        : ['Relational Schema & 3NF', 'DDL / DML / DQL', 'Complex JOINs', 'Subqueries & Aggregations'],
    }));

    res.status(200).json({
      success: true,
      count: formattedExams.length,
      exams: formattedExams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available examination tracks.',
      error: error.message,
    });
  }
};

// Helper to format date like "10 Sept 2026"
const formatExamDate = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return isoString;
  }
};

// 3. GET /api/student/history
// Retrieves ONLY the currently authenticated student's examination history.
// Strictly prevents viewing another student's history via req.user.id.
// Supports sorting and filtering by Java/SQL.
export const getExamHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Unauthorized. User session missing.' });
      return;
    }

    // Query parameters for optional server-side filtering & sorting
    const subjectFilter = req.query.subject ? String(req.query.subject).toUpperCase().trim() : 'ALL';
    const sortBy = req.query.sort ? String(req.query.sort).toLowerCase().trim() : 'date_desc';
    const statusFilter = req.query.status ? String(req.query.status).toUpperCase().trim() : 'ALL';

    // Strictly fetch ONLY this student's records from the database
    let attempts = await dbService.getAttemptsByUserId(req.user.id);

    // Apply subject filter if specified (e.g. 'JAVA' or 'SQL')
    if (subjectFilter !== 'ALL') {
      attempts = attempts.filter((att) => {
        const code = String(att.subject_code || '').toUpperCase();
        return code === subjectFilter;
      });
    }

    let formattedHistory = attempts.map((att) => {
      const percentage = Number(att.percentage);
      const passingThreshold = att.passing_percentage || 50.0;
      const passed = percentage >= passingThreshold;
      const score = Number(att.score);
      const totalMarks = Number(att.total_marks);
      const totalQuestions = att.total_questions;
      const correctAnswers = att.correct_answers;
      const incorrectAnswers = Math.max(0, totalQuestions - correctAnswers);

      return {
        id: att.id,
        subjectId: att.subject_id,
        subject: att.subject_code === 'JAVA' ? 'Java' : att.subject_code === 'SQL' ? 'SQL' : att.subject_name,
        subjectName: att.subject_name,
        subjectCode: att.subject_code,
        date: formatExamDate(att.start_time),
        isoDate: att.start_time,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        score,
        totalMarks,
        scoreDisplay: `${score}/${totalMarks}`,
        percentage,
        percentageDisplay: `${percentage}%`,
        resultStatus: passed ? 'Passed' : 'Failed',
        passed,
        passingPercentage: passingThreshold,
        status: att.status,
        startTime: att.start_time,
        endTime: att.end_time,
      };
    });

    // Apply status filter if specified
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PASSED') {
        formattedHistory = formattedHistory.filter((item) => item.passed);
      } else if (statusFilter === 'FAILED') {
        formattedHistory = formattedHistory.filter((item) => !item.passed);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'date_asc':
        formattedHistory.sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());
        break;
      case 'score_desc':
        formattedHistory.sort((a, b) => b.score - a.score);
        break;
      case 'score_asc':
        formattedHistory.sort((a, b) => a.score - b.score);
        break;
      case 'percentage_desc':
        formattedHistory.sort((a, b) => b.percentage - a.percentage);
        break;
      case 'percentage_asc':
        formattedHistory.sort((a, b) => a.percentage - b.percentage);
        break;
      case 'subject_asc':
        formattedHistory.sort((a, b) => a.subject.localeCompare(b.subject));
        break;
      case 'subject_desc':
        formattedHistory.sort((a, b) => b.subject.localeCompare(a.subject));
        break;
      case 'date_desc':
      default:
        formattedHistory.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
        break;
    }

    res.status(200).json({
      success: true,
      studentId: req.user.id,
      count: formattedHistory.length,
      history: formattedHistory,
      filtersApplied: {
        subject: subjectFilter,
        sort: sortBy,
        status: statusFilter,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve examination history.',
      error: error.message,
    });
  }
};

// 4. GET /api/student/latest-result
export const getLatestResult = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Unauthorized. User session missing.' });
      return;
    }

    const latest = await dbService.getLatestAttemptByUserId(req.user.id);

    if (!latest) {
      res.status(200).json({
        success: true,
        hasAttempted: false,
        latestResult: null,
        message: 'No previous examinations attempted yet.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      hasAttempted: true,
      latestResult: {
        id: latest.id,
        subjectId: latest.subject_id,
        subjectName: latest.subject_name,
        subjectCode: latest.subject_code,
        totalQuestions: latest.total_questions,
        correctAnswers: latest.correct_answers,
        score: Number(latest.score),
        totalMarks: Number(latest.total_marks),
        percentage: Number(latest.percentage),
        status: latest.status,
        passed: Number(latest.percentage) >= (latest.passing_percentage || 50.0),
        passingPercentage: latest.passing_percentage || 50.0,
        startTime: latest.start_time,
        endTime: latest.end_time,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest examination result.',
      error: error.message,
    });
  }
};

// 5. GET /api/student/history/:attemptId
// Retrieves the full details of a specific examination attempt.
// STRICT PRIVACY ENFORCEMENT: Verifies that this attempt belongs to the authenticated student (req.user.id).
// If another student tries to view this result, returns 403 Forbidden.
export const getStudentAttemptDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Unauthorized. User session missing.' });
      return;
    }

    const attemptId = Number(req.params.attemptId);
    if (!attemptId || isNaN(attemptId)) {
      res.status(400).json({ success: false, message: 'Invalid attempt ID provided.' });
      return;
    }

    const resultReview = await dbService.getAttemptWithReview(attemptId, req.user.id);
    if (!resultReview) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Examination attempt not found or does not belong to your student account.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      ...resultReview,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve examination attempt details.',
      error: error.message,
    });
  }
};
