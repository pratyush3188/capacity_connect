import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'test_key_change_me') {
    return null; // Return null if not properly configured
  }
  return new Groq({ apiKey });
};

export const generateTrainerMatchExplanation = async (trainerData: any, criteria: any): Promise<string> => {
  const groq = getGroqClient();
  if (!groq) {
    return `Matched based on internal system score algorithm evaluating expertise in ${criteria.subject}.`;
  }

  try {
    const prompt = `You are an AI matching assistant. Explain why this trainer is a good match for the course.
    Criteria: Subject ${criteria.subject}, Required Competency: ${criteria.requiredCompetency}.
    Trainer: ${trainerData.name}, Skills: ${trainerData.skills.join(', ')}, Experience: ${trainerData.experienceYears} years.
    Keep it very concise, bullet points, max 3 lines.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });

    return chatCompletion.choices[0]?.message?.content || 'Matched successfully.';
  } catch (error) {
    console.error('Groq AI Error:', error);
    return 'Matched successfully (AI unavailable).';
  }
};

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export const generateCompetencyQuiz = async (
  competencyName: string,
  category: string
): Promise<QuizQuestion[]> => {
  const groq = getGroqClient();

  if (groq) {
    try {
      const prompt = `You are a Senior Meteorological Education AI. Generate exactly 6 multiple-choice questions to assess a trainee's technical proficiency level in: "${competencyName}" (${category}).
Return ONLY a valid JSON array of objects with the following keys:
- "id": number (1 to 6)
- "questionText": string (clear, practical operational question)
- "options": array of 4 distinct string choices
- "correctOptionIndex": number (0 to 3)
- "explanation": string (brief explanation of the correct answer)

Do not output any markdown codeblocks or extra conversational text, output valid raw JSON array only.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.3
      });

      const responseText = chatCompletion.choices[0]?.message?.content?.trim() || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const questions = JSON.parse(cleanJson);

      if (Array.isArray(questions) && questions.length > 0) {
        return questions.map((q: any, idx: number) => ({
          id: idx + 1,
          questionText: q.questionText || `Question ${idx + 1} regarding ${competencyName}`,
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 1,
          explanation: q.explanation || 'Correct based on standard meteorological protocols.'
        }));
      }
    } catch (error) {
      console.error('Groq Quiz AI Error:', error);
    }
  }

  // Domain-specific fallback questions if Groq API is unconfigured or rate limited
  return [
    {
      id: 1,
      questionText: `In ${competencyName}, what is the primary parameter used to distinguish precipitation types?`,
      options: ['Differential Reflectivity (ZDR)', 'Cross-correlation (RHOHV)', 'Specific Differential Phase (KDP)', 'Radar Constant'],
      correctOptionIndex: 0,
      explanation: 'ZDR measures the ratio of horizontal to vertical reflectivity factor, helping differentiate rain droplets from hail.'
    },
    {
      id: 2,
      questionText: `When analyzing operational data in ${competencyName}, what does a high negative velocity anomaly indicate?`,
      options: ['Strong Downdraft / Microburst', 'Westerly Jetstream', 'Thermal Inversion', 'Ground Clutter Noise'],
      correctOptionIndex: 0,
      explanation: 'Rapid convergence of negative radial velocity towards the radar indicates strong downdraft/microburst activity.'
    },
    {
      id: 3,
      questionText: `What is the standard sampling interval required for severe storm tracking in ${category}?`,
      options: ['1 - 5 Minutes', '30 Minutes', '3 Hours', '24 Hours'],
      correctOptionIndex: 0,
      explanation: 'Severe convective storms require rapid scan intervals (1-5 mins) to detect microbursts and tornado vortex signatures.'
    },
    {
      id: 4,
      questionText: `Which data quality filter algorithm is applied to eliminate non-meteorological echoes in ${competencyName}?`,
      options: ['Velocity De-aliasing & Clutter Suppression', 'Fourier Transformation', 'Bilinear Interpolation', 'Kriging Smoothing'],
      correctOptionIndex: 0,
      explanation: 'Clutter suppression filters and Doppler velocity de-aliasing remove ground noise and aliased velocity artifacts.'
    },
    {
      id: 5,
      questionText: `What is the primary constraint when assimilating operational observational data into ${category} numerical models?`,
      options: ['Observation Error Covariance & Spatial Resolution', 'Storage Bandwidth', 'Display Monitor Frequency', 'HTTP Timeout'],
      correctOptionIndex: 0,
      explanation: 'Observation error covariance matrix determines how strongly observations correct the model background state.'
    },
    {
      id: 6,
      questionText: `Under WMO Guidelines, what level of operational proficiency is required for independent severe weather forecasting?`,
      options: ['Level 3 - Operational Competent', 'Level 1 - Basic Awareness', 'Level 2 - Working Knowledge', 'Level 0 - Unassessed'],
      correctOptionIndex: 0,
      explanation: 'Level 3 (Operational Competent) indicates full capability for independent real-time forecasting and warning issuance.'
    }
  ];
};

