import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Extract raw text from different file types (.pdf, .docx, .txt, .md)
 */
export const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  if (ext === ".txt" || ext === ".md") {
    return fs.readFileSync(filePath, "utf-8");
  }

  throw new Error(`Unsupported file extension: ${ext}`);
};

/**
 * High-fidelity 30-Day Developer Roadmap Template
 * (Exact replica of the user's uploaded image: MERN + DSA + Android + Testing)
 */
export const get30DayDeveloperRoadmapTemplate = (userName = "Manoj") => {
  const cleanName = userName ? userName.split(" ")[0] : "Manoj";

  const tracks = [
    { name: "JavaScript (Advanced)", badge: "JS", icon: "Code", color: "#EAB308" },
    { name: "MERN Stack (End to End)", badge: "⚛️", icon: "Layers", color: "#06B6D4" },
    { name: "DSA (with JS)", badge: "</>", icon: "Terminal", color: "#3B82F6" },
    { name: "Android App Development", badge: "🤖", icon: "Smartphone", color: "#10B981" },
    { name: "Testing (Manual + Basic Automation)", badge: "✅", icon: "CheckCircle", color: "#8B5CF6" }
  ];

  const days = [
    // Phase 1: JavaScript (Days 1 - 5)
    {
      dayNumber: 1,
      title: "JavaScript Basics",
      phase: "JavaScript (Advanced)",
      phaseColor: "#3B82F6",
      subTasks: [
        { id: "d1-t1", text: "JS overview, setup, console.log", completed: false },
        { id: "d1-t2", text: "Variables, data types, operators", completed: false },
        { id: "d1-t3", text: "Practice small programs", completed: false }
      ]
    },
    {
      dayNumber: 2,
      title: "JS Core Concepts",
      phase: "JavaScript (Advanced)",
      phaseColor: "#3B82F6",
      subTasks: [
        { id: "d2-t1", text: "Control flow, loops, functions", completed: false },
        { id: "d2-t2", text: "Arrays & objects", completed: false },
        { id: "d2-t3", text: "Mini projects: Calculator", completed: false }
      ]
    },
    {
      dayNumber: 3,
      title: "Advanced JS",
      phase: "JavaScript (Advanced)",
      phaseColor: "#3B82F6",
      subTasks: [
        { id: "d3-t1", text: "DOM, events, ES6+ features", completed: false },
        { id: "d3-t2", text: "Array methods (map, filter, reduce)", completed: false },
        { id: "d3-t3", text: "Practice: To-Do List", completed: false }
      ]
    },
    {
      dayNumber: 4,
      title: "Modern JS",
      phase: "JavaScript (Advanced)",
      phaseColor: "#3B82F6",
      subTasks: [
        { id: "d4-t1", text: "Async/Await, Promises, Fetch API", completed: false },
        { id: "d4-t2", text: "Error handling & Try/Catch", completed: false },
        { id: "d4-t3", text: "Mini project: API Data Fetch", completed: false }
      ]
    },
    {
      dayNumber: 5,
      title: "JS Revision + Quiz",
      phase: "JavaScript (Advanced)",
      phaseColor: "#3B82F6",
      subTasks: [
        { id: "d5-t1", text: "All JS concepts comprehensive review", completed: false },
        { id: "d5-t2", text: "Solve 50+ interview questions", completed: false },
        { id: "d5-t3", text: "Build a small game (Tic-Tac-Toe)", completed: false }
      ]
    },

    // Phase 2: React & Backend (Days 6 - 15)
    {
      dayNumber: 6,
      title: "React Basics",
      phase: "MERN Stack (End to End)",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d6-t1", text: "Components, JSX, Props", completed: false },
        { id: "d6-t2", text: "State & Event Handling", completed: false },
        { id: "d6-t3", text: "Practice: Counter App", completed: false }
      ]
    },
    {
      dayNumber: 7,
      title: "React Advanced",
      phase: "MERN Stack (End to End)",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d7-t1", text: "Hooks (useState, useEffect, useRef)", completed: false },
        { id: "d7-t2", text: "Conditional Rendering & Lists", completed: false },
        { id: "d7-t3", text: "Practice: Dynamic UI & Filters", completed: false }
      ]
    },
    {
      dayNumber: 8,
      title: "React + Tailwind",
      phase: "MERN Stack (End to End)",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d8-t1", text: "Styling with Tailwind CSS", completed: false },
        { id: "d8-t2", text: "Reusable UI Components library", completed: false },
        { id: "d8-t3", text: "Build: Modern Responsive UI", completed: false }
      ]
    },
    {
      dayNumber: 9,
      title: "Node.js Basics",
      phase: "MERN Stack (End to End)",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d9-t1", text: "Server, Modules, File System (fs)", completed: false },
        { id: "d9-t2", text: "Create simple HTTP API", completed: false },
        { id: "d9-t3", text: "Practice: REST API endpoints", completed: false }
      ]
    },
    {
      dayNumber: 10,
      title: "Express.js",
      phase: "MERN Stack (End to End)",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d10-t1", text: "Routes, Middleware, Controllers", completed: false },
        { id: "d10-t2", text: "Centralized Error Handling", completed: false },
        { id: "d10-t3", text: "Build: User Auth & Profile API", completed: false }
      ]
    },
    {
      dayNumber: 11,
      title: "MongoDB",
      phase: "MERN Stack (End to End)",
      phaseColor: "#8B5CF6",
      subTasks: [
        { id: "d11-t1", text: "CRUD Operations & MongoDB Atlas", completed: false },
        { id: "d11-t2", text: "Queries & Mongoose Schemas", completed: false },
        { id: "d11-t3", text: "Practice: Product DB & Relationships", completed: false }
      ]
    },
    {
      dayNumber: 12,
      title: "MERN Project 1",
      phase: "MERN Stack (End to End)",
      phaseColor: "#8B5CF6",
      subTasks: [
        { id: "d12-t1", text: "Plan: Project Architecture (e.g. Shop)", completed: false },
        { id: "d12-t2", text: "Frontend + Backend connection", completed: false },
        { id: "d12-t3", text: "Connect MongoDB & Seed Data", completed: false }
      ]
    },
    {
      dayNumber: 13,
      title: "MERN Project 2",
      phase: "MERN Stack (End to End)",
      phaseColor: "#8B5CF6",
      subTasks: [
        { id: "d13-t1", text: "Add Features (JWT Auth, Cart, Checkout)", completed: false },
        { id: "d13-t2", text: "Deploy on Vercel / Railway / Render", completed: false },
        { id: "d13-t3", text: "Test full user flow & fix bugs", completed: false }
      ]
    },
    {
      dayNumber: 14,
      title: "MERN Revision",
      phase: "MERN Stack (End to End)",
      phaseColor: "#8B5CF6",
      subTasks: [
        { id: "d14-t1", text: "Review all MERN concepts & lifecycles", completed: false },
        { id: "d14-t2", text: "Solve MCQs + Interview Q&A", completed: false },
        { id: "d14-t3", text: "Optimize Project & code refactoring", completed: false }
      ]
    },
    {
      dayNumber: 15,
      title: "MERN Deploy",
      phase: "MERN Stack (End to End)",
      phaseColor: "#8B5CF6",
      subTasks: [
        { id: "d15-t1", text: "Deploy Full Stack App to production", completed: false },
        { id: "d15-t2", text: "Configure Domain & SSL certificates", completed: false },
        { id: "d15-t3", text: "Share Live Project Link on LinkedIn & GitHub", completed: false }
      ]
    },

    // Phase 3: DSA (Days 16 - 20)
    {
      dayNumber: 16,
      title: "DSA Basics",
      phase: "DSA (with JS)",
      phaseColor: "#F59E0B",
      subTasks: [
        { id: "d16-t1", text: "Arrays, Strings, Hash Maps", completed: false },
        { id: "d16-t2", text: "Two Pointers & Sliding Window", completed: false },
        { id: "d16-t3", text: "Solve 30 Easy Problems", completed: false }
      ]
    },
    {
      dayNumber: 17,
      title: "DSA Intermediate",
      phase: "DSA (with JS)",
      phaseColor: "#F59E0B",
      subTasks: [
        { id: "d17-t1", text: "Linked List, Stack, Queue", completed: false },
        { id: "d17-t2", text: "Recursion & Backtracking basics", completed: false },
        { id: "d17-t3", text: "Solve 30 LeetCode Problems", completed: false }
      ]
    },
    {
      dayNumber: 18,
      title: "DSA Advanced",
      phase: "DSA (with JS)",
      phaseColor: "#F59E0B",
      subTasks: [
        { id: "d18-t1", text: "Trees, Binary Search Trees, Graphs", completed: false },
        { id: "d18-t2", text: "DFS, BFS & Graph traversals", completed: false },
        { id: "d18-t3", text: "Solve 40 Medium Problems", completed: false }
      ]
    },
    {
      dayNumber: 19,
      title: "DSA Practice",
      phase: "DSA (with JS)",
      phaseColor: "#F59E0B",
      subTasks: [
        { id: "d19-t1", text: "Sorting, Binary Search patterns", completed: false },
        { id: "d19-t2", text: "Dynamic Programming (Memoization, Tabulation)", completed: false },
        { id: "d19-t3", text: "Solve 40 Challenging Problems", completed: false }
      ]
    },
    {
      dayNumber: 20,
      title: "DSA Revision",
      phase: "DSA (with JS)",
      phaseColor: "#F59E0B",
      subTasks: [
        { id: "d20-t1", text: "Full DSA Patterns & Cheatsheet Review", completed: false },
        { id: "d20-t2", text: "Timed Mock Test (3 Questions / 60 Mins)", completed: false },
        { id: "d20-t3", text: "Improve Weak Topics & review mistakes", completed: false }
      ]
    },

    // Phase 4: Android App Development (Days 21 - 25)
    {
      dayNumber: 21,
      title: "Android Basics",
      phase: "Android App Development",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d21-t1", text: "Android Studio & SDK Setup", completed: false },
        { id: "d21-t2", text: "Activity Lifecycle & Layouts", completed: false },
        { id: "d21-t3", text: "Build Hello World Android App", completed: false }
      ]
    },
    {
      dayNumber: 22,
      title: "UI & Components",
      phase: "Android App Development",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d22-t1", text: "Buttons, TextFields, Modifiers", completed: false },
        { id: "d22-t2", text: "RecyclerView / LazyColumn", completed: false },
        { id: "d22-t3", text: "Build Notes App with Local Storage", completed: false }
      ]
    },
    {
      dayNumber: 23,
      title: "Core Concepts",
      phase: "Android App Development",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d23-t1", text: "Intents, Navigation & Deep Linking", completed: false },
        { id: "d23-t2", text: "Permissions & REST APIs with Retrofit", completed: false },
        { id: "d23-t3", text: "Build: Flashlight / Utilities App", completed: false }
      ]
    },
    {
      dayNumber: 24,
      title: "Advanced Android",
      phase: "Android App Development",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d24-t1", text: "Firebase Auth, Firestore, Push Notifications", completed: false },
        { id: "d24-t2", text: "Device GPS Location & Camera hardware", completed: false },
        { id: "d24-t3", text: "Build: Weather Forecast App", completed: false }
      ]
    },
    {
      dayNumber: 25,
      title: "Android Testing",
      phase: "Android App Development",
      phaseColor: "#10B981",
      subTasks: [
        { id: "d25-t1", text: "Unit Testing with JUnit & Mockito", completed: false },
        { id: "d25-t2", text: "UI Instrumentation Testing (Espresso)", completed: false },
        { id: "d25-t3", text: "Test and benchmark your App performance", completed: false }
      ]
    },

    // Phase 5: Testing & Deployment (Days 26 - 30)
    {
      dayNumber: 26,
      title: "Testing Basics",
      phase: "Testing (Manual + Basic Automation)",
      phaseColor: "#6366F1",
      subTasks: [
        { id: "d26-t1", text: "Types of Testing (Unit, Integration, E2E)", completed: false },
        { id: "d26-t2", text: "Writing Test Cases & Bug Reports", completed: false },
        { id: "d26-t3", text: "Manual Testing Practice on live site", completed: false }
      ]
    },
    {
      dayNumber: 27,
      title: "Automation (Basic)",
      phase: "Testing (Manual + Basic Automation)",
      phaseColor: "#6366F1",
      subTasks: [
        { id: "d27-t1", text: "Selenium / Playwright Basics", completed: false },
        { id: "d27-t2", text: "WebDriver Setup & Locators", completed: false },
        { id: "d27-t3", text: "Automate End-to-End Login Test", completed: false }
      ]
    },
    {
      dayNumber: 28,
      title: "Final Projects",
      phase: "Testing (Manual + Basic Automation)",
      phaseColor: "#6366F1",
      subTasks: [
        { id: "d28-t1", text: "Complete Bigger Portfolio Project", completed: false },
        { id: "d28-t2", text: "Add All Features & Responsive Polish", completed: false },
        { id: "d28-t3", text: "Test Thoroughly across devices & browsers", completed: false }
      ]
    },
    {
      dayNumber: 29,
      title: "Deployment & Prep",
      phase: "Testing (Manual + Basic Automation)",
      phaseColor: "#6366F1",
      subTasks: [
        { id: "d29-t1", text: "Deploy Android App APK & Web Portfolio", completed: false },
        { id: "d29-t2", text: "Review All Projects & README write-ups", completed: false },
        { id: "d29-t3", text: "Prepare Technical Interview Q&A", completed: false }
      ]
    },
    {
      dayNumber: 30,
      title: "Final Review",
      phase: "Testing (Manual + Basic Automation)",
      phaseColor: "#6366F1",
      subTasks: [
        { id: "d30-t1", text: "Full Revision (JS + MERN + DSA + Android)", completed: false },
        { id: "d30-t2", text: "Showcase Projects & Publish Portfolio", completed: false },
        { id: "d30-t3", text: "Relax & Be Confident 😊", completed: false }
      ]
    }
  ];

  const dailySchedule = [
    { timeSlot: "6:00 - 7:00 AM", activity: "DSA Practice & Problem Solving" },
    { timeSlot: "9:00 - 1:00 PM", activity: "Core Learning + Hands-on Coding" },
    { timeSlot: "2:00 - 3:00 PM", activity: "Project Work & Feature Building" },
    { timeSlot: "7:00 - 8:00 PM", activity: "Revision + Technical MCQs & Q&A" },
    { timeSlot: "8:00 - 9:00 PM", activity: "Android / Testing & Next Day Planning" }
  ];

  const proTips = [
    "Follow the plan strictly for the entire 30 days without skipping.",
    "Build real projects, not just passive tutorial watching.",
    "Solve DSA problems consistently every single day.",
    "Deploy your projects live and put verifiable links on your resume.",
    "Take mock interviews and practice explaining your code out loud."
  ];

  const recommendedTools = [
    { name: "VS Code", description: "Primary Code Editor & Extensions", icon: "Code" },
    { name: "Git & GitHub", description: "Version Control & Portfolio Showcase", icon: "GitBranch" },
    { name: "Vercel / Render", description: "Full Stack Cloud Deployment", icon: "Cloud" },
    { name: "Android Studio", description: "Android App Development & Emulators", icon: "Smartphone" },
    { name: "Postman", description: "REST API Testing & Documentation", icon: "Send" }
  ];

  const goals = [
    "Strong JavaScript & MERN Stack Engineering Skills",
    "DSA Problem Solving Ability & Pattern Recognition",
    "Android App Development Hands-on Proficiency",
    "Industry Testing & Automation Knowledge",
    "Portfolio of Live Production Projects & Confident You!"
  ];

  return {
    title: "One Month Complete Developer Roadmap",
    subtitle: "JavaScript + MERN Stack + DSA + Android + Testing",
    tagline: "Learn • Build • Deploy – Your Dream Career",
    durationDays: 30,
    dailyHours: 4,
    badgeText: "30 Days • Focused Study • Real Projects",
    goalBadge: "Dream Big... and Achieve It!",
    tracks,
    days,
    dailySchedule,
    proTips,
    recommendedTools,
    goals,
    motivationalQuote: `Consistency is the Key – You Can Do It, ${cleanName}! 🚀`
  };
};

