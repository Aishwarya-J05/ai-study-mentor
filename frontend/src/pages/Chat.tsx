// src/pages/Chat.tsx
import { useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiMic, FiVolume2, FiMenu, FiX } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";
import { AuthContext } from "../context/AuthContext";

const MarkdownResponse = ({ text }: { text: string }) => {
  const formatted = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br/>');

  return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
};

// SpeechRecognition types...
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

type Message = {
  id?: string;
  role: "user" | "ai";
  text: string;
  timestamp?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export default function ChatPage() {
  const { user } = useContext(AuthContext);
  const userId = user?.uid ?? "anonymous";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Close with Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`${API_BASE}/chats/${userId}`);
        if (!res.ok) return;
        const data = (await res.json()) as Message[];
        setMessages(data);
      } catch (err) {
        console.error("loadHistory error", err);
      }
    }
    loadHistory();
    if ("speechSynthesis" in window) speechSynthesis.getVoices();
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;

    setInput("");
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: trimmed }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { reply } = await res.json() as { reply: string };

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "ai",
        text: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: "ai",
        text: "Connection failed. Please try again.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const initRecognition = (): SpeechRecognition | null => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const r = new SR();
    r.lang = "en-US";
    r.interimResults = true;

    let final = "";

    r.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += transcript;
        else interim += transcript;
      }

      setInput(prev => {
        if (final) {
          const updated = (prev + " " + final).trim();
          final = "";
          return updated;
        }
        const parts = prev.split(" ");
        parts.pop();
        return [...parts, interim].join(" ").trim();
      });
    };

    r.onerror = () => setIsRecording(false);
    r.onend = () => setIsRecording(false);
    return r;
  };

  const startRecording = () => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      alert("Voice not supported. Use Chrome or Edge.");
      return;
    }
    if (!recognitionRef.current) recognitionRef.current = initRecognition();
    recognitionRef.current?.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.95;
    const voices = speechSynthesis.getVoices();
    const good = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices[0];
    if (good) utter.voice = good;
    speechSynthesis.speak(utter);
  };

  const playLastAi = () => {
    const last = [...messages].reverse().find(m => m.role === "ai");
    if (last) speak(last.text);
  };

  return (
    <>
      <div className="chat-app dark">
        <div className="background-gradient" />

        {/* Toggle Button */}
        {/* Menu button — hides when sidebar is open */}
<motion.button
  whileHover={{ scale: isSidebarOpen ? 1 : 1.08 }}
  whileTap={{ scale: isSidebarOpen ? 1 : 0.95 }}
  onClick={() => setIsSidebarOpen(true)}
  className="sidebar-toggle"
  style={{ opacity: isSidebarOpen ? 0 : 1, pointerEvents: isSidebarOpen ? "none" : "auto" }}
  animate={{ opacity: isSidebarOpen ? 0 : 1 }}
  transition={{ duration: 0.25 }}
>
  <FiMenu size={20} />
</motion.button>

        {/* Sidebar + Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Overlay - click to close */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="sidebar-overlay"
              />

              {/* Sidebar */}
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="sidebar"
              >
                <div className="sidebar-content">
                  {/* THIS WAS THE BUG → fixed now */}
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="close-btn"
                    aria-label="Close sidebar"
                  >
                    <FiX size={24} />
                  </button>

                  <div className="sidebar-header">
                    <div className="brain-icon">
                      <GiBrain size={32} />
                    </div>
                    <h2>Quick Prompts</h2>
                  </div>

                  <div className="prompt-list">
                    {[
                      "Explain like I'm 10:",
                      "Create a study plan for:",
                      "Give me 5 quiz questions about:",
                      "Summarize this simply:",
                      "Compare and contrast:",
                      "Key concepts of:",
                    ].map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          setInput(p);
                          setIsSidebarOpen(false);
                        }}
                        className="prompt-btn"
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <p className="sidebar-tip">
                    Tip: Paste any text and ask me to explain it!
                  </p>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Rest of your UI (unchanged) */}
        <main className="main-content">
          <header className="chat-header">
            <div>
              <h1>AI Study Mentor</h1>
              <p>Your personal academic assistant</p>
            </div>
          </header>

          <section className="messages">
            {messages.map(m => (
              <motion.article
                key={m.id ?? m.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message ${m.role}`}
              >
                <div className="bubble">
                  <div className="message-text">
  <MarkdownResponse text={m.text} />
</div>
                  {m.role === "ai" && (
                    <button onClick={() => speak(m.text)} className="speak-btn">
                      <FiVolume2 size={16} /> Read aloud
                    </button>
                  )}
                </div>
                {m.timestamp && (
                  <time>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                )}
              </motion.article>
            ))}

            {loading && (
              <div className="message ai">
                <div className="bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </section>

          <footer className="input-bar">
            <div className="input-wrapper">
              <button
                onClick={() => (isRecording ? stopRecording() : startRecording())}
                className={`mic-btn ${isRecording ? "recording" : ""}`}
              >
                <FiMic size={20} />
              </button>

              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask me anything..."
                rows={1}
              />

              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="send-btn"
              >
                <FiSend size={20} />
              </button>

              <button onClick={playLastAi} className="play-btn">
                <FiVolume2 size={20} />
              </button>
            </div>
            
            <p className="footer-note">
              Powered by Gemini • Voice input • Shift+Enter for new line
            </p>
          </footer>
        </main>
      </div>
      <style>{`
        .chat-app {
    min-height: 100vh;
    min-height: 100dvh; /* fixes mobile Safari */
    background: #0f172a;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
    overflow: hidden;
    margin: 0;            /* removes any default margin */
    padding: 0;           /* removes any default padding */
  }

  /* Kill any possible white border on mobile/desktop */
  html, body, #__next, .chat-app {
    margin: 0 !important;
    padding: 0 !important;
    height: 100%;
    background: #0f172a !important;
  }

  .background-gradient {
    position: fixed;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.15), transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15), transparent 50%);
    pointer-events: none;
  }

  .sidebar-toggle {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 100;
    width: 52px;
    height: 52px;
    background: rgba(30, 41, 59, 0.9);
    backdrop-filter: blur(12px);
    border: 1px solid #475569;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    color: #cbd5e1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 89;
    cursor: pointer;
  }

  .sidebar {
    position: fixed;
    inset: 0 0 0 auto;
    width: 380px;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: -10px 0 40px rgba(0,0,0,0.4);
    z-index: 90;
    border-left: 1px solid #334155;
  }
        .sidebar-content {
          padding: 32px;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: #e2e8f0;
        }

        .close-btn {
          align-self: flex-end;
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 8px;
          border-radius: 8px;
        }

        .close-btn:hover { background: #334155; }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .brain-icon {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prompt-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .prompt-btn {
          text-align: left;
          padding: 16px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid #475569;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.2s;
          color: #e2e8f0;
        }

        .prompt-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: #6366f1;
          transform: translateX(6px);
        }

        .sidebar-tip {
          font-size: 13px;
          color: #64748b;
          text-align: center;
          margin-top: 24px;
        }

        .main-content {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 24px 160px;
        }

        .chat-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .chat-header h1 {
          font-size: 48px;
          font-weight: 800;
          background: linear-gradient(90deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 12px 0;
        }

        .chat-header p {
          color: #94a3b8;
          font-size: 18px;
        }

        .messages {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .message.user { align-self: flex-end; }
        .message.ai   { align-self: flex-start; }

        .bubble {
          padding: 18px 24px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          position: relative;
          font-size: 16px;
          line-height: 1.6;
        }

        .message.user .bubble {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .message.ai .bubble {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid #475569;
          color: #e2e8f0;
        }

        .speak-btn {
          margin-top: 12px;
          background: none;
          border: none;
          color: #a78bfa;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .typing span {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #60a5fa;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing span:nth-child(2) { animation-delay: 0.15s; }
        .typing span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-12px); }
        }

        time {
          font-size: 12px;
          color: #64748b;
          margin-top: 6px;
          align-self: flex-start;
        }

        .message.user time { align-self: flex-end; }

        .input-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          border-top: 1px solid #334155;
          padding: 24px 0;
        }

        .input-wrapper {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: flex-end;
          gap: 16px;
        }

        .mic-btn, .send-btn, .play-btn {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .mic-btn {
          background: #334155;
          color: #94a3b8;
        }

        .mic-btn.recording {
          background: #ef4444;
          color: white;
          animation: pulse 1.5s infinite;
        }

        .send-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .play-btn {
          background: #334155;
          color: #94a3b8;
        }

        textarea {
          flex: 1;
          min-height: 56px;
          max-height: 180px;
          padding: 16px 20px;
          border: 1px solid #475569;
          border-radius: 16px;
          resize: none;
          font-size: 16px;
          outline: none;
          background: rgba(30, 41, 59, 0.7);
          color: #e2e8f0;
        }

        textarea::placeholder {
          color: #64748b;
        }

        textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .footer-note {
          text-align: center;
          margin-top: 16px;
          font-size: 13px;
          color: #64748b;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        @media (max-width: 768px) {
          .main-content { padding: 24px 16px 140px; }
          .chat-header h1 { font-size: 36px; }
          .sidebar { width: 100%; }
          .input-wrapper { padding: 0 16px; }
        }

        .sidebar-toggle {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 100;
  width: 52px;
  height: 52px;
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid #475569;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.message-text strong {
  font-weight: 700;
  color: #c4b5fd;
}

.message-text em {
  font-style: italic;
  color: #e0c3fc;
}

.message-text code.inline-code {
  background: rgba(99, 102, 241, 0.25);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.9em;
  font-family: 'JetBrains Mono', Consolas, monospace;
  color: #a5b4fc;
}

.message-text pre.code-block {
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid #475569;
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 12px 0;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #e2e8f0;
}

.message-text br {
  margin-bottom: 8px;
  display: block;
  content: "";
}

      `}</style>
    </>
  );
}