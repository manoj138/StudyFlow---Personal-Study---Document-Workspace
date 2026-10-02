import http from "http";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

// Connect MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO Gateway
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on("join_document", (documentId) => {
    socket.join(`doc_${documentId}`);
    console.log(`[Socket.IO] Client ${socket.id} joined document room: doc_${documentId}`);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Attach Socket instance to app context if needed
app.set("io", io);

server.listen(PORT, () => {
  console.log(
    `[Server] StudyFlow API & Socket Server running at http://localhost:${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});