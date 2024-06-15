import { useEffect, useState } from "react";
import socketIO from "socket.io-client";
import axios from "axios";

const socket = socketIO.connect("http://localhost:3000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`⚡: ${socket.id} user just connected!`);
    });

    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
    });

    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("newUserResponse", (data) => {
      console.log("users", data);
      setUsers(data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("newUserResponse");
    };
  }, []);

  const handleSend = () => {
    if (message) {
      socket.emit("message", { username, text: message ,rid:selectedUserId});
      setMessage("");
    }
  };

  const handleSetUsername = () => {
    socket.emit("newUser", { username, id: socket.id });
  };

  console.log(selectedUserId)

  return (
    <div className="w-full bg-slate-300 flex">
      <div className="bg-slate-500 w-[20%] list-none h-[100vh] p-4">
        <h2>Users</h2>
        <ul>
          {users.map((user, index) => (
            <li onClick={()=>setSelectedUserId(user.id)} key={index}>{user.username} - {user.id}</li>
          ))}
        </ul>
      </div>
      <div className="bg-slate-200 w-full p-4">
        <div className="chat-messages h-[80vh] overflow-y-scroll p-4 bg-white mb-4">
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>
                <strong>{msg.username}:</strong> {msg.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="input-container">
         
            <div>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-[80%] p-2 mb-4"
              />
              <button
                onClick={handleSetUsername}
                className="bg-blue-300 rounded-md p-2"
              >
                Set Username
              </button>
            </div>
         
            <div className="flex">
              <input
                type="text"
                placeholder="Type your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-[80%] p-2"
              />
              <button
                onClick={handleSend}
                className="bg-blue-300 rounded-md p-2"
              >
                Send
              </button>
            </div>
         
        </div>
      </div>
    </div>
  );
}

export default App;