export const generateLearningPathway = async (
  traineeName: string,
  competencyName: string,
  currentLevel: number,
  targetLevel: number,
  courseTitle: string,
  courseDescription?: string,
  courseModules?: string
): Promise<string> => {
  const groq = getGroqClient();
  
  if (!groq) {
    return getRichMockPathway(traineeName, competencyName, currentLevel, targetLevel, courseTitle);
  }

  const prompt = `You are an expert AI Training Coach for the India Meteorological Department (IMD).
A trainee named ${traineeName} has a skill gap in "${competencyName}".
Their current level is ${currentLevel}, but the target level is ${targetLevel}.
We are recommending they take the course titled: "${courseTitle}".

Here is the syllabus/description of the course they will be taking:
${courseDescription || 'N/A'}
Modules included in this course: ${courseModules || 'General concepts of the subject.'}

Generate a very detailed, engaging, and personalized 4-week learning pathway in Markdown format.
Include:
1. A warm, encouraging opening addressing the officer by name.
2. A brief explanation of why this gap matters for IMD operations and public safety.
3. A week-by-week breakdown (Week 1 to Week 4) on how they should approach this specific course. **You MUST weave the actual module names provided above into the weekly plan. Even if there are fewer than 4 modules, you MUST provide exactly 4 weeks (e.g., use Week 4 for Revision, Practical Assessment, or Field Application).**
4. Keep the tone professional, motivating, and specific to meteorology/weather forecasting.
5. End with a motivating concluding sentence.

IMPORTANT: Do NOT use markdown tables (no | or --- borders). Your output will be rendered in a basic markdown parser that does not support tables. Use standard lists, bullet points, and headers instead of tables.
Do not include any placeholders. Act directly as the system. Make it look beautiful in markdown with headers (#, ##, ###), bullet points, and bold text. Ensure the output is complete and not truncated.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b',
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    return chatCompletion.choices[0]?.message?.content || getRichMockPathway(traineeName, competencyName, currentLevel, targetLevel, courseTitle);
  } catch (error) {
    console.error('Groq AI Pathway Error:', error);
    return getRichMockPathway(traineeName, competencyName, currentLevel, targetLevel, courseTitle);
  }
};

const getRichMockPathway = (traineeName: string, competencyName: string, currentLevel: number, targetLevel: number, courseTitle: string) => {
  return `# Personalized AI Learning Pathway: ${competencyName}

Hello **${traineeName}**, 

Based on your recent Skill Gap Analysis, your current proficiency in **${competencyName}** is at **Level ${currentLevel}**, while the IMD operational requirement is **Level ${targetLevel}**. 

Bridging this gap is crucial for ensuring the highest accuracy in real-time weather forecasting and adhering to the Ministry of Earth Sciences' strict operational guidelines. To help you achieve this, I have curated a specialized 4-week learning roadmap utilizing the recommended course: **"${courseTitle}"**.

---

## 📅 Week-by-Week Action Plan

### Week 1: Fundamentals & Theory
* **Video Lectures:** Complete Modules 1 & 2 of the course to grasp the core mathematical and theoretical foundations.
* **Reading Material:** Review the IMD standard operating procedures (SOP) manual for ${competencyName}.
* **Goal:** Achieve a solid understanding of the base principles.

### Week 2: Analytical Techniques & Tools
* **Interactive Labs:** Participate in the virtual lab sessions provided in Module 3.
* **Observation Practice:** Spend 4 hours shadowing a senior meteorologist or using historical dataset simulations.
* **Goal:** Transition from theoretical knowledge to practical tool usage.

### Week 3: Advanced Applications
* **Video Lectures:** Complete Modules 4 & 5 focusing on edge-case scenarios and severe weather events.
* **Hands-on Task:** Complete the mid-course assignment analyzing a recent anomalous weather pattern.
* **Goal:** Develop independent analytical capabilities.

### Week 4: Operational Readiness & Assessment
* **Review:** Go through all case studies presented in the final module.
* **Practice Exam:** Take the internal mock assessment to gauge your readiness.
* **Final Evaluation:** Complete the course's final project to officially upgrade your competency to Level ${targetLevel}.

---
**💡 Pro-Tip:** Consistency is key! Dedicate at least 45 minutes daily to this pathway. You have the full support of the IMD capacity building team. Good luck!`;
};
