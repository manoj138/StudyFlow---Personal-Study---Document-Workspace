import mongoose from "mongoose";
import dns from "dns";

// Force Node.js to use reliable Google & Cloudflare DNS servers for MongoDB Atlas SRV resolution
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.log("[DNS Config Note]: Custom DNS set skipped.");
}

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studyflow";
    console.log(`[Database] Connecting to MongoDB...`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });

    console.log(`[Database] ✅ MongoDB Successfully Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ❌ Connection failed: ${error.message}`);
    console.log("[Database Hint] If using MongoDB Cloud Atlas:");
    console.log("  1. Ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Add 0.0.0.0/0).");
    console.log("  2. Check database username and password in backend/.env.");
  }
};
