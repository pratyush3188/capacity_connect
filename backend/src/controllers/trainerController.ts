import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getTrainers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trainers = await User.find({ role: 'trainer' }).select('-passwordHash');
    res.json({ success: true, data: trainers });
  } catch (error) {
    next(error);
  }
};

import { Assessment } from '../models/Assessment';
import { AssessmentResult } from '../models/AssessmentResult';
import { Feedback } from '../models/Feedback';
import { ResourceItem } from '../models/ResourceItem';

export const getTrainerDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user?.userId;
    const courses = await Course.find({ trainerId });
    const courseIds = courses.map(c => c._id);
    
    // Get total learners & completed learners
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
    const totalLearners = enrollments.length;
    const completedLearners = enrollments.filter(e => e.progressPercentage === 100 || e.completedAt).length;
    
    // Get avg exam score
    const assessments = await Assessment.find({ courseId: { $in: courseIds } });
    const assessmentIds = assessments.map(a => a._id);
    const results = await AssessmentResult.find({ assessmentId: { $in: assessmentIds } });
    let avgExamScore = 0;
    if (results.length > 0) {
      const sum = results.reduce((acc, curr) => acc + curr.score, 0);
      avgExamScore = sum / results.length;
    }

    // Get rating score
    const feedbacks = await Feedback.find({ courseId: { $in: courseIds } });
    let ratingScore = 0;
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
      ratingScore = sum / feedbacks.length;
    }

    // Get uploaded assets
    const uploadedAssets = await ResourceItem.countDocuments({ uploaderId: trainerId });

    res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalLearners,
        completedLearners,
        avgExamScore: avgExamScore.toFixed(1),
        ratingScore: ratingScore.toFixed(1),
        uploadedAssets,
        courses
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainerTrainees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user?.userId;
    // 1. Get all courses by this trainer
    const courses = await Course.find({ trainerId });
    const courseIds = courses.map(c => c._id);
    
    // 2. Find all enrollments in these courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('traineeId', 'name email')
      .populate('courseId', 'title');

    // 3. Find assessments for these courses
    const assessments = await Assessment.find({ courseId: { $in: courseIds } });
    const assessmentIds = assessments.map(a => a._id);

    // 4. Find all results for these assessments
    const results = await AssessmentResult.find({ assessmentId: { $in: assessmentIds } });

    // Format data
    const traineesList = enrollments.map(e => {
      const trainee = e.traineeId as any;
      const course = e.courseId as any;
      
      // Find results for this specific trainee in this specific course
      const courseAssessmentIds = assessments.filter(a => a.courseId.toString() === course._id.toString()).map(a => a._id.toString());
      const traineeResults = results.filter(r => 
        r.traineeId.toString() === trainee._id.toString() && 
        courseAssessmentIds.includes(r.assessmentId.toString())
      );

      let examScore = 'N/A';
      if (traineeResults.length > 0) {
        const sum = traineeResults.reduce((acc, curr) => acc + curr.score, 0);
        examScore = (sum / traineeResults.length).toFixed(0) + '%';
      }

      let status = 'Active';
      if (e.progressPercentage === 100 || e.completedAt) {
        status = 'Completed';
      }

      return {
        id: e._id, // unique per enrollment
        traineeId: trainee._id,
        name: trainee.name || trainee.email,
        course: course.title,
        progress: e.progressPercentage || 0,
        examScore,
        improvement: `+${Math.floor((e.progressPercentage || 0) / 33)} Competency Levels`, // rough estimation for dummy improvement
        status
      };
    });

    res.json({ success: true, data: traineesList });
  } catch (error) {
    next(error);
  }
};

export const updateTrainerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { qualification, experienceYears, skills, certifications, department, designation } = req.body;
    const userId = req.user?.userId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          qualification,
          experienceYears,
          skills,
          certifications,
          department,
          designation
        }
      },
      { new: true }
    ).select('-passwordHash');

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};
