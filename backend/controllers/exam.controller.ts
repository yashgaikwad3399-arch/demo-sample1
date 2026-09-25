import { Request, Response } from 'express';
import { dbService } from '../database/dbService';

/**
 * Examination Controller
 * Enforces zero-leak student questions, server-authoritative scoring, and attempt persistence.
 */

/**
 * GET /api/exam/details/:code
 * Returns public/safe assessment metadata and instructions for Java or SQL.
 */
export const getExamDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ success: false, message: 'Subject code is required.' });
      return;
    }

    const subject = await dbService.getSubjectByCode(code);
    if (!subject || !subject.is_active) {
      res.status(404).json({ success: false, message: `Examination track '${code}' not found or inactive.` });
      return;
    }

    const questions = await dbService.getQuestionsForExamSafe(subject.id);
    const totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);

    res.status(200).json({
      success: true,
      exam: {
        id: subject.id,
        code: subject.code,
        title: subject.name,
        description: subject.description,
        durationMinutes: subject.duration_minutes || 30,
        passingPercentage: subject.passing_percentage || 50.0,
        totalQuestions: questions.length,
        totalMarks,
        rules: [
          'The examination is strictly timed with automated server countdown.',
          'Each multiple-choice question has four choices and exactly one correct answer.',
          'There is no negative marking for incorrect or skipped answers.',
          'You can navigate between questions, change selections, and mark questions for review.',
          'The test will automatically submit when the countdown timer reaches 00:00.',
          'Answers are evaluated on the backend against database answer keys upon submission.',
        ],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve examination details.', error: error.message });
  }
};

/**
 * GET /api/exam/questions/:code
 * CRITICAL SECURITY: Delivers questions to candidate with ZERO answer keys.
 * `correct_option` and `explanation` are deliberately omitted.
 */
export const getExamQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ success: false, message: 'Subject code is required.' });
      return;
    }

    const subject = await dbService.getSubjectByCode(code);
    if (!subject || !subject.is_active) {
      res.status(404).json({ success: false, message: `Examination track '${code}' not found or inactive.` });
      return;
    }

    const rawQuestions = await dbService.getQuestionsForExamSafe(subject.id);

    const questions = rawQuestions.map((q: any, index: number) => ({
      id: q.id,
      questionNumber: index + 1,
      subjectId: q.subject_id,
      questionText: q.question_text,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d,
      },
      difficulty: q.difficulty || 'MEDIUM',
      marks: q.marks || 1,
    }));

    res.status(200).json({
      success: true,
      subject: {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        durationMinutes: subject.duration_minutes || 30,
        passingPercentage: subject.passing_percentage || 50.0,
      },
      count: questions.length,
      questions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve examination questions.', error: error.message });
  }
};

/**
 * POST /api/exam/submit
 * Server-authoritative grading and audit logging.
 * Evaluates candidate responses, generates attempt record, and persists itemized answers in MySQL.
 */
export const submitExam = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Authenticated Student Identity from JWT (Guarantees candidate cannot submit for another user)
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized. Valid student credentials required.' });
      return;
    }

    const { subjectCode, startTime, answers, isAutoSubmitted } = req.body;
    if (!subjectCode) {
      res.status(400).json({ success: false, message: 'Subject code is required for submission.' });
      return;
    }

    const subject = await dbService.getSubjectByCode(subjectCode);
    if (!subject) {
      res.status(404).json({ success: false, message: `Subject '${subjectCode}' not found.` });
      return;
    }

    // 2. Fetch full question answer keys from MySQL for server evaluation
    const questions = await dbService.getQuestionsForEvaluation(subject.id);
    if (questions.length === 0) {
      res.status(400).json({ success: false, message: 'No questions configured for this subject.' });
      return;
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let earnedScore = 0;
    let totalPossibleMarks = 0;

    const formattedAnswersToPersist: {
      question_id: number;
      selected_option: string | null;
      is_correct: boolean;
      marks_awarded: number;
    }[] = [];

    // 3. Backend evaluation against MySQL database keys
    for (const q of questions) {
      const qIdStr = String(q.id);
      const selectedOption = answers && answers[qIdStr] ? String(answers[qIdStr]).toUpperCase() : null;
      const questionMarks = q.marks || 1;
      totalPossibleMarks += questionMarks;

      let isCorrect = false;
      let marksAwarded = 0;

      if (!selectedOption) {
        unansweredCount++;
      } else if (selectedOption === q.correct_option.toUpperCase()) {
        isCorrect = true;
        marksAwarded = questionMarks;
        earnedScore += marksAwarded;
        correctCount++;
      } else {
        incorrectCount++;
      }

      formattedAnswersToPersist.push({
        question_id: q.id,
        selected_option: selectedOption,
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
      });
    }

    // 4. Score metrics calculation
    const calculatedPercentage = totalPossibleMarks > 0
      ? Number(((earnedScore / totalPossibleMarks) * 100).toFixed(2))
      : 0;

    const passingThreshold = subject.passing_percentage || 50.0;
    const isPassed = calculatedPercentage >= passingThreshold;
    const finalStatus = isAutoSubmitted ? 'TIMED_OUT' : 'COMPLETED';
    const examEndTime = new Date().toISOString();
    const examStartTime = startTime ? new Date(startTime).toISOString() : examEndTime;

    // 5. Persist attempt in MySQL
    const attemptId = await dbService.saveAttempt({
      user_id: userId,
      subject_id: subject.id,
      total_questions: questions.length,
      correct_answers: correctCount,
      score: earnedScore,
      total_marks: totalPossibleMarks,
      percentage: calculatedPercentage,
      status: finalStatus,
      start_time: examStartTime,
      end_time: examEndTime,
    });

    // 6. Persist individual answer records in MySQL
    await dbService.saveAnswerRecords(
      formattedAnswersToPersist.map((ans) => ({
        attempt_id: attemptId,
        ...ans,
      }))
    );

    // 7. Return evaluated scorecard to candidate
    res.status(200).json({
      success: true,
      message: isAutoSubmitted
        ? 'Time expired. Examination automatically submitted and evaluated.'
        : 'Examination submitted and evaluated successfully.',
      attemptId,
      result: {
        attemptId,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        unansweredCount,
        score: earnedScore,
        totalMarks: totalPossibleMarks,
        percentage: calculatedPercentage,
        passed: isPassed,
        passingPercentage: passingThreshold,
        status: finalStatus,
        startTime: examStartTime,
        endTime: examEndTime,
      },
    });
  } catch (error: any) {
    console.error('Submission evaluation error:', error);
    res.status(500).json({ success: false, message: 'Server evaluation failed.', error: error.message });
  }
};

/**
 * GET /api/exam/result/:attemptId
 * Returns complete score details with question review.
 * Enforces ownership: only the student who took the test can view their result.
 */
export const getExamResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const attemptId = Number(req.params.attemptId);

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    if (!attemptId || isNaN(attemptId)) {
      res.status(400).json({ success: false, message: 'Valid numeric attempt ID required.' });
      return;
    }

    const reviewData = await dbService.getAttemptWithReview(attemptId, userId);
    if (!reviewData) {
      res.status(404).json({
        success: false,
        message: 'Examination record not found or you are not authorized to view this result.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      ...reviewData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve examination result.', error: error.message });
  }
};
