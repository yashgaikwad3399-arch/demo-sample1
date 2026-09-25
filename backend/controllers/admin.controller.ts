import { Request, Response } from 'express';
import { dbService } from '../database/dbService';

/**
 * Controller providing comprehensive administration endpoints:
 * - Question Bank CRUD (Add, View, Update, Delete)
 * - Student Directory & Performance Oversight
 * - Full Exam Attempts Log Audit & Management
 * - Global KPI Analytics
 */

/**
 * GET /api/admin/overview
 * Fetch high-level admin statistics and metrics
 */
export async function getAdminOverview(req: Request, res: Response): Promise<void> {
  try {
    const users = await dbService.getUsers();
    const subjects = await dbService.getSubjects();
    const questions = await dbService.getQuestions();
    const attempts = await dbService.getAttempts();

    const students = users.filter((u) => u.role === 'STUDENT');
    const javaQuestions = questions.filter((q) => q.subject_id === 1).length;
    const sqlQuestions = questions.filter((q) => q.subject_id === 2).length;

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => Number(a.percentage) >= 50).length;
    const overallPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    const avgScorePercentage =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / totalAttempts)
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalStudents: students.length,
        totalQuestions: questions.length,
        javaQuestions,
        sqlQuestions,
        totalAttempts,
        passedAttempts,
        failedAttempts: totalAttempts - passedAttempts,
        overallPassRate,
        avgScorePercentage,
        subjectsCount: subjects.length,
      },
    });
  } catch (error: any) {
    console.error('❌ [Admin Overview Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative overview metrics.',
      error: error.message,
    });
  }
}

/**
 * GET /api/admin/questions
 * List all questions in the bank with optional subject filter
 */
export async function getAllQuestions(req: Request, res: Response): Promise<void> {
  try {
    const { subject, difficulty } = req.query;
    let questions = await dbService.getQuestions();
    const subjects = await dbService.getSubjects();

    if (subject) {
      const subjectCode = String(subject).toUpperCase();
      const matchedSubject = subjects.find((s) => s.code.toUpperCase() === subjectCode);
      if (matchedSubject) {
        questions = questions.filter((q) => q.subject_id === matchedSubject.id);
      }
    }

    if (difficulty) {
      const diff = String(difficulty).toUpperCase();
      questions = questions.filter((q) => q.difficulty.toUpperCase() === diff);
    }

    // Attach subject metadata
    const enriched = questions.map((q) => {
      const sub = subjects.find((s) => s.id === q.subject_id);
      return {
        ...q,
        subjectCode: sub?.code || 'GEN',
        subjectName: sub?.name || 'General',
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      questions: enriched,
    });
  } catch (error: any) {
    console.error('❌ [Admin Questions Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve question bank.',
      error: error.message,
    });
  }
}

/**
 * POST /api/admin/questions
 * Add a new MCQ to the question bank
 */
export async function createQuestion(req: Request, res: Response): Promise<void> {
  try {
    const {
      subject_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      marks,
      difficulty,
      explanation,
    } = req.body;

    if (!subject_id || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      res.status(400).json({
        success: false,
        message: 'Missing required question fields (subject_id, question_text, 4 options, and correct_option).',
      });
      return;
    }

    if (!['A', 'B', 'C', 'D'].includes(String(correct_option).toUpperCase())) {
      res.status(400).json({
        success: false,
        message: 'correct_option must be one of "A", "B", "C", or "D".',
      });
      return;
    }

    const created = await dbService.addQuestion({
      subject_id: Number(subject_id),
      question_text: String(question_text).trim(),
      option_a: String(option_a).trim(),
      option_b: String(option_b).trim(),
      option_c: String(option_c).trim(),
      option_d: String(option_d).trim(),
      correct_option: String(correct_option).toUpperCase() as 'A' | 'B' | 'C' | 'D',
      marks: marks ? Number(marks) : 1,
      difficulty: difficulty ? (String(difficulty).toUpperCase() as any) : 'MEDIUM',
      explanation: explanation ? String(explanation).trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Question successfully authored and added to database bank.',
      question: created,
    });
  } catch (error: any) {
    console.error('❌ [Admin Create Question Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question.',
      error: error.message,
    });
  }
}

