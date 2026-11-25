import fs from "fs";
import { ChallengeRoadmap } from "../models/ChallengeRoadmap.js";
import {
  extractTextFromFile,
  generateChallengeWithAI,
  get30DayDeveloperRoadmapTemplate
} from "../services/challengeService.js";

/**
 * Create a new Roadmap Challenge from prompt / text
 */
export const createFromPrompt = async (req, res, next) => {
  try {
    const { prompt, durationDays = 30, dailyHours = 4, targetGoal = "" } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please enter a topic or prompt for your study roadmap challenge."
      });
    }

    const userName = req.user?.name || "Manoj";

    const generated = await generateChallengeWithAI({
      prompt: prompt.trim(),
      durationDays: parseInt(durationDays) || 30,
      dailyHours: parseInt(dailyHours) || 4,
      targetGoal: targetGoal ? targetGoal.trim() : "",
      userName
    });

    const roadmap = new ChallengeRoadmap({
      userId: req.user._id,
      title: generated.title || prompt.trim(),
      subtitle: generated.subtitle || "",
      tagline: generated.tagline || "Learn • Build • Deploy – Your Dream Career",
      durationDays: generated.durationDays || parseInt(durationDays) || 30,
      dailyHours: generated.dailyHours || parseInt(dailyHours) || 4,
      sourceType: "prompt",
      badgeText: generated.badgeText || `${durationDays} Days • Focused Study • Real Projects`,
      goalBadge: generated.goalBadge || "Dream Big... and Achieve It!",
      tracks: generated.tracks || [],
      days: generated.days || [],
      dailySchedule: generated.dailySchedule || [],
      proTips: generated.proTips || [],
      recommendedTools: generated.recommendedTools || [],
      goals: generated.goals || [],
      motivationalQuote: generated.motivationalQuote || `Consistency is the Key – You Can Do It, ${userName}! 🚀`
    });

    roadmap.recalculateProgress();
    await roadmap.save();

    res.status(201).json({
      success: true,
      message: `Created ${roadmap.durationDays}-Day Challenge successfully!`,
      roadmap
    });
  } catch (error) {
    console.error("[Challenge Controller - createFromPrompt]:", error);
    next(error);
  }
};

/**
 * Create Roadmap Challenge from uploaded file (.pdf, .md, .txt, .docx)
 */
export const createFromFile = async (req, res, next) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please select a file to upload (.pdf, .md, .txt, or .docx)."
      });
    }

    tempFilePath = req.file.path;
    const { durationDays = 30, dailyHours = 4, targetGoal = "", title = "" } = req.body;

    const fileText = await extractTextFromFile(tempFilePath);

    if (!fileText || fileText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Could not read text content from the uploaded file."
      });
    }

    const userName = req.user?.name || "Manoj";

    const generated = await generateChallengeWithAI({
      prompt: title || req.file.originalname,
      fileText,
      durationDays: parseInt(durationDays) || 30,
      dailyHours: parseInt(dailyHours) || 4,
      targetGoal: targetGoal ? targetGoal.trim() : "",
      userName
    });

    const roadmap = new ChallengeRoadmap({
      userId: req.user._id,
      title: title.trim() || generated.title || req.file.originalname.replace(/\.[^/.]+$/, ""),
      subtitle: generated.subtitle || "",
      tagline: generated.tagline || "Learn • Build • Deploy – Your Dream Career",
      durationDays: generated.durationDays || parseInt(durationDays) || 30,
      dailyHours: generated.dailyHours || parseInt(dailyHours) || 4,
      sourceType: "file",
      sourceFileName: req.file.originalname,
      badgeText: generated.badgeText || `${durationDays} Days • Focused Study • Real Projects`,
      goalBadge: generated.goalBadge || "Dream Big... and Achieve It!",
      tracks: generated.tracks || [],
      days: generated.days || [],
      dailySchedule: generated.dailySchedule || [],
      proTips: generated.proTips || [],
      recommendedTools: generated.recommendedTools || [],
      goals: generated.goals || [],
      motivationalQuote: generated.motivationalQuote || `Consistency is the Key – You Can Do It, ${userName}! 🚀`
    });

    roadmap.recalculateProgress();
    await roadmap.save();

    // Clean up temporary uploaded file
    try {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupErr) {
      console.warn("File cleanup non-fatal warning:", cleanupErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Created ${roadmap.durationDays}-Day Challenge from file successfully!`,
      roadmap
    });
  } catch (error) {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {}
    }
    console.error("[Challenge Controller - createFromFile]:", error);
    next(error);
  }
};

/**
 * Seed the exact 30-Day Developer Roadmap from the user's uploaded image!
 */
export const seedDemoRoadmap = async (req, res, next) => {
  try {
    const userName = req.user?.name || "Manoj";
    const template = get30DayDeveloperRoadmapTemplate(userName);

    const roadmap = new ChallengeRoadmap({
      userId: req.user._id,
      ...template,
      sourceType: "template"
    });

    roadmap.recalculateProgress();
    await roadmap.save();

    res.status(201).json({
      success: true,
      message: "Loaded the complete 30-Day Developer Roadmap!",
      roadmap
    });
  } catch (error) {
    console.error("[Challenge Controller - seedDemoRoadmap]:", error);
    next(error);
  }
};

/**
 * Get all challenges for current user
 */
export const getChallenges = async (req, res, next) => {
  try {
    const challenges = await ChallengeRoadmap.find({ userId: req.user._id })
      .select("-days.subTasks") // omit large subtask arrays in listing for faster load
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      challenges
    });
  } catch (error) {
    console.error("[Challenge Controller - getChallenges]:", error);
    next(error);
  }
};

/**
 * Get single challenge by ID with all day cards and checklists
 */
export const getChallengeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const challenge = await ChallengeRoadmap.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: "Roadmap challenge not found."
      });
    }

    res.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error("[Challenge Controller - getChallengeById]:", error);
    next(error);
  }
};

/**
 * Toggle individual subtask completed status
 */
export const toggleSubTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dayNumber, taskId, completed } = req.body;

    const challenge = await ChallengeRoadmap.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: "Roadmap challenge not found."
      });
    }

    const day = challenge.days.find((d) => d.dayNumber === parseInt(dayNumber));
    if (!day) {
      return res.status(404).json({
        success: false,
        error: `Day ${dayNumber} not found in this roadmap.`
      });
    }

    const task = day.subTasks.find((t) => t.id === taskId || t._id?.toString() === taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task ${taskId} not found in Day ${dayNumber}.`
      });
    }

    // Toggle status
    task.completed = typeof completed === "boolean" ? completed : !task.completed;
    task.completedAt = task.completed ? new Date() : null;

    // Recalculate progress metrics
    challenge.recalculateProgress();
    await challenge.save();

    res.json({
      success: true,
      message: `Task updated: ${task.completed ? "Done" : "Pending"}`,
      task,
      isDayCompleted: day.isDayCompleted,
      progressPercent: challenge.progressPercent,
      completedTasks: challenge.completedTasks,
      totalTasks: challenge.totalTasks,
      status: challenge.status
    });
  } catch (error) {
    console.error("[Challenge Controller - toggleSubTask]:", error);
    next(error);
  }
};

/**
 * Delete challenge
 */
export const deleteChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ChallengeRoadmap.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Roadmap challenge not found."
      });
    }

    res.json({
      success: true,
      message: "Challenge deleted successfully."
    });
  } catch (error) {
    console.error("[Challenge Controller - deleteChallenge]:", error);
    next(error);
  }
};
