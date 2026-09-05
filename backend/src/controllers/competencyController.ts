import { Request, Response, NextFunction } from 'express';
import { UserCompetency } from '../models/UserCompetency';
import { Course } from '../models/Course';
import { CourseModule } from '../models/CourseModule';
import { generateLearningPathway } from '../services/groqService';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

import { Competency } from '../models/Competency';
import { generateCompetencyQuiz } from '../services/groqService';

export const getCompetencyQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { competencyName, category } = req.body;
    const questions = await generateCompetencyQuiz(
      competencyName || 'Operational Meteorology',
      category || 'Meteorology'
    );
    res.json({ success: true, data: { questions } });
  } catch (error) {
    next(error);
  }
};

export const updateMyCompetencyLevel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { competencyId, currentLevel } = req.body;
    const userId = req.user?.userId;

    let compDoc = await Competency.findById(competencyId);
    if (!compDoc) {
      compDoc = await Competency.findOne({ name: competencyId });
    }

    if (!compDoc) {
      return res.status(404).json({ success: false, message: 'Competency not found' });
    }

    // Find course required level for this competency if set by Admin
    const linkedCourse = await Course.findOne({
      status: 'published',
      competenciesCovered: compDoc.name
    });
    const requiredLevel = linkedCourse?.requiredLevel || 4;

    const userComp = await UserCompetency.findOneAndUpdate(
      { userId, competencyId: compDoc._id },
      {
        currentLevel: Number(currentLevel),
        requiredLevel,
        lastAssessedDate: new Date(),
        trend: Number(currentLevel) >= requiredLevel ? 'stable' : 'needs_attention'
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: userComp });
  } catch (error) {
    next(error);
  }
};

export const getMyCompetencies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const allCompetencies = await Competency.find();
    const userCompetencies = await UserCompetency.find({ userId });
    const userCompMap = new Map(userCompetencies.map((uc) => [uc.competencyId.toString(), uc]));

    const publishedCourses = await Course.find({ status: 'published' });

    const formatted = [];
    for (const comp of allCompetencies) {
      const uc = userCompMap.get(comp._id.toString());
      const currentLevel = uc ? uc.currentLevel : 0;
      const requiredLevel = uc?.requiredLevel || comp.globalRequiredLevel || 3;
      const gap = Math.max(0, requiredLevel - currentLevel);

      formatted.push({
        id: comp._id,
        competencyId: comp._id,
        name: comp.name,
        category: comp.category || 'General',
        description: comp.description || '',
        currentLevel,
        requiredLevel,
        gap,
        lastAssessedDate: uc?.lastAssessedDate
          ? new Date(uc.lastAssessedDate).toISOString().split('T')[0]
          : 'Not Assessed Yet',
        trend: uc?.trend || (gap > 0 ? 'needs_attention' : 'stable')
      });
    }

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const getMySkillGaps = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    const allCompetencies = await Competency.find();
    const userCompetencies = await UserCompetency.find({ userId });
    const userCompMap = new Map(userCompetencies.map((uc) => [uc.competencyId.toString(), uc]));
    const publishedCourses = await Course.find({ status: 'published' });

    const gaps = [];

    for (const comp of allCompetencies) {
      const uc = userCompMap.get(comp._id.toString());
      const currentLevel = uc ? uc.currentLevel : 0;
      const requiredLevel = uc?.requiredLevel || comp.globalRequiredLevel || 3;
      const gap = requiredLevel - currentLevel;

      if (gap > 0) {
        // Recommend courses that cover this competency
        const matchingCourses = publishedCourses.filter((c) =>
          c.competenciesCovered.some((cc) => cc.toLowerCase() === comp.name.toLowerCase())
        );

        gaps.push({
          id: comp._id,
          competencyName: comp.name,
          department: user?.department || 'Operational Meteorology',
          currentLevel,
          requiredLevel,
          gapScore: gap,
          priority: gap >= 2 ? 'High' : 'Medium',
          affectedTraineesCount: 12,
          recommendedCourses: matchingCourses.map((c) => c.title),
          recommendedCourseObjects: matchingCourses.map((c) => ({
            id: c._id,
            code: c.code,
            title: c.title,
            subject: c.subject
          }))
        });
      }
    }

    res.json({ success: true, data: gaps });
  } catch (error) {
    next(error);
  }
};

// POST /api/trainees/me/skill-gaps/pathway
export const generatePathwayForSkillGap = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const { competencyName } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Attempt to find the specific competency to know current vs target level
    const compRecord = await Competency.findOne({ name: competencyName });
    let currentLevel = 0;
    let targetLevel = 4; // Default IMD operational requirement

    if (compRecord) {
      const userComp = await UserCompetency.findOne({ userId, competencyId: compRecord._id });
      if (userComp) {
        currentLevel = userComp.currentLevel;
        targetLevel = userComp.requiredLevel || 4;
      }
    }

    // Try fuzzy match by keywords (e.g. match 'Radar' from 'Radar Meteorology')
    const keywords = competencyName.split(/[\s&]+/).filter((w: string) => w.length > 3).map((w: string) => new RegExp(w, 'i'));
    let recommendedCourse = null;
    
    if (keywords.length > 0) {
      recommendedCourse = await Course.findOne({
        $or: keywords.map((kw: RegExp) => ({ competenciesCovered: kw }))
      });
    }

    // Fallback to exactly match
    if (!recommendedCourse) {
      recommendedCourse = await Course.findOne({
        competenciesCovered: { $in: [new RegExp(competencyName, 'i')] }
      });
    }

    // Absolute fallback (pick highest rated course or first seeded course)
    if (!recommendedCourse) {
      recommendedCourse = await Course.findOne({ status: 'published' }).sort({ rating: -1 });
    }

    if (!recommendedCourse) {
      return res.status(404).json({ success: false, message: 'No relevant course found to bridge this gap.' });
    }

    const traineeName = user.name || 'Trainee';

    const courseModules = await CourseModule.find({ courseId: recommendedCourse._id }).sort('orderIndex');
    const modulesText = courseModules.map(m => m.title).join(', ');

    const pathwayMarkdown = await generateLearningPathway(
      traineeName,
      competencyName,
      currentLevel,
      targetLevel,
      recommendedCourse.title,
      recommendedCourse.description,
      modulesText
    );

    res.json({
      success: true,
      data: {
        pathway: pathwayMarkdown,
        recommendedCourse: recommendedCourse
      }
    });
  } catch (error) {
    next(error);
  }
};
