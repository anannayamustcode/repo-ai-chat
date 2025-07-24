import { useState, useEffect, useRef } from "react";

const Chatbot = ({ setChatOpen, isChatOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
  
    try {
      const response = await fetch("https://fel-backend.vercel.app/api/chat", { // ✅ Add `await`
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
  
      const data = await response.json(); // ✅ Now response is defined
      if (data.reply) {
        setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };
  
  return (
    <div
    className={`fixed transition-all duration-300 flex flex-col bg-[var(--sidebar)] border border-[var(--highlight-color)] rounded-3xl
    ${isChatOpen ? "top-0 right-0 h-full w-full md:w-[30%] z-50" : "bottom-5 right-5 w-13 h-13 overflow-hidden shadow-lg "}`}
  >
  

      {/* Chatbot Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="w-13 h-13 flex items-center rounded-3xl justify-center cursor-pointer bg-[var(--button-bg-hover)] text-[var(--text-color-button)] shadow-lg hover:bg-[var(--button-bg-hover)] fixed bottom-5 right-5"
        >
          💬
        </button>
      )}

      {isChatOpen && (
        <>
          {/* Header */}
          <div className="bg-[var(--sidebar)] p-4 flex justify-between items-center text-white ">
            <span className="text-lg font-semibold">DoubtsBot</span>
            <button onClick={() => setChatOpen(false)} className="text-2xl cursor-pointer text-bold text-white ">✖</button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[75%] text-black
                  ${msg.sender === "user" ? "bg-[var(--sidebar-light)] self-end ml-auto" : "bg-[var(--chatbot-bg)] text-white self-start"}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-[var(--sidebar)] flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 p-2 bg-[var(--highlight-color)] text-[var(--text-color)] rounded-lg focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-2 bg-[var(--button-bg-hover)] cursor-pointer text-[var(--text-color-button)] rounded-lg hover:bg-[var(--button-bg-hover)]"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
