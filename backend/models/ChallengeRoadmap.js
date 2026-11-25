import mongoose from "mongoose";

const SubTaskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
});

const DayPlanSchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  phase: {
    type: String,
    default: "General"
  },
  phaseColor: {
    type: String,
    default: "#3B82F6"
  },
  subTasks: [SubTaskSchema],
  isDayCompleted: {
    type: Boolean,
    default: false
  }
});

const TrackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  badge: { type: String, default: "" },
  icon: { type: String, default: "Code" },
  color: { type: String, default: "#3B82F6" }
});

const DailyScheduleSchema = new mongoose.Schema({
  timeSlot: { type: String, required: true },
  activity: { type: String, required: true }
});

const RecommendedToolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: "Wrench" }
});

const ChallengeRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Challenge title is required"],
      trim: true
    },
    subtitle: {
      type: String,
      default: "",
      trim: true
    },
    tagline: {
      type: String,
      default: "Learn • Build • Deploy – Your Dream Career"
    },
    durationDays: {
      type: Number,
      required: true,
      default: 30
    },
    dailyHours: {
      type: Number,
      default: 4
    },
    sourceType: {
      type: String,
      enum: ["prompt", "file", "document", "template"],
      default: "prompt"
    },
    sourceFileName: {
      type: String,
      default: ""
    },
    badgeText: {
      type: String,
      default: "30 Days • Focused Study • Real Projects"
    },
    goalBadge: {
      type: String,
      default: "Dream Big... and Achieve It!"
    },
    tracks: [TrackSchema],
    days: [DayPlanSchema],
    dailySchedule: [DailyScheduleSchema],
    proTips: [{ type: String }],
    recommendedTools: [RecommendedToolSchema],
    goals: [{ type: String }],
    motivationalQuote: {
      type: String,
      default: "Consistency is the Key – You Can Do It! 🚀"
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    progressPercent: {
      type: Number,
      default: 0
    },
    currentStreakDays: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

ChallengeRoadmapSchema.methods.recalculateProgress = function () {
  let total = 0;
  let done = 0;

  for (const day of this.days) {
    let dayAllDone = day.subTasks.length > 0;
    for (const task of day.subTasks) {
      total += 1;
      if (task.completed) {
        done += 1;
      } else {
        dayAllDone = false;
      }
    }
    day.isDayCompleted = dayAllDone;
  }

  this.totalTasks = total;
  this.completedTasks = done;
  this.progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;
  if (this.progressPercent === 100) {
    this.status = "completed";
  } else if (this.status === "completed") {
    this.status = "active";
  }
};

export const ChallengeRoadmap = mongoose.model("ChallengeRoadmap", ChallengeRoadmapSchema);