/**
 * Intelligent AI Roadmap Generator using Google Gemini
 */
export const generateChallengeWithAI = async ({
  prompt = "",
  fileText = "",
  durationDays = 30,
  dailyHours = 4,
  targetGoal = "",
  userName = "Manoj"
}) => {
  const cleanName = userName ? userName.split(" ")[0] : "Manoj";
  const numDays = Math.max(3, Math.min(100, parseInt(durationDays) || 30));
  const hours = Math.max(1, Math.min(12, parseInt(dailyHours) || 4));

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const modelsToTry = [
      "gemini-flash-latest",
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash"
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    const contextText = (fileText || prompt || "").slice(0, 20000);

    const systemPrompt = `
You are an elite developer mentor, syllabus architect, and learning coach.
Create a high-impact, day-wise Study & Developer Roadmap Challenge for ${cleanName}.
Target Duration: Exactly ${numDays} Days.
Daily Study Commitment: ${hours} Hours per day.
${targetGoal ? `Target Goal / Dream Role: ${targetGoal}` : ""}

Content Context / Syllabus Provided by User:
${contextText || "Full Stack Web Development & DSA Roadmap"}

IMPORTANT REQUIREMENTS:
1. Divide the challenge into 3 to 5 logical TRACKS / PHASES (e.g. Frontend, Backend, Databases, Testing, System Design, or whatever matches the topic).
2. Generate an exact day-by-day plan for Day 1 through Day ${numDays}. NO SKIPPED DAYS.
3. For EACH day:
   - Provide a clear, actionable Day Title (e.g., "Day 1 – JavaScript Basics").
   - Assign it to one of the tracks/phases.
   - Provide a phaseColor (hex code like #3B82F6, #10B981, #8B5CF6, #F59E0B, #EC4899, #06B6D4).
   - Provide 3 to 4 specific, bite-sized sub-tasks for that day (each subtask must have a concise action-oriented text).
4. Provide a realistic Daily Schedule with 4-5 time slots matching the ${hours} hours study time.
5. Provide 5 actionable "Pro Tips".
6. Provide 5 "Recommended Tools" with short descriptions.
7. Provide 4-5 inspiring "Your Goal" bullet points.
8. Set motivationalQuote to: "Consistency is the Key – You Can Do It, ${cleanName}! 🚀"

RETURN ONLY VALID JSON. Do not include markdown \`\`\` blocks, no prose outside JSON.
JSON Structure:
{
  "title": "Roadmap Title",
  "subtitle": "Track1 + Track2 + Track3",
  "tagline": "Learn • Build • Deploy – Your Dream Career",
  "badgeText": "${numDays} Days • Focused Study • Real Projects",
  "goalBadge": "Dream Big... and Achieve It!",
  "tracks": [
    { "name": "Phase Name", "badge": "IconBadge", "icon": "Code", "color": "#3B82F6" }
  ],
  "days": [
    {
      "dayNumber": 1,
      "title": "Topic Title",
      "phase": "Phase Name",
      "phaseColor": "#3B82F6",
      "subTasks": [
        { "id": "d1-t1", "text": "Subtask 1", "completed": false },
        { "id": "d1-t2", "text": "Subtask 2", "completed": false },
        { "id": "d1-t3", "text": "Subtask 3", "completed": false }
      ]
    }
  ],
  "dailySchedule": [
    { "timeSlot": "Morning Slot", "activity": "Activity description" }
  ],
  "proTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "recommendedTools": [
    { "name": "Tool Name", "description": "Short purpose", "icon": "Wrench" }
  ],
  "goals": ["Goal 1", "Goal 2", "Goal 3", "Goal 4"],
  "motivationalQuote": "Consistency is the Key – You Can Do It, ${cleanName}! 🚀"
}
`;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192
          }
        });

        const result = await model.generateContent(systemPrompt);
        const text = result?.response?.text();

        if (text) {
          const cleanJson = text
            .replace(/```(?:json)?/gi, "")
            .replace(/```/g, "")
            .trim();

          const parsed = JSON.parse(cleanJson);
          if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
            // Guarantee subtask IDs and completion states
            parsed.days = parsed.days.map((day, dIdx) => ({
              ...day,
              dayNumber: day.dayNumber || dIdx + 1,
              phaseColor: day.phaseColor || "#3B82F6",
              subTasks: (day.subTasks || []).map((t, tIdx) => ({
                id: t.id || `d${dIdx + 1}-t${tIdx + 1}`,
                text: typeof t === "string" ? t : (t.text || "Study & practice topic"),
                completed: false
              }))
            }));

            parsed.durationDays = parsed.days.length;
            parsed.dailyHours = hours;
            parsed.motivationalQuote = parsed.motivationalQuote || `Consistency is the Key – You Can Do It, ${cleanName}! 🚀`;

            return parsed;
          }
        }
      } catch (err) {
        console.warn(`[Challenge AI] Model ${modelName} attempt error:`, err.message);
      }
    }
  }

  // Fallback: If AI is unavailable or prompt is empty, generate dynamic heuristic challenge
  return generateHeuristicChallenge({ prompt, fileText, durationDays: numDays, dailyHours: hours, userName: cleanName });
};