/**
 * PUT /api/admin/questions/:id
 * Update an existing question
 */
export async function updateQuestion(req: Request, res: Response): Promise<void> {
  try {
    const questionId = Number(req.params.id);
    if (isNaN(questionId)) {
      res.status(400).json({ success: false, message: 'Invalid question ID provided.' });
      return;
    }

    const updated = await dbService.updateQuestion(questionId, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      question: updated,
    });
  } catch (error: any) {
    console.error('❌ [Admin Update Question Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question.',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/admin/questions/:id
 * Delete a question from the question bank
 */
export async function deleteQuestion(req: Request, res: Response): Promise<void> {
  try {
    const questionId = Number(req.params.id);
    if (isNaN(questionId)) {
      res.status(400).json({ success: false, message: 'Invalid question ID provided.' });
      return;
    }

    const success = await dbService.deleteQuestion(questionId);
    res.status(200).json({
      success,
      message: success ? 'Question deleted successfully.' : 'Question could not be found or deleted.',
    });
  } catch (error: any) {
    console.error('❌ [Admin Delete Question Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question.',
      error: error.message,
    });
  }
}

/**
 * GET /api/admin/students
 * List all registered students with aggregate academic metrics
 */
export async function getAllStudents(req: Request, res: Response): Promise<void> {
  try {
    const students = await dbService.getAllStudentsWithStats();
    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error: any) {
    console.error('❌ [Admin Students Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students list.',
      error: error.message,
    });
  }
}

/**
 * GET /api/admin/attempts
 * List all examination attempts across the entire student roster
 */
export async function getAllExamAttempts(req: Request, res: Response): Promise<void> {
  try {
    const { subject, status } = req.query;
    let attempts = await dbService.getAllAttemptsWithDetails();

    if (subject) {
      const sub = String(subject).toUpperCase();
      attempts = attempts.filter((a) => a.subject_code.toUpperCase() === sub);
    }

    if (status) {
      const st = String(status).toUpperCase();
      if (st === 'PASSED') {
        attempts = attempts.filter((a) => Number(a.percentage) >= (a.passing_percentage || 50));
      } else if (st === 'FAILED') {
        attempts = attempts.filter((a) => Number(a.percentage) < (a.passing_percentage || 50));
      }
    }

    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts: attempts.map((a) => ({
        id: a.id,
        userId: a.user_id,
        studentName: a.student_name,
        rollNumber: a.roll_number,
        email: a.student_email,
        subjectId: a.subject_id,
        subjectCode: a.subject_code,
        subjectName: a.subject_name,
        date: a.start_time
          ? new Date(a.start_time).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'N/A',
        totalQuestions: a.total_questions,
        correctAnswers: a.correct_answers,
        incorrectAnswers: a.total_questions - a.correct_answers,
        score: Number(a.score),
        totalMarks: Number(a.total_marks),
        percentage: Number(a.percentage),
        status: a.status,
        passed: Number(a.percentage) >= (a.passing_percentage || 50),
        startTime: a.start_time,
        endTime: a.end_time,
      })),
    });
  } catch (error: any) {
    console.error('❌ [Admin Attempts Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve exam attempts.',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/admin/attempts/:id
 * Delete an attempt
 */
export async function deleteExamAttempt(req: Request, res: Response): Promise<void> {
  try {
    const attemptId = Number(req.params.id);
    if (isNaN(attemptId)) {
      res.status(400).json({ success: false, message: 'Invalid attempt ID.' });
      return;
    }

    const deleted = await dbService.deleteExamAttempt(attemptId);
    res.status(200).json({
      success: deleted,
      message: deleted ? 'Examination attempt record purged.' : 'Record not found.',
    });
  } catch (error: any) {
    console.error('❌ [Admin Delete Attempt Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attempt record.',
      error: error.message,
    });
  }
}
