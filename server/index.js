// server.js
import mongoose from "mongoose";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adjust the port if your React app runs on a different port
    methods: ["GET", "POST"],
  },
});

let users = [];

// MongoDB connection
mongoose
  .connect("mongodb+srv://om:pharate11@cluster0.nnceu.mongodb.net/mern-chat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle new user
  socket.on("newUser", ({ username }) => {
    const user = { username, id: socket.id };
    users.push(user);
    io.emit("newUserResponse", users); // Broadcast updated user list to all clients
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    users = users.filter(user => user.id !== socket.id);
    io.emit("newUserResponse", users); // Broadcast updated user list to all clients
  });

  // Handle incoming messages
  socket.on("message", (message) => {
    console.log("Received message:", message);
    const recipientSocketId = message.rid;
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message", message); // Send message to specific user
    }
  });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