/**
 * Deterministic Heuristic Generator if AI is unreachable or offline
 */
export const generateHeuristicChallenge = ({
  prompt = "",
  fileText = "",
  durationDays = 30,
  dailyHours = 4,
  userName = "Manoj"
}) => {
  const cleanName = userName ? userName.split(" ")[0] : "Manoj";
  const numDays = Math.max(3, parseInt(durationDays) || 30);
  const hours = parseInt(dailyHours) || 4;

  // If 30 days and matches general web/dev, return full image template
  if (numDays === 30 && (!prompt || /mern|developer|full\s*stack|web|javascript/i.test(prompt))) {
    return get30DayDeveloperRoadmapTemplate(cleanName);
  }

  // Extract keywords or lines from input text
  const rawLines = (fileText || prompt)
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*#\d.)\s]+/, "").trim())
    .filter((l) => l.length > 3 && l.length < 120);

  const tracks = [
    { name: "Phase 1: Fundamentals", badge: "01", icon: "BookOpen", color: "#3B82F6" },
    { name: "Phase 2: Core Implementation", badge: "02", icon: "Code", color: "#10B981" },
    { name: "Phase 3: Advanced & Integration", badge: "03", icon: "Layers", color: "#8B5CF6" },
    { name: "Phase 4: Real Projects & Testing", badge: "04", icon: "CheckCircle", color: "#F59E0B" }
  ];

  const days = [];
  const phaseChunk = Math.ceil(numDays / tracks.length);

  for (let i = 1; i <= numDays; i++) {
    const trackIndex = Math.min(tracks.length - 1, Math.floor((i - 1) / phaseChunk));
    const track = tracks[trackIndex];
    const lineItem = rawLines[(i - 1) % (rawLines.length || 1)] || `Topic ${i} Deep Dive`;

    days.push({
      dayNumber: i,
      title: `Day ${i} – ${lineItem.length > 25 ? lineItem.slice(0, 25) + "..." : lineItem}`,
      phase: track.name,
      phaseColor: track.color,
      subTasks: [
        { id: `d${i}-t1`, text: `Concept exploration & theory: ${lineItem}`, completed: false },
        { id: `d${i}-t2`, text: `Hands-on practice & sample exercises`, completed: false },
        { id: `d${i}-t3`, text: `Quick review & revision notes`, completed: false }
      ]
    });
  }

  return {
    title: prompt ? `${prompt} Challenge` : `${numDays} Days Study Roadmap`,
    subtitle: tracks.map((t) => t.name.split(": ")[1] || t.name).join(" • "),
    tagline: "Learn • Build • Deploy – Your Dream Career",
    durationDays: numDays,
    dailyHours: hours,
    badgeText: `${numDays} Days • Focused Study • Real Projects`,
    goalBadge: "Dream Big... and Achieve It!",
    tracks,
    days,
    dailySchedule: [
      { timeSlot: "Early Morning (1 hr)", activity: "Problem Solving & Core Revision" },
      { timeSlot: "Main Block (2-3 hrs)", activity: "Theory & Code Implementation" },
      { timeSlot: "Evening (1 hr)", activity: "Project Integration & Practice" }
    ],
    proTips: [
      `Stay disciplined for all ${numDays} days without breaking the streak.`,
      "Write actual code; avoid passive video watching.",
      "Summarize daily takeaways in your own words.",
      "Test and verify every mini exercise before moving on.",
      "Share your daily progress to stay accountable."
    ],
    recommendedTools: [
      { name: "VS Code", description: "Modern Code Editor", icon: "Code" },
      { name: "Git & GitHub", description: "Track your daily commits", icon: "GitBranch" },
      { name: "StudyFlow Notes", description: "Consolidated study library", icon: "BookOpen" }
    ],
    goals: [
      `Master comprehensive topics across ${numDays} focused days`,
      "Build a robust streak and consistent study discipline",
      "Create demonstrable projects for your portfolio"
    ],
    motivationalQuote: `Consistency is the Key – You Can Do It, ${cleanName}! 🚀`
  };
};
