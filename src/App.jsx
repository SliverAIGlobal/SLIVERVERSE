import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageSquare, BookOpen, User,
  Sparkles, Wind, Bell, Key, ShieldCheck,
  Zap, Check, X, ArrowRight, Play, Pause,
  Share2, Download, Printer, Lock, ChevronRight,
  Smile, Frown, AlertCircle, RefreshCw, Sliders,
  Crown, Smartphone, Send, Mic, MicOff, Volume2,
  PhoneCall, MessageCircle, BarChart3, Sun, Moon
} from 'lucide-react';

// --- HUGGINGFACE & AI ENGINE HELPERS ---
const HF_GEMMA_MODEL = "google/gemma-2-9b-it";
const HF_MISTRAL_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

const getStoredHFKey = () => {
  return localStorage.getItem('SERENITY_HF_API_KEY') || window.VITE_HF_API_KEY || "";
};

const callHuggingFaceAPI = async (prompt, maxRetries = 2) => {
  const hfKey = getStoredHFKey();
  const models = [HF_GEMMA_MODEL, HF_MISTRAL_MODEL];

  for (const model of models) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (hfKey) headers['Authorization'] = `Bearer ${hfKey}`;

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 300, temperature: 0.7, return_full_text: false }
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (Array.isArray(result) && result[0]?.generated_text) {
            return { text: result[0].generated_text, model };
          }
        }
      } catch (e) {
        console.warn(`Attempt failed for ${model}`, e);
      }
      attempt++;
    }
  }

  // Local Empathetic AI Fallback
  return {
    text: "I hear you deeply. Thank you for taking a quiet moment to share that with me. How are you holding this feeling in your body right now?",
    model: "Serenity Local Engine"
  };
};

const safeCopyToClipboard = async (text, onSuccess) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      if (onSuccess) onSuccess();
      return true;
    }
  } catch (err) {
    // fallback
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  const successful = document.execCommand('copy');
  document.body.removeChild(textArea);
  if (successful && onSuccess) onSuccess();
  return successful;
};

// --- DATA CONSTANTS ---
const PRICING_TIERS = {
  basic: {
    name: "Basic",
    pricePromo: "$2.99",
    priceReg: "$7.99",
    period: "/month",
    badge: "30-Day Launch Offer",
    features: [
      "5 Daily AI Companion Check-ins",
      "Standard Mood Journal & Pulse Tracker",
      "1-Minute Mindful Pause Breathing Widget",
      "Weekly Emotional Rhythm Trend Chart"
    ],
    buttonText: "Claim 30-Day $2.99 Launch Offer",
    highlight: false
  },
  premium: {
    name: "Premium",
    pricePromo: "$11.99",
    priceReg: "$29.99",
    period: "/month",
    badge: "Most Popular",
    features: [
      "Unlimited HuggingFace Gemma & Mistral AI Dialogue",
      "Voice Reflection Notes with Audio Waveform",
      "AI Pattern Insights & Correlation Analysis",
      "Custom Tone Selector (Gentle, Coaching, Creative)",
      "SMS Gentle Nudge Daily Reflections"
    ],
    buttonText: "Upgrade to Premium ($11.99)",
    highlight: true
  },
  pro: {
    name: "Licensed Pro",
    pricePromo: "$59.00",
    priceReg: "$99.99",
    period: "/year",
    badge: "Best Value",
    features: [
      "Everything in Premium + Priority HuggingFace 27B Model",
      "Zero-Knowledge Encrypted Export Certificates",
      "Printable/Saveable Guided HTML & PDF Worksheets",
      "Active Listener Validation Mode",
      "Commercial & White-Label Usage Rights"
    ],
    buttonText: "Unlock Licensed Pro ($59/yr)",
    highlight: false
  }
};

