"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Sparkles, X, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function Copilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'ShadowLedger Copilot initialized. How can I assist with your invisible operations today?' }
  ]);

  const executeMutation = trpc.executeAiInstruction.useMutation();

  const handleSend = async () => {
    if (!input.trim() || executeMutation.isLoading) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    try {
      const response = await executeMutation.mutateAsync({ 
        orgId: 'default-org', 
        instruction: input 
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.orchestrationPlan 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error communicating with AI orchestrator. Please verify API configuration.' 
      }]);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-96 glass-dark rounded-3xl border-white/10 overflow-hidden shadow-2xl flex flex-col h-[500px]"
          >
            <div className="p-4 bg-cyan-glow/10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-glow" />
                <span className="font-bold text-sm tracking-tight">AI COPILOT</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-cyan-glow text-black font-medium' 
                      : 'bg-white/5 text-white/90 border border-white/5'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-cyan-glow/50 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={executeMutation.isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-glow hover:bg-cyan-glow/10 rounded-lg transition-all disabled:opacity-50"
                >
                  {executeMutation.isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-2xl bg-cyan-glow text-black neo-glow-cyan flex items-center justify-center hover:scale-110 transition-all active:scale-95"
      >
        <MessageSquare size={28} />
      </button>
    </div>
  );
}
