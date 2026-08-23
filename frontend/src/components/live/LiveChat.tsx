"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Image, Hash, Users } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface LiveChatProps {
  matchId: string;
}

const DEMO_MESSAGES: ChatMessage[] = [
  { id: "1", user: "Abebe K.", avatar: "A", text: "What a goal! 🔥", timestamp: new Date(), isSystem: false },
  { id: "2", user: "Fatuma A.", avatar: "F", text: "The camera angle is amazing today", timestamp: new Date(), isSystem: false },
  { id: "3", user: "System", avatar: "⚽", text: "GOAL! Addis Stars 1-0 (23')", timestamp: new Date(), isSystem: true },
  { id: "4", user: "Daniel T.", avatar: "D", text: "Great pass from midfield!", timestamp: new Date(), isSystem: false },
  { id: "5", user: "Yonas T.", avatar: "Y", text: "Lion City FC needs to step up", timestamp: new Date(), isSystem: false },
  { id: "6", user: "System", avatar: "⚽", text: "GOAL! Addis Stars 2-0 (34')", timestamp: new Date(), isSystem: true },
  { id: "7", user: "Meron B.", avatar: "M", text: "This team is on fire today!", timestamp: new Date(), isSystem: false },
];

export default function LiveChat({ matchId }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [viewerCount, setViewerCount] = useState(1247);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((c) => c + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      avatar: "Y",
      text: input,
      timestamp: new Date(),
      isSystem: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-green-600" />
          <h3 className="text-sm font-bold text-slate-900">Live Chat</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500">{viewerCount.toLocaleString()} watching</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={msg.isSystem ? "text-center" : "flex gap-2"}
            >
              {msg.isSystem ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                  <span className="text-sm">{msg.avatar}</span>
                  <span className="text-xs font-bold text-green-700">{msg.text}</span>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-slate-900">{msg.user}</span>
                      <span className="text-[10px] text-slate-400">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 break-words">{msg.text}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