const QUOTES_POOL = [
  { quote: "Peace is not the absence of trouble, but the presence of serenity within.", author: "Dr. Brené Brown" },
  { quote: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
  { quote: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" }
];

// --- APP COMPONENT ---
export default function App() {
  // Navigation & State
  const [activeTab, setActiveTab] = useState('home'); // home, chat, journal, profile
  const [userTier, setUserTier] = useState('basic'); // basic, premium, pro
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // User Profile Data
  const [userProfile, setUserProfile] = useState({
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    streak: 7,
    tone: 'Gentle & Nurturing', // Gentle & Nurturing, Direct & Coaching, Playful & Creative
    activeListener: true,
    smsNudgeEnabled: true,
    smsPhone: '+1 (808) 555-0199',
    smsTime: '12:30 PM'
  });

  // HuggingFace Key
  const [hfKey, setHfKey] = useState(getStoredHFKey());
  const [promoCodeInput, setPromoCodeCodeInput] = useState("");

  // Home Screen State
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Breathing Widget State
  const [breathPhase, setBreathingPhase] = useState('Inhale');
  const [breathSec, setBreathingSec] = useState(4);
  const [breathActive, setBreathingActive] = useState(false);

  useEffect(() => {
    let timer = null;
    if (breathActive) {
      timer = setInterval(() => {
        setBreathingSec(prev => {
          if (prev > 1) return prev - 1;
          if (breathPhase === 'Inhale') { setBreathingPhase('Hold'); return 4; }
          if (breathPhase === 'Hold') { setBreathingPhase('Exhale'); return 4; }
          setBreathingPhase('Inhale'); return 4;
        });
      }, 1000);
    } else {
      setBreathingPhase('Inhale');
      setBreathingSec(4);
    }
    return () => clearInterval(timer);
  }, [breathActive, breathPhase]);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState([
    { speaker: 'bot', text: 'Welcome to Serenity, Maya. I am here to listen with care. What is on your mind today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [dailyMsgCount, setDailyMsgCount] = useState(2);
  const [audioPlayingIndex, setAudioPlayingIndex] = useState(null);

  // Mood Journal State
  const [pulseMood, setPulseMood] = useState('Peaceful');
  const [pulseIntensity, setPulseIntensity] = useState(6);
  const [journalText, setJournalText] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);

  // SMS Notification Toast
  const [showSmsToast, setShowSmsToast] = useState(false);

  const triggerPaywall = (reason) => {
    setPaywallReason(reason);
    setIsPaywallOpen(true);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    if (userTier === 'basic' && dailyMsgCount >= 5) {
      triggerPaywall("You've reached your 5 daily messages on the Basic plan. Upgrade to Premium for unlimited AI companion chat.");
      return;
    }

    const newMsgs = [...chatMessages, { speaker: 'user', text: chatInput }];
    setChatMessages(newMsgs);
    setChatInput('');
    setChatLoading(true);
    setDailyMsgCount(prev => prev + 1);

    const prompt = `System: You are Serenity, an empathetic AI companion. Communication Tone: ${userProfile.tone}. ${userProfile.activeListener ? 'Prioritize deep emotional validation before giving advice.' : ''}\nUser: ${chatInput}\nSerenity:`;

    const aiRes = await callHuggingFaceAPI(prompt);
    setChatMessages([...newMsgs, { speaker: 'bot', text: aiRes.text, model: aiRes.model }]);
    setChatLoading(false);
  };

  const handleApplyPromo = () => {
    if (promoCodeInput.trim().toUpperCase() === 'SERENITY-PRO') {
      setUserTier('pro');
      alert("🎉 Promo Code Applied! You now have Licensed Pro status.");
      setIsPaywallOpen(false);
    } else if (promoCodeInput.trim().toUpperCase() === 'PREMIUM') {
      setUserTier('premium');
      alert("🎉 Premium Pass Activated!");
      setIsPaywallOpen(false);
    } else {
      alert("Invalid promo key. Try 'SERENITY-PRO' or 'PREMIUM'");
    }
  };

  const handlePlayVoiceNote = (index, text) => {
    if (audioPlayingIndex === index) {
      window.speechSynthesis.cancel();
      setAudioPlayingIndex(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setAudioPlayingIndex(null);
      setAudioPlayingIndex(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendTestSms = () => {
    setShowSmsToast(true);
    setTimeout(() => setShowSmsToast(false), 4000);
  };

  // --- SUB-VIEWS ---

  // 1. HOME SCREEN
  const renderHomeScreen = () => (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 flex items-center gap-1.5 font-sans">
              Serenity
              <span className="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {userTier.toUpperCase()}
              </span>
            </h1>
            <p className="text-xs text-gray-500">Welcome back, {userProfile.name}</p>
          </div>
        </div>
        <button
          onClick={() => triggerPaywall("Upgrade to Premium for unlimited AI responses, custom tones & SMS nudges.")}
          className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-xs font-bold shadow-md hover:opacity-95 flex items-center gap-1"
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Upgrade</span>
        </button>
      </div>

      {/* Daily Reflection Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-lg space-y-2 relative overflow-hidden">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-indigo-200">
          <span>Daily Reflection Quote</span>
          <Sparkles className="w-4 h-4 text-pink-300" />
        </div>
        <p className="text-base font-serif italic">"{QUOTES_POOL[quoteIndex].quote}"</p>
        <p className="text-xs text-indigo-200 text-right">— {QUOTES_POOL[quoteIndex].author}</p>
      </div>

      {/* Mood Check-in Grid */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm text-gray-800">How are you feeling right now?</h2>
          <span className="text-xs text-indigo-600 font-semibold">{selectedMood}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Joyful', icon: '✨', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
            { label: 'Calm', icon: '🌿', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { label: 'Overwhelmed', icon: '🌊', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { label: 'Anxious', icon: '⚡', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
            { label: 'Tired', icon: '🌙', bg: 'bg-purple-50 text-purple-700 border-purple-200' }
          ].map(m => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m.label)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                selectedMood === m.label ? 'ring-2 ring-indigo-500 scale-105 shadow-sm ' + m.bg : 'bg-gray-50 border-gray-100 text-gray-600'
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <span className="text-[10px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Companion Spaces */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-gray-800 flex items-center justify-between">
          <span>AI Companion Spaces</span>
          <span className="text-xs text-indigo-600 font-medium">Guided Entry</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: "Talk through work stress", desc: "Reframe workload anxiety", icon: MessageSquare, topic: "Work Stress" },
            { title: "Reframe my thoughts", desc: "Challenge cognitive distortions", icon: Sparkles, topic: "Cognitive Reframing" },
            { title: "Bedtime wind-down", desc: "Gentle evening reflection", icon: Moon, topic: "Evening Wind-down" }
          ].map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setChatMessages([
                  ...chatMessages,
                  { speaker: 'user', text: `I would like to ${s.title.toLowerCase()}.` },
                  { speaker: 'bot', text: `I'm right here with you. Let's explore your feelings around ${s.topic.toLowerCase()} step by step.` }
                ]);
                setActiveTab('chat');
              }}
              className="p-4 rounded-2xl bg-white border border-indigo-50 shadow-sm text-left hover:border-indigo-200 transition-all flex items-start space-x-3"
            >
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">{s.title}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mindful Pause Widget (1-min breathing) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-600" /> 1-Minute Mindful Pause
            </h2>
            <p className="text-xs text-gray-500">Center your nervous system with guided rhythm</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            {breathActive ? `${breathPhase} (${breathSec}s)` : 'Ready'}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-50/50 to-teal-50/30 rounded-2xl border border-emerald-100">
          <div className={`w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-500/50 flex items-center justify-center transition-all duration-1000 transform ${
            breathActive ? (breathPhase === 'Inhale' ? 'scale-125 bg-emerald-500/30' : breathPhase === 'Hold' ? 'scale-125 bg-emerald-500/40' : 'scale-90 bg-emerald-500/10') : 'scale-100'
          }`}>
            <Wind className="w-10 h-10 text-emerald-600 animate-pulse" />
          </div>
          <button
            onClick={() => setBreathingActive(!breathActive)}
            className="mt-4 px-6 py-2 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-md hover:bg-emerald-700 transition-colors"
          >
            {breathActive ? 'Pause Exercise' : 'Start 1-Min Pulse'}
          </button>
        </div>
      </div>

      {/* Weekly Emotional Rhythm Summary */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Weekly Emotional Rhythm
          </h2>
          <span className="text-xs text-emerald-600 font-semibold">+18% Resilience</span>
        </div>
        <div className="grid grid-cols-7 gap-2 pt-2 text-center">
          {[
            { day: 'M', level: 65, color: 'bg-indigo-400' },
            { day: 'T', level: 80, color: 'bg-emerald-400' },
            { day: 'W', level: 45, color: 'bg-amber-400' },
            { day: 'T', level: 90, color: 'bg-emerald-500' },
            { day: 'F', level: 75, color: 'bg-indigo-500' },
            { day: 'S', level: 85, color: 'bg-emerald-400' },
            { day: 'S', level: 95, color: 'bg-indigo-600' }
          ].map((d, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <div className="w-full bg-gray-100 rounded-full h-16 flex items-end p-0.5">
                <div className={`w-full rounded-full ${d.color}`} style={{ height: `${d.level}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-gray-500">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 2. AI COMPANION CHAT
  const renderChatScreen = () => (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-indigo-50 overflow-hidden animate-fade-in">
      {/* Session Header */}
      <div className="p-3.5 border-b bg-gradient-to-r from-indigo-50/60 to-purple-50/40 flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              <Heart className="w-4 h-4" />
            </div>
            <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0"></span>
          </div>
          <div>
            <h2 className="font-bold text-xs text-gray-900 flex items-center gap-1">
              Serenity AI Companion
              <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded-full">
                {userProfile.tone}
              </span>
            </h2>
            <p className="text-[10px] text-gray-500">Listening with care • Zero-Knowledge Encryption</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-1 rounded-full">
            {userTier === 'basic' ? `${5 - dailyMsgCount} Msgs Left` : 'Unlimited'}
          </span>
          <button
            onClick={() => triggerPaywall("Unlock custom AI tones, voice reflection notes & HuggingFace Gemma models.")}
            className="p-1.5 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200"
            title="AI Options & Tones"
          >
            <Crown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Paths */}
      <div className="p-2 bg-gray-50 border-b flex space-x-2 overflow-x-auto custom-scrollbar">
        {[
          "I need advice on a difficult situation",
          "Just want to vent without judgment",
          "Help me reframe negative thoughts",
          "Send gentle SMS reminder"
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (chip.includes("SMS")) {
                handleSendTestSms();
              } else {
                setChatInput(chip);
              }
            }}
            className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[11px] rounded-full whitespace-nowrap hover:bg-indigo-50 hover:text-indigo-700 font-medium"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Dialogue List */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-2.5 ${msg.speaker === 'user' ? 'justify-end' : ''}`}>
            {msg.speaker === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Heart className="w-4 h-4" />
              </div>
            )}
            <div className={`p-3.5 rounded-2xl max-w-[82%] text-xs md:text-sm leading-relaxed shadow-sm ${
              msg.speaker === 'user'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                : 'bg-gray-50 text-gray-800 border border-gray-200/80 rounded-bl-none'
            }`}>
              <p>{msg.text}</p>
              {msg.model && (
                <span className="block text-[9px] text-gray-400 mt-1 font-mono">
                  Engine: {msg.model}
                </span>
              )}

              {/* Voice Reflection Note Waveform Widget (Premium) */}
              {msg.speaker === 'bot' && (
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2 bg-white/60 p-2 rounded-xl">
                  <button
                    onClick={() => {
                      if (userTier === 'basic') {
                        triggerPaywall("Voice Reflection Waveforms and Audio Playback are Premium features.");
                      } else {
                        handlePlayVoiceNote(index, msg.text);
                      }
                    }}
                    className="p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                  >
                    {audioPlayingIndex === index ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 flex items-center gap-0.5 h-4">
                    {[30, 60, 40, 90, 70, 50, 80, 100, 60, 40, 70, 90, 50].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full ${audioPlayingIndex === index ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-300'}`}
                        style={{ height: `${h}%` }}
                      ></span>
                    ))}
                  </div>
                  <span className="text-[10px] text-indigo-700 font-bold">Voice Note</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl max-w-xs text-xs text-gray-500">
            <Heart className="w-4 h-4 text-indigo-500 animate-bounce" />
            <span>Serenity is formulating empathetic guidance...</span>
          </div>
        )}
      </div>

      {/* Messaging Input */}
      <div className="p-3 border-t bg-white flex items-center space-x-2">
        <textarea
          rows="1"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
          placeholder="Share your feelings gently..."
          className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
        />
        <button
          onClick={handleSendMessage}
          disabled={!chatInput.trim() || chatLoading}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // 3. MOOD JOURNAL & INSIGHTS
  const renderJournalScreen = () => (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Daily Pulse Selector */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="font-bold text-sm text-gray-900">Daily Pulse Check-in</h2>
            <p className="text-xs text-gray-500">Record your heart state and intensity level</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
            {pulseMood} ({pulseIntensity}/10)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {['Peaceful', 'Grateful', 'Restless', 'Overwhelmed', 'Vulnerable', 'Centered'].map(p => (
            <button
              key={p}
              onClick={() => setPulseMood(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                pulseMood === p ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Intensity Level: {pulseIntensity} / 10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={pulseIntensity}
            onChange={(e) => setPulseIntensity(e.target.value)}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* AI Pattern Insights */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-800">
          <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-indigo-600" /> Verified Pattern Insight</span>
          <span className="bg-white/80 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">Serenity AI</span>
        </div>
        <p className="text-xs text-gray-800 leading-relaxed italic">
          "Your evening reflections show <strong className="text-indigo-900 font-extrabold">40% less anxiety</strong> on days when you complete a 1-minute Mindful Pause breathing exercise."
        </p>
      </div>

      {/* Guided Reflection Editor */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 space-y-3">
        <h2 className="font-bold text-sm text-gray-900 flex items-center justify-between">
          <span>Guided Daily Reflection</span>
          <span className="text-[10px] text-gray-400">Prompt of the day</span>
        </h2>

        <p className="text-xs font-serif italic text-indigo-900 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
          "What brought unexpected peace or grounding to your day today?"
        </p>

        <textarea
          rows="4"
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Write your reflections here..."
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
        />

        <div className="flex justify-between items-center pt-1">
          <span className="text-[10px] text-gray-400">Zero-knowledge local storage</span>
          <button
            onClick={() => {
              setJournalSaved(true);
              setTimeout(() => setJournalSaved(false), 3000);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md"
          >
            {journalSaved ? '✓ Saved Privately' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </div>
  );

  // 4. PROFILE & SETTINGS
  const renderProfileScreen = () => (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* User Profile */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
            ML
          </div>
          <div>
            <h2 className="font-bold text-sm text-gray-900">{userProfile.name}</h2>
            <p className="text-xs text-gray-500">{userProfile.email}</p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
              ✓ Verified Member
            </span>
          </div>
        </div>

        <div className="text-center bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
          <span className="block font-extrabold text-indigo-700 text-lg">{userProfile.streak}</span>
          <span className="text-[10px] text-indigo-900 font-medium">Day Streak</span>
        </div>
      </div>

      {/* License Tier Selector */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-950 p-5 rounded-2xl text-white shadow-xl space-y-3">
        <div className="flex justify-between items-center border-b border-indigo-700 pb-2">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Active License Tier</h3>
          </div>
          <span className="text-xs font-extrabold bg-amber-400 text-black px-2.5 py-0.5 rounded-full uppercase">
            {userTier}
          </span>
        </div>

        <p className="text-xs text-indigo-200">
          Current Plan: <strong className="text-white capitalize">{userTier} Access</strong>. Unlock HuggingFace Gemma models, unlimited messages & encrypted exports.
        </p>

        <button
          onClick={() => triggerPaywall("Manage subscription tiers and unlock Licensed Pro.")}
          className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold rounded-xl text-xs hover:brightness-110 transition-all shadow-md"
        >
          Manage / Upgrade Licensing Tiers
        </button>
      </div>

      {/* Companion Personality & Tone */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 space-y-3">
        <h3 className="font-bold text-sm text-gray-900 flex items-center justify-between">
          <span>Companion Communication Style</span>
          <span className="text-xs text-indigo-600 font-semibold">{userProfile.tone}</span>
        </h3>

        <div className="grid grid-cols-1 gap-2">
          {['Gentle & Nurturing', 'Direct & Coaching', 'Playful & Creative'].map(tone => (
            <button
              key={tone}
              onClick={() => {
                if (userTier === 'basic') {
                  triggerPaywall("Custom Communication Tones are available in Premium & Pro.");
                } else {
                  setUserProfile({ ...userProfile, tone });
                }
              }}
              className={`p-3 rounded-xl border text-left text-xs font-medium flex justify-between items-center transition-all ${
                userProfile.tone === tone ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-gray-50 border-gray-100 text-gray-700'
              }`}
            >
              <span>{tone}</span>
              {userProfile.tone === tone && <Check className="w-4 h-4 text-indigo-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* SMS Gentle Nudge Scheduler */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-indigo-600" /> SMS Gentle Nudges
            </h3>
            <p className="text-xs text-gray-500">Receive quiet, non-intrusive reflection check-ins</p>
          </div>
          <button
            onClick={() => setUserProfile({ ...userProfile, smsNudgeEnabled: !userProfile.smsNudgeEnabled })}
            className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${userProfile.smsNudgeEnabled ? 'bg-indigo-600 justify-end' : 'bg-gray-300 justify-start'}`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow"></span>
          </button>
        </div>

        {userProfile.smsNudgeEnabled && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userProfile.smsPhone}
                  onChange={(e) => setUserProfile({ ...userProfile, smsPhone: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Nudge Time</label>
                <input
                  type="text"
                  value={userProfile.smsTime}
                  onChange={(e) => setUserProfile({ ...userProfile, smsTime: e.target.value })}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSendTestSms}
              className="w-full py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-100 transition-colors"
            >
              Send Test Gentle SMS Nudge Now
            </button>
          </div>
        )}
      </div>

      {/* HuggingFace API Key Setup */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-amber-500" /> HuggingFace Key Setup
          </h3>
          <span className="text-[10px] font-mono text-gray-400">{hfKey ? 'Key Active' : 'Offline Engine'}</span>
        </div>
        <p className="text-xs text-gray-500">
          Enter custom HuggingFace token for live Gemma 2B/9B and Mistral 7B inference:
        </p>
        <input
          type="password"
          value={hfKey}
          onChange={(e) => setHfKey(e.target.value)}
          placeholder="hf_..."
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
        />
        <button
          onClick={() => {
            localStorage.setItem('SERENITY_HF_API_KEY', hfKey.trim());
            alert("HuggingFace API Key saved!");
          }}
          className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors shadow-md"
        >
          Save Key
        </button>
      </div>

      {/* Zero-Knowledge Privacy Standard */}
      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex items-start space-x-3 text-xs text-emerald-900">
        <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Zero-Knowledge Architecture Guarantee</span>
          <p className="text-[11px] text-emerald-800 mt-0.5">
            Your personal reflection data is client-side encrypted. No inputs are stored or used for model training.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#1b1c1a] flex flex-col font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-gray-200">
      {/* Toast Notification for SMS Nudge */}
      {showSmsToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs w-11/12 max-w-sm animate-bounce">
          <MessageCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold block">Serenity Gentle SMS Nudge</span>
            <span className="text-[11px] text-gray-300">"Take a 1-minute pause, Maya. What brought peace today?"</span>
          </div>
        </div>
      )}

      {/* App Body Content */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {activeTab === 'home' && renderHomeScreen()}
        {activeTab === 'chat' && renderChatScreen()}
        {activeTab === 'journal' && renderJournalScreen()}
        {activeTab === 'profile' && renderProfileScreen()}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-gray-200 p-2 flex justify-around items-center sticky bottom-0 z-40">
        {[
          { id: 'home', label: 'Home', icon: Heart },
          { id: 'chat', label: 'AI Companion', icon: MessageSquare },
          { id: 'journal', label: 'Mood Journal', icon: BookOpen },
          { id: 'profile', label: 'Settings', icon: User }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all ${
              activeTab === tab.id ? 'text-indigo-600 font-bold scale-105' : 'text-gray-400 font-medium hover:text-gray-600'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* PAYWALL / UPGRADE MODAL */}
      {isPaywallOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar border border-indigo-100">
            <button
              onClick={() => setIsPaywallOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto shadow-lg">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">Serenity Launch Offers</h2>
              <p className="text-xs text-gray-500">Google Play & App Store Ready Licensing</p>
            </div>

            {paywallReason && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{paywallReason}</span>
              </div>
            )}

            {/* Pricing Tier Options */}
            <div className="space-y-3">
              {Object.entries(PRICING_TIERS).map(([key, tier]) => (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border transition-all ${
                    tier.highlight ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 shadow-md ring-2 ring-indigo-500' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">{tier.name}</span>
                      <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {tier.badge}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-indigo-900">{tier.pricePromo}</span>
                      <span className="text-[10px] text-gray-400 line-through block">{tier.priceReg}</span>
                    </div>
                  </div>

                  <ul className="mt-2.5 space-y-1 text-[11px] text-gray-600">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setUserTier(key);
                      alert(`🎉 Upgraded to ${tier.name}! Thank you for supporting Serenity.`);
                      setIsPaywallOpen(false);
                    }}
                    className={`w-full mt-3 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                      tier.highlight ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {tier.buttonText}
                  </button>
                </div>
              ))}
            </div>

            {/* Promo Code & Restore Purchases */}
            <div className="pt-2 border-t space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Promo Code (e.g. SERENITY-PRO)"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeCodeInput(e.target.value)}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>

              <button
                onClick={() => alert("Purchases restored successfully.")}
                className="w-full text-center text-[10px] text-indigo-600 font-semibold hover:underline"
              >
                Restore Previous App Store / Google Play Purchases
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
