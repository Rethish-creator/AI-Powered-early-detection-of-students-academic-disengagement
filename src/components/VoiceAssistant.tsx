import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.ts';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Send,
  MessageSquare,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface VoiceAssistantProps {
  currentStudentId?: string;
  onNavigate?: (view: string, data?: any) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  currentStudentId,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [muted, setMuted] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Hello! I am EduVoice, your academic engagement voice assistant. You can speak to me or type questions about student attendance trends, SHAP factors, or risk indicators.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript && transcript.trim()) {
          handleSendQuery(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStudentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const toggleListen = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Stop speech synthesis if talking
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current?.start();
      } catch {
        recognitionRef.current?.stop();
      }
    }
  };

  const speakText = (text: string) => {
    if (muted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askVoiceAssistant(queryText, currentStudentId);
      const aiReply = res.reply;

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(aiReply);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered a problem analyzing the current cohort indicators. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Tell me about student S023",
    "Who needs priority support?",
    "Explain the attendance drop rule",
    "What support interventions are recommended?"
  ];

  return (
    <>
      {/* Floating Widget Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-bold border border-white/20 select-none group"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 text-indigo-200 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span>EduVoice Assistant</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </button>
        )}
      </div>

      {/* Expanded Voice Assistant Dialog */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] text-xs font-sans animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  <span>EduVoice Assistant</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                    AI Speech
                  </span>
                </div>
                <div className="text-[10px] text-indigo-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Explainable Engagement Guidance</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (isSpeaking) {
                    window.speechSynthesis?.cancel();
                    setIsSpeaking(false);
                  }
                  setMuted(!muted);
                }}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={muted ? 'Unmute Voice' : 'Mute Voice'}
              >
                {muted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  if (recognitionRef.current) recognitionRef.current.abort();
                  setIsSpeaking(false);
                  setIsListening(false);
                  setIsOpen(false);
                }}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Wave Animation Banner (When Listening or Speaking) */}
          {(isListening || isSpeaking) && (
            <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-indigo-900">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 h-3">
                  <span className="w-1 bg-indigo-600 rounded-full animate-pulse h-3" />
                  <span className="w-1 bg-indigo-600 rounded-full animate-pulse delay-75 h-5" />
                  <span className="w-1 bg-indigo-600 rounded-full animate-pulse delay-150 h-2" />
                  <span className="w-1 bg-indigo-600 rounded-full animate-pulse delay-100 h-4" />
                </div>
                <span className="text-[11px] font-bold">
                  {isListening ? 'Listening for speech...' : 'EduVoice speaking aloud...'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (isListening) recognitionRef.current?.stop();
                  if (isSpeaking) window.speechSynthesis?.cancel();
                  setIsListening(false);
                  setIsSpeaking(false);
                }}
                className="text-[10px] font-semibold text-indigo-600 hover:underline"
              >
                Stop
              </button>
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map(msg => {
              const isAi = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAi ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                      isAi
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {isAi ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                      isAi
                        ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                        : 'bg-indigo-600 text-white shadow-2xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] mt-1 block ${
                        isAi ? 'text-slate-400' : 'text-indigo-200'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>EduVoice analyzing academic patterns...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendQuery(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-medium border border-slate-200 transition-colors flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendQuery(inputQuery);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListen}
                className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-md animate-pulse ring-4 ring-rose-200'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                }`}
                title={isListening ? 'Stop Listening' : 'Speak with Microphone'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Type or speak a question...'}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-xs"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition-colors flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
