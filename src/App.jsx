import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Send, Bot, User,
  HeartHandshake, Download, Share2, BookOpen,
  CheckCircle, AlertCircle, Settings, Sparkles,
  Quote, Smile, Activity, Copy, Printer,
  RefreshCw, Compass, Linkedin, Facebook, X,
  MapPin, Calendar, Clock, SlidersHorizontal, Key,
  ShoppingBag, Speaker, Heart, Trophy, Gift,
  BookmarkCheck, Check, Wind, Image as ImageIcon, Volume2, ArrowLeft
} from 'lucide-react';

// --- API & TTS CONSTANTS & HELPERS ---
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";

const getStoredApiKey = () => {
  return localStorage.getItem('EMPATHY_AI_API_KEY') || window.VITE_GEMINI_API_KEY || "";
};

const callGeminiAPI = async (modelName, prompt, generationConfig, maxRetries = 3) => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: generationConfig,
  };

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid API response structure.");
      }
    } catch (error) {
      attempt++;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
};

const pcmToWav = (pcm16, sampleRate) => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcm16.length * 2;
  const chunkSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  let offset = 0;
  const writeString = (str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset++, str.charCodeAt(i));
    }
  };

  writeString('RIFF');
  view.setUint32(offset, chunkSize, true); offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, byteRate, true); offset += 4;
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, bitsPerSample, true); offset += 2;
  writeString('data');
  view.setUint32(offset, dataSize, true); offset += 4;

  for (let i = 0; i < pcm16.length; i++, offset += 2) {
    view.setInt16(offset, pcm16[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

const generateAndPlayTTS = async (textToSpeak) => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
    return;
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
      parts: [{ text: `Say in a warm, empathetic and gentle tone: ${textToSpeak}` }]
    }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Kore" }
        }
      }
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const part = result?.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (audioData && mimeType && mimeType.startsWith("audio/")) {
      const sampleRateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;

      const binaryString = atob(audioData);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const wavBlob = pcmToWav(pcm16, sampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      throw new Error("Fallback to SpeechSynthesis");
    }
  } catch (e) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.speak(utterance);
    }
  }
};

const downloadFile = (filename, content, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const safeCopyToClipboard = async (text, onSuccess, onError) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      if (onSuccess) onSuccess();
      return true;
    }
  } catch (err) {
    // fallback below
  }

  try {
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
    if (successful) {
      if (onSuccess) onSuccess();
      return true;
    }
  } catch (err) {
    if (onError) onError(err);
    return false;
  }
};

// --- INTERJECTION GENERATOR ---
const generatePersonalizedInterjection = (userProfile, activeScenario, lastUserMessage, index) => {
  const timeOfDay = userProfile.timeOfDay || "Today";
  const name = userProfile.name || "Friend";
  const location = userProfile.location || "Your Space";
  const dateStr = userProfile.currentDate;

  const cards = [
    {
      type: 'quote',
      title: `${timeOfDay} Reflection${name ? ` for ${name}` : ''}`,
      quote: "Empathy is not about fixing another person's storm; it's about staying anchored beside them until the sky clears.",
      author: "Dr. Brené Brown",
      bgGradient: "from-purple-600 via-indigo-600 to-blue-600",
      prompt: `Taking a moment${location ? ` in ${location}` : ''} on ${dateStr}: How does this perspective resonate with what you are sharing right now?`,
      metadata: { location, date: dateStr, recipient: name }
    },
    {
      type: 'activity',
      title: `4-7-8 Mindful Breath • ${timeOfDay} Reset`,
      description: `Pause for a moment${name ? `, ${name}` : ''}. Let go of tension gathered${location ? ` in ${location}` : ''} today before composing your next response.`,
      activityType: 'breathing',
      bgGradient: "from-teal-600 via-emerald-600 to-cyan-700",
      metadata: { location, date: dateStr, recipient: name }
    },
    {
      type: 'image_card',
      title: `Sanctuary Signal${location ? ` • ${location}` : ''}`,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      caption: `${name ? `${name}, ` : ''}like the steady tide at the shore, your authentic boundaries protect your calm regardless of outer turmoil.`,
      bgGradient: "from-blue-600 via-indigo-700 to-purple-700",
      metadata: { location, date: dateStr, recipient: name }
    },
    {
      type: 'journal_prompt',
      title: `Hyper-Personal Reflection${name ? ` for ${name}` : ''}`,
      question: lastUserMessage
        ? `Reflecting on "${lastUserMessage.slice(0, 60)}...": What core underlying need is driving this response?`
        : `What is one unspoken feeling you want to honor for yourself${location ? ` in ${location}` : ''} right now?`,
      bgGradient: "from-amber-500 via-orange-600 to-rose-600",
      metadata: { location, date: dateStr, recipient: name }
    },
    {
      type: 'compass',
      title: `Core Need Compass${location ? ` • ${location}` : ''}`,
      question: `Behind every strong reaction is an unmet human need. Ask yourself: Are you seeking clarity, appreciation, or safe space right now?`,
      bgGradient: "from-indigo-600 via-purple-600 to-pink-600",
      metadata: { location, date: dateStr, recipient: name }
    }
  ];

  return cards[index % cards.length];
};

// --- COMPONENTS ---
const BreathingWidget = () => {
  const [phase, setPhase] = useState('Inhale');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev > 1) return prev - 1;
          if (phase === 'Inhale') { setPhase('Hold'); return 7; }
          if (phase === 'Hold') { setPhase('Exhale'); return 8; }
          setPhase('Inhale'); return 4;
        });
      }, 1000);
    } else {
      setPhase('Inhale');
      setSeconds(4);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-xl text-white my-1">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-white/40 transition-all duration-1000 transform ${isActive ? (phase === 'Inhale' ? 'scale-125 bg-white/20' : phase === 'Hold' ? 'scale-125 bg-white/30' : 'scale-90 bg-white/10') : 'scale-100'}`}>
        <Wind className="w-8 h-8 text-white animate-pulse" />
      </div>
      <div className="mt-3 text-center">
        <span className="text-lg font-bold block">{isActive ? `${phase} (${seconds}s)` : 'Mindful Reset'}</span>
        <button
          onClick={() => setIsActive(!isActive)}
          className="mt-2 px-4 py-1.5 bg-white text-emerald-800 rounded-full text-xs font-semibold shadow hover:bg-emerald-50 transition-colors"
        >
          {isActive ? 'Pause' : 'Start Breathing Pause'}
        </button>
      </div>
    </div>
  );
};

const InterjectionCard = ({ item }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    safeCopyToClipboard(text, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`my-4 p-5 rounded-2xl bg-gradient-to-r ${item.bgGradient} text-white shadow-lg transform transition-all hover:scale-[1.01] relative overflow-hidden border border-white/10 animate-fade-in`}>
      {item.metadata && (item.metadata.location || item.metadata.date) && (
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-white/70 border-b border-white/15 pb-2 mb-3">
          {item.metadata.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-white/90" /> {item.metadata.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-white/90" /> {item.metadata.date}
          </span>
        </div>
      )}

      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-white/90 mb-2">
        {item.type === 'quote' && <Quote className="w-4 h-4" />}
        {item.type === 'activity' && <Wind className="w-4 h-4" />}
        {item.type === 'image_card' && <ImageIcon className="w-4 h-4" />}
        {item.type === 'journal_prompt' && <BookOpen className="w-4 h-4" />}
        {item.type === 'compass' && <Compass className="w-4 h-4" />}
        <span>{item.title}</span>
      </div>

      {item.type === 'quote' && (
        <div>
          <p className="text-base md:text-lg font-serif italic mb-2">"{item.quote}"</p>
          <p className="text-xs text-white/80 font-medium text-right mb-3">— {item.author}</p>
          <div className="bg-black/20 backdrop-blur-md p-3 rounded-xl text-xs text-white/95 border border-white/10">
            <strong className="block text-white mb-0.5 font-sans">Personal Reflection:</strong> {item.prompt}
          </div>
        </div>
      )}

      {item.type === 'activity' && (
        <div>
          <p className="text-xs md:text-sm mb-3 text-white/90 font-medium leading-relaxed">{item.description}</p>
          <BreathingWidget />
        </div>
      )}

      {item.type === 'image_card' && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl h-44 w-full relative shadow-md">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
          </div>
          <p className="text-xs md:text-sm text-white/95 italic bg-black/20 backdrop-blur-md p-3 rounded-xl border border-white/10">{item.caption}</p>
        </div>
      )}

      {(item.type === 'journal_prompt' || item.type === 'compass') && (
        <div className="space-y-3">
          <p className="text-base font-semibold leading-snug">{item.question}</p>
          <button
            onClick={() => handleCopy(item.question)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs transition-colors font-medium backdrop-blur-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <BookOpen className="w-3.5 h-3.5" />}
            <span>{copied ? 'Prompt Copied!' : 'Copy Personal Reflection'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const UserProfileModal = ({ isOpen, onClose, userProfile, setUserProfile, onOpenSettings }) => {
  const [name, setName] = useState(userProfile.name);
  const [location, setLocation] = useState(userProfile.location);

  if (!isOpen) return null;

  const handleSave = () => {
    setUserProfile(prev => ({
      ...prev,
      name: name.trim(),
      location: location.trim()
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-indigo-100">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold">
            <SlidersHorizontal className="w-5 h-5" />
            <span>Hyper-Personalization Settings</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Customize your profile metadata so cards, transcripts, and downloadable insight certificates reflect your exact details and location.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-500" /> Your Preferred Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex (optional)"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Current City / Location Stamp
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Honolulu, HI (optional)"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 transition-colors shadow-md"
            >
              Save Personal Details
            </button>
          </div>

          <button
            onClick={() => { onClose(); onOpenSettings(); }}
            className="w-full py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-xl text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <Key className="w-4 h-4" /> Configure Gemini Neural AI Key
          </button>
        </div>
      </div>
    </div>
  );
};

const ApiKeyModal = ({ isOpen, onClose }) => {
  const [key, setKey] = useState(getStoredApiKey());

  if (!isOpen) return null;

  const handleSaveKey = () => {
    localStorage.setItem('EMPATHY_AI_API_KEY', key.trim());
    alert("API Key saved to browser local storage.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-indigo-100">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold">
            <Key className="w-5 h-5 text-amber-500" />
            <span>AI Neural API Key Setup</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Configure your Gemini API key for live neural TTS audio & real-time empathetic coaching. If no key is provided, the application operates with local speech synthesis and client-side fallback responses.
        </p>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
            API Key String
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSaveKey}
            className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 transition-colors shadow-md"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ setSessionState, sessionState, userProfile, setUserProfile, onOpenSettings, onTriggerGumroad }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between flex-shrink-0 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm">
          <HeartHandshake className="w-7 h-7 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
            Empathy Assistant
            <span className="text-[10px] uppercase font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
              Wellness AI v2.5
            </span>
          </h1>
          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
            {userProfile.name ? (
              <span className="flex items-center gap-1 text-indigo-700 font-medium">
                <User className="w-3.5 h-3.5" /> {userProfile.name}
              </span>
            ) : (
              <button onClick={() => setIsProfileOpen(true)} className="text-indigo-600 hover:underline text-xs">
                + Add Name
              </button>
            )}
            {userProfile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {userProfile.location}
              </span>
            )}
            <span className="hidden sm:flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> {userProfile.timeOfDay}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onTriggerGumroad}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold rounded-xl transition-all text-xs flex items-center gap-1.5 shadow-md hover:brightness-110"
          title="Unlock Wellness AI Pass on Gumroad"
        >
          <ShoppingBag className="w-4 h-4 text-black" />
          <span className="hidden sm:inline">Gumroad Pass $29</span>
        </button>

        <button
          onClick={() => setIsProfileOpen(true)}
          className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-indigo-100"
          title="Customize User Profile & Location"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span className="hidden md:inline">Personal Settings</span>
        </button>

        {sessionState === 'active' && (
          <button
            onClick={() => setSessionState('ending')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl shadow-md transition-all hover:opacity-95 text-xs"
          >
            <span>End Session</span>
          </button>
        )}
      </div>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onOpenSettings={onOpenSettings}
      />
    </header>
  );
};

const LoadingIndicator = ({ text = "Thinking..." }) => (
  <div className="flex items-start gap-4 my-2">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
      <Bot className="w-6 h-6 animate-pulse" />
    </div>
    <div className="px-5 py-3.5 rounded-2xl bg-white border border-indigo-100 text-gray-800 rounded-bl-none shadow-sm">
      <div className="flex items-center space-x-2">
        <span className="font-medium text-sm text-indigo-900">{text}</span>
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.15s]"></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.3s]"></div>
      </div>
    </div>
  </div>
);

const ConversationPanel = ({ conversation, isLoading, onTriggerBreak, userProfile }) => {
  const conversationEndRef = useRef(null);
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className="flex-[2] flex flex-col bg-white rounded-2xl shadow-lg h-full min-h-[40vh] md:min-h-0 border border-gray-100">
      <div className="p-3.5 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-white rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Interactive Dialogue
          </span>
          <span className="text-[10px] text-gray-400 border-l pl-2 font-mono hidden sm:inline">
            {userProfile.location ? `${userProfile.location} • ` : ''}{userProfile.currentDate}
          </span>
        </div>
        <button
          onClick={onTriggerBreak}
          className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 shadow-sm border border-indigo-200/60"
          title="Insert a personalized mindful break card into the chat"
        >
          <Wind className="w-3.5 h-3.5 text-teal-600" /> Personal Reset Card
        </button>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          {conversation.map((entry, index) => {
            if (entry.isInterjection) {
              return <InterjectionCard key={index} item={entry.interjectionData} />;
            }

            return (
              <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'user' ? 'justify-end' : ''}`}>
                {entry.speaker === 'bot' && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`relative px-4 py-3 rounded-2xl max-w-[82%] md:max-w-lg break-words text-sm md:text-base shadow-sm ${entry.speaker === 'user' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none' : 'bg-gray-50 border border-gray-200/80 text-gray-800 rounded-bl-none'}`}>
                  <p className="leading-relaxed">{entry.text}</p>
                  {entry.speaker === 'bot' && (
                    <button
                      onClick={() => generateAndPlayTTS(entry.text)}
                      title="Listen to voice"
                      className="absolute -bottom-3 right-2 bg-white border border-indigo-100 text-indigo-600 p-1.5 rounded-full shadow-md hover:bg-indigo-50 transition-all hover:scale-110"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    </button>
                  )}
                </div>
                {entry.speaker === 'user' && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center shadow-md text-white font-bold text-xs">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && <LoadingIndicator text="EA is tailoring empathetic metrics & audio response..." />}
          <div ref={conversationEndRef} />
        </div>
      </div>
    </div>
  );
};

const FeedbackPanel = ({ feedback, activeScenario, activeScenarioGoal, onSelectScenario, userProfile }) => {
  const scenarios = [
    {
      title: "Setting a healthy boundary with a demanding coworker",
      focus: "Assertiveness & Clarity without Aggression",
      objectives: ["State needs clearly", "Maintain calm firmness", "Offer realistic alternatives"]
    },
    {
      title: "Apologizing sincerely to a close friend for a misunderstanding",
      focus: "Accountability & Empathy without Defensiveness",
      objectives: ["Acknowledge impact over intention", "Validate friend's emotions", "Offer concrete rebuild steps"]
    },
    {
      title: "Expressing vulnerability to a partner about feeling overwhelmed",
      focus: "Self-Awareness & Connection",
      objectives: ["Use 'I feel' statements", "Avoid blame patterns", "Invite shared problem solving"]
    },
    {
      title: "Giving constructive feedback without sounding critical",
      focus: "Softening Tone & Outcome Focus",
      objectives: ["Highlight strengths first", "Address behavior not identity", "Ask open ended questions"]
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-4 min-h-[40vh] md:min-h-0 overflow-y-auto custom-scrollbar border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600" />
          Real-time Guidance
        </span>
        <span className="text-[11px] bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-semibold">
          {activeScenario ? "Active Objective" : "Live Guidance"}
        </span>
      </h2>

      <div className="text-[11px] bg-indigo-50/60 p-2 rounded-xl text-indigo-900 flex justify-between items-center border border-indigo-100">
        <span className="font-semibold">Context: {userProfile.name ? userProfile.name : 'User'}{userProfile.location ? ` in ${userProfile.location}` : ''}</span>
        <span className="text-indigo-600">{userProfile.timeOfDay}</span>
      </div>

      {activeScenarioGoal && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">Current Goal</span>
          <p className="text-xs md:text-sm text-indigo-900 font-medium">{activeScenarioGoal}</p>
        </div>
      )}

      {activeScenario && (
        <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-800 font-bold text-xs uppercase tracking-wide mb-1">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Active Practice Target</span>
          </div>
          <p className="text-xs font-semibold text-gray-800 mb-1">{activeScenario.title}</p>
          <p className="text-xs text-indigo-600 mb-2 font-medium">Focus: {activeScenario.focus}</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {activeScenario.objectives.map((obj, i) => (
              <li key={i} className="flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-1.5"></span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.suggestions && feedback.suggestions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-indigo-700 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-indigo-500" /> {feedback.title}
          </h3>
          <ul className="space-y-2">
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start text-xs md:text-sm bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/60">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-6 flex flex-col justify-center items-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <Bot className="mx-auto text-indigo-300 animate-bounce text-3xl" />
          <p className="mt-2 text-xs px-4">Tailored tips and scenario insights will populate here in real-time as you chat with Empathy Assistant.</p>
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <h3 className="font-bold text-gray-700 text-sm mb-1.5 flex items-center">
          <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" /> Practice Scenarios
        </h3>
        <p className="text-xs text-gray-500 mb-3">Select a scenario to target live AI coaching:</p>
        <div className="space-y-2">
          {scenarios.map((scen, idx) => {
            const isSelected = activeScenario?.title === scen.title;
            return (
              <button
                key={idx}
                onClick={() => onSelectScenario(scen)}
                className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all font-medium flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-md scale-[1.01]'
                    : 'bg-indigo-50/50 hover:bg-indigo-100/80 text-indigo-900 border-indigo-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{scen.title}</span>
                  <span>{isSelected ? '✓' : '→'}</span>
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-indigo-600'}`}>
                  Focus: {scen.focus}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MessageInput = ({ userInput, setUserInput, handleSendMessage, toggleRecording, isRecording, isLoading, setSessionState, userProfile, speechSupported }) => (
  <div className="p-4 bg-white rounded-2xl shadow-lg mt-4 flex flex-col gap-2 border border-gray-100">
    <div className="flex items-center space-x-2">
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
        placeholder={speechSupported ? `Type your response${userProfile.name ? `, ${userProfile.name}` : ''}, or click mic to speak...` : "Type your message..."}
        className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-sm transition-all"
        rows="2"
        disabled={isLoading}
      />
      {speechSupported && (
        <button
          onClick={toggleRecording}
          className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
          disabled={isLoading}
          title="Voice input"
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      )}
      <button
        onClick={handleSendMessage}
        disabled={isLoading || !userInput.trim()}
        className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md transform active:scale-95"
        title="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
    <button
      onClick={() => setSessionState('ending')}
      className="md:hidden w-full py-2 bg-red-500 text-white font-semibold rounded-xl shadow-lg transition-all mt-2 hover:bg-red-600 text-xs"
    >
      End Session & Review
    </button>
  </div>
);

const ShareModal = ({ isOpen, onClose, sessionData, sessionSummary, userProfile, userQuote, conversation, onTriggerGumroad }) => {
  const [copied, setCopied] = useState(false);
  const [shareTab, setShareTab] = useState('card');

  if (!isOpen) return null;

  const dateStr = userProfile.currentDate || new Date().toLocaleDateString();
  const summaryText = sessionData?.keyTakeaway || sessionSummary || "Practicing clear, empathetic communication.";

  const formattedShareText = `🌟 EMPATHY ASSISTANT INSIGHT CERTIFICATE 🌟

Practitioner: ${userProfile.name || "Anonymous"}
${userProfile.location ? `Location: ${userProfile.location}\n` : ''}Date & Time: ${dateStr} at ${userProfile.currentTime} (${userProfile.timeOfDay})

Core Theme: ${sessionData?.emotionalCore || "Reflective Exploration"}
User Quote Highlight: "${userQuote || "I am practicing clear, honest communication."}"
Breakthrough Insight: ${sessionData?.breakthroughMoment || "Deeper awareness gained through practice."}

💡 Tailored Key Tips:
${sessionData?.eaTips ? sessionData.eaTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n') : "1. Practice active listening with heart."}

✨ Strengths Unlocked: ${sessionData?.treasuredGrowth ? sessionData.treasuredGrowth.join(', ') : "Vulnerability, Self-Compassion"}

Generated via Empathy Assistant Studio`;

  const handleCopyText = async () => {
    const success = await safeCopyToClipboard(formattedShareText, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Empathy Practice Card${userProfile.name ? ` - ${userProfile.name}` : ''}`,
          text: formattedShareText
        });
      } catch (err) {
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  const handleExportHTMLCard = () => {
    const transcriptHTML = conversation.map(c => `<div style="margin-bottom: 12px;"><strong>${c.speaker === 'user' ? (userProfile.name || 'User') : 'Empathy Assistant'}:</strong> ${c.text}</div>`).join('');
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Empathy Session Insight Card</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; padding: 40px; display: flex; justify-content: center; }
        .card { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; border-radius: 24px; padding: 36px; max-width: 580px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); position: relative; }
        .header-meta { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.85; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px; display: flex; justify-content: space-between; }
        .badge { background: rgba(255,255,255,0.25); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; display: inline-block; margin-bottom: 12px; }
        h1 { margin-top: 5px; font-size: 24px; line-height: 1.2; }
        .quote-box { background: rgba(0,0,0,0.2); padding: 14px 18px; border-radius: 12px; font-style: italic; border-left: 4px solid #f472b6; margin: 16px 0; font-size: 14px; }
        .section { background: rgba(255,255,255,0.12); padding: 18px; border-radius: 16px; margin: 16px 0; border: 1px solid rgba(255,255,255,0.2); }
        .section-title { font-weight: bold; text-transform: uppercase; font-size: 11px; opacity: 0.85; letter-spacing: 1px; }
        ul { padding-left: 20px; margin: 8px 0 0 0; }
        li { margin-bottom: 6px; font-size: 14px; }
        .footer { text-align: center; font-size: 12px; opacity: 0.8; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header-meta">
            ${userProfile.location ? `<span>📍 ${userProfile.location}</span>` : '<span>✨ Empathy Session</span>'}
            <span>📅 ${dateStr} • ${userProfile.currentTime}</span>
        </div>
        <span class="badge">Bespoke Empathy Insight Card${userProfile.name ? ` for ${userProfile.name}` : ''}</span>
        <h1>${sessionData?.emotionalCore || "Empathetic Session Review"}</h1>

        <div class="quote-box">
            "${userQuote || "I am honoring my communication journey."}"
            <div style="font-size: 11px; font-style: normal; margin-top: 4px; opacity: 0.8;">— ${userProfile.name || "Practitioner"} (${userProfile.timeOfDay})</div>
        </div>

        <div class="section">
            <div class="section-title">Breakthrough Moment</div>
            <p style="margin: 6px 0 0 0; font-size: 15px; font-style: italic;">"${sessionData?.breakthroughMoment || "Greater emotional clarity achieved."}"</p>
        </div>

        <div class="section">
            <div class="section-title">Empathy Assistant Insights</div>
            <ul>
                ${sessionData?.eaTips ? sessionData.eaTips.map(t => `<li>${t}</li>`).join('') : '<li>Practice gentle self-compassion.</li>'}
            </ul>
        </div>

        <div class="section">
            <div class="section-title">Transcript Overview</div>
            ${transcriptHTML}
        </div>

        <div class="footer">✨ Created with Empathy Assistant Studio ${userProfile.location ? `• ${userProfile.location}` : ''} ✨</div>
    </div>
</body>
</html>`;
    downloadFile(`Empathy_Insight_Card_${Date.now()}.html`, htmlContent, 'text/html');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden border border-indigo-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-indigo-600 font-bold">
          <Share2 className="w-6 h-6" />
          <span className="text-xl">Bespoke Session Share & Certificate</span>
        </div>

        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setShareTab('card')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${shareTab === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}
          >
            Bespoke Card Preview
          </button>
          <button
            onClick={() => setShareTab('social')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${shareTab === 'social' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}
          >
            Social Networks & Share
          </button>
        </div>

        {shareTab === 'card' ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl space-y-3 relative overflow-hidden border border-white/10">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-indigo-100 border-b border-white/15 pb-2">
                {userProfile.location ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {userProfile.location}</span> : <span>Empathy Session</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateStr}</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                  {userProfile.name ? `Card for ${userProfile.name}` : 'Empathy Insight Card'}
                </span>
                <HeartHandshake className="w-5 h-5 text-pink-200" />
              </div>

              <h3 className="text-lg font-bold leading-snug">{sessionData?.emotionalCore || "Emotional Reflection"}</h3>

              {userQuote && (
                <div className="bg-black/25 p-3 rounded-xl border-l-4 border-pink-400 text-xs italic text-pink-100">
                  "{userQuote}"
                  {userProfile.name && <span className="block text-[10px] font-sans not-italic text-indigo-200 mt-1">— Direct Quote from {userProfile.name}</span>}
                </div>
              )}

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 text-xs italic">
                "{sessionData?.breakthroughMoment || summaryText}"
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Personalized Insights:</span>
                <ul className="text-xs space-y-1 list-disc list-inside text-indigo-50">
                  {sessionData?.eaTips ? sessionData.eaTips.slice(0, 2).map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  )) : <li>Practice open, compassionate listening.</li>}
                </ul>
              </div>

              <div className="pt-2 border-t border-white/20 flex justify-between items-center text-[10px] text-indigo-100 font-medium">
                <span>Stamp: {userProfile.timeOfDay} Practice</span>
                <span>{userProfile.currentTime}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleCopyText}
                className="flex items-center justify-center space-x-2 p-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-semibold text-xs transition-colors border border-indigo-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Card Text!' : 'Copy Card Text'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center space-x-2 p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-semibold text-xs transition-colors shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>System Share</span>
              </button>
            </div>

            <button
              onClick={handleExportHTMLCard}
              className="w-full flex items-center justify-center space-x-2 p-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold text-xs shadow hover:opacity-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Interactive HTML Insight Card</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-600">Share your session breakthrough directly to your social channels or messaging apps:</p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(formattedShareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-xs font-semibold"
              >
                <X className="w-4 h-4" />
                <span>X / Twitter</span>
              </a>
              <a
                href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(formattedShareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-3 bg-blue-700 text-white rounded-xl hover:bg-blue-600 transition-colors text-xs font-semibold"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(formattedShareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors text-xs font-semibold"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </a>
              <button
                onClick={handleCopyText}
                className="flex items-center space-x-2 p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors text-xs font-semibold"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onTriggerGumroad}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold rounded-xl text-xs shadow-lg hover:brightness-110 transition-all"
        >
          <ShoppingBag className="w-4 h-4 text-black" />
          <span>Unlock Unlimited Wellness AI Pass on Gumroad ($29.00)</span>
        </button>
      </div>
    </div>
  );
};

const SessionSummaryPanel = ({ sessionSummaryData, sessionSummary, handleJournal, setSessionState, conversation, isLoading, userProfile, onTriggerGumroad }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const userMessages = conversation.filter(m => m.speaker === 'user' && !m.isInterjection);
  const userQuote = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : "I am taking time for intentional empathy.";

  const handleDownloadTranscript = () => {
    let content = `=================================================\n`;
    content += ` EMPATHY ASSISTANT - HYPER-PERSONAL TRANSCRIPT\n`;
    if (userProfile.name) content += ` Practitioner: ${userProfile.name}\n`;
    if (userProfile.location) content += ` Location Stamp: ${userProfile.location}\n`;
    content += ` Date & Time: ${userProfile.currentDate} at ${userProfile.currentTime} (${userProfile.timeOfDay})\n`;
    content += `=================================================\n\n`;

    conversation.forEach((msg) => {
      if (msg.isInterjection) {
        content += `--- [Personal Mindful Card: ${msg.interjectionData.title}] ---\n\n`;
      } else {
        const speakerLabel = msg.speaker === 'user' ? (userProfile.name ? userProfile.name.toUpperCase() : 'USER') : 'EMPATHY ASSISTANT';
        content += `[${speakerLabel}]:\n${msg.text}\n\n`;
      }
    });

    downloadFile(`Empathy_Transcript_${Date.now()}.txt`, content);
  };

  const handleDownloadHTMLReport = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Empathy Session Review Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 40px; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .meta-seal { background: #e0e7ff; color: #3730a3; padding: 10px 16px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 20px; display: flex; justify-content: space-between; }
        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 24px; font-weight: 800; color: #4f46e5; }
        .card { background: #f1f5f9; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .quote-callout { background: #fce7f3; border-left: 5px solid #ec4899; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-style: italic; color: #831843; }
        .highlight-box { background: linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%); border-left: 6px solid #6366f1; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
        h2 { font-size: 18px; color: #334155; margin-top: 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .footer { text-align: center; color: #94a3b8; font-size: 13px; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="meta-seal">
            ${userProfile.name ? `<span>👤 Practitioner: ${userProfile.name}</span>` : '<span>👤 Practitioner</span>'}
            ${userProfile.location ? `<span>📍 ${userProfile.location}</span>` : ''}
            <span>📅 ${userProfile.currentDate}</span>
        </div>

        <div class="header">
            <div class="logo">Empathy Assistant Studio</div>
            <div style="color: #64748b; font-size: 14px;">${userProfile.currentTime} (${userProfile.timeOfDay})</div>
        </div>

        <div class="quote-callout">
            "${userQuote}"
            <div style="font-size: 12px; font-style: normal; font-weight: bold; margin-top: 4px; color: #9d174d;">— Direct Voice Quote</div>
        </div>

        <div class="highlight-box">
            <h1 style="margin:0 0 8px 0; font-size: 22px; color: #312e81;">${sessionSummaryData?.emotionalCore || "Session Core"}</h1>
            <p style="margin: 0; font-size: 16px; font-style: italic; color: #4338ca;">"${sessionSummaryData?.breakthroughMoment || sessionSummary || "Greater emotional clarity achieved."}"</p>
        </div>

        <div class="card">
            <h2>✨ Personalized Takeaway</h2>
            <p>${sessionSummaryData?.keyTakeaway || sessionSummary || "Continuing to express authentic feelings with clarity builds resilience."}</p>
        </div>

        <div class="card">
            <h2>💡 Specific EA Coaching Advice</h2>
            <ul>
                ${sessionSummaryData?.eaTips ? sessionSummaryData.eaTips.map(tip => `<li><strong>Tip:</strong> ${tip}</li>`).join('') : '<li>Practice gentle self-compassion.</li>'}
            </ul>
        </div>

        <div class="card">
            <h2>🎁 Strengths Unlocked</h2>
            <p><strong>Identified Strengths:</strong> ${sessionSummaryData?.treasuredGrowth ? sessionSummaryData.treasuredGrowth.join(', ') : 'Vulnerability, Self-Awareness'}</p>
        </div>

        <div class="footer">
            Generated with Empathy Assistant AI Studio
        </div>
    </div>
</body>
</html>`;

    downloadFile(`Empathy_Session_Report_${Date.now()}.html`, htmlContent, 'text/html');
  };

  const displaySummaryText = sessionSummaryData?.keyTakeaway || sessionSummary;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto my-6 border border-gray-100">
      <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-wrap justify-between items-center text-xs text-indigo-900 font-semibold gap-2">
        {userProfile.name && <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-indigo-600" /> Session for: {userProfile.name}</span>}
        {userProfile.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-600" /> Location: {userProfile.location}</span>}
        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-600" /> {userProfile.currentDate} ({userProfile.timeOfDay})</span>
      </div>

      <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-900 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-indigo-600" />
            Highlights & Review
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Personalized milestones extracted from your session.</p>
        </div>
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" /> Share Insight Card
        </button>
      </div>

      {isLoading ? (
        <LoadingIndicator text="EA is analyzing dialogue themes & extracting bespoke insights..." />
      ) : displaySummaryText ? (
        <div className="space-y-6 text-gray-800">
          {userQuote && (
            <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-pink-950 flex items-start space-x-3 shadow-sm">
              <Quote className="w-6 h-6 text-pink-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 block mb-0.5">Key Expression:</span>
                <p className="text-xs md:text-sm italic font-serif">"{userQuote}"</p>
              </div>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2">
              <Heart className="w-4 h-4 text-pink-300" />
              <span>Breakthrough Core</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">{sessionSummaryData?.emotionalCore || "Communication Clarity"}</h3>
            <p className="text-sm md:text-base italic text-indigo-100 bg-black/20 p-3 rounded-xl border border-white/10">
              "{sessionSummaryData?.breakthroughMoment || displaySummaryText}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Key Communication Takeaway
              </h4>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                {displaySummaryText}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
              <h4 className="font-bold text-sm text-purple-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                Tailored Tips
              </h4>
              <ul className="text-xs md:text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                {sessionSummaryData?.eaTips ? sessionSummaryData.eaTips.map((tip, idx) => (
                  <li key={idx} className="leading-snug">{tip}</li>
                )) : (
                  <>
                    <li>Listen actively without immediate defense</li>
                    <li>Honor your boundaries explicitly</li>
                    <li>Take mindful breaths when feeling overwhelmed</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600" />
              Strengths Discovered
            </h4>
            <div className="flex flex-wrap gap-2">
              {(sessionSummaryData?.treasuredGrowth || ["Authenticity", "Active Listening", "Vulnerability"]).map((strength, i) => (
                <span key={i} className="px-3 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {strength}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleDownloadTranscript}
              className="flex items-center justify-center space-x-2 p-3.5 bg-gray-100 hover:bg-indigo-50 border border-gray-200 rounded-xl transition-all text-gray-800 text-xs font-semibold group shadow-sm"
            >
              <Download className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span>Download Transcript (.txt)</span>
            </button>

            <button
              onClick={handleDownloadHTMLReport}
              className="flex items-center justify-center space-x-2 p-3.5 bg-gray-100 hover:bg-purple-50 border border-gray-200 rounded-xl transition-all text-gray-800 text-xs font-semibold group shadow-sm"
            >
              <Download className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
              <span>Download Visual Report (.html)</span>
            </button>

            <button
              onClick={handleJournal}
              className="flex items-center justify-center space-x-2 p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:opacity-95 transition-all text-xs font-bold transform hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Journal Worksheet</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 pt-8 flex flex-col justify-center items-center h-full">
          <AlertCircle className="mx-auto text-red-400 text-4xl" />
          <p className="mt-4 text-base font-semibold">Error: Could not retrieve session summary.</p>
          <button
            onClick={() => setSessionState('active')}
            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-full text-xs font-semibold shadow hover:bg-indigo-700"
          >
            Return to Active Session
          </button>
        </div>
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sessionData={sessionSummaryData}
        sessionSummary={displaySummaryText}
        userProfile={userProfile}
        userQuote={userQuote}
        conversation={conversation}
        onTriggerGumroad={onTriggerGumroad}
      />
    </div>
  );
};

const JournalingTemplate = ({ initialJournalData, isLoading, userProfile, onBackToSummary }) => {
  const [journal, setJournal] = useState({
    emotionIdentified: '',
    coreNeed: '',
    summaryOfEvents: '',
    reflectionPrompt1: '',
    reflectionPrompt2: '',
    littleSteps: [],
    treasuresAndGifts: [],
    eaWisdom: '',
    userNotes: ''
  });

  const [newStepText, setNewStepText] = useState('');
  const [newGiftText, setNewGiftText] = useState('');

  useEffect(() => {
    if (initialJournalData) {
      setJournal({
        emotionIdentified: initialJournalData.emotionIdentified || 'Vulnerable Courage',
        coreNeed: initialJournalData.coreNeed || 'Authentic validation and secure boundaries',
        summaryOfEvents: initialJournalData.summaryOfEvents || `Reflected thoughtfully${userProfile.location ? ` in ${userProfile.location}` : ''} on ${userProfile.currentDate}, learning to express needs without hesitation.`,
        reflectionPrompt1: initialJournalData.reflectionPrompt1 || `What story or expectation was I holding onto${userProfile.location ? ` in ${userProfile.location}` : ''} that made this conversation challenging?`,
        reflectionPrompt2: initialJournalData.reflectionPrompt2 || `How did my body feel when I chose to speak my truth instead of staying silent?`,
        littleSteps: initialJournalData.littleSteps ? initialJournalData.littleSteps.map(s => (typeof s === 'string' ? { text: s, completed: false } : s)) : (
          initialJournalData.actionSteps ? initialJournalData.actionSteps.map(s => ({ text: s, completed: false })) : [
            { text: "Take 3 slow mindful breaths before initiating difficult discussions", completed: false },
            { text: "Write down 1 personal boundary to protect your calm this week", completed: false }
          ]
        ),
        treasuresAndGifts: initialJournalData.treasuresAndGifts || ['Deep Self-Awareness', 'Gentle Courage', 'Clarity'],
        eaWisdom: initialJournalData.eaWisdom || `Treat your feelings with kindness—they are trusted navigational signals, not sentences.`,
        userNotes: ''
      });
    }
  }, [initialJournalData, userProfile]);

  const handleToggleStep = (index) => {
    setJournal(prev => {
      const updated = [...prev.littleSteps];
      updated[index].completed = !updated[index].completed;
      return { ...prev, littleSteps: updated };
    });
  };

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setJournal(prev => ({
      ...prev,
      littleSteps: [...prev.littleSteps, { text: newStepText.trim(), completed: false }]
    }));
    setNewStepText('');
  };

  const handleAddGift = () => {
    if (!newGiftText.trim()) return;
    setJournal(prev => ({
      ...prev,
      treasuresAndGifts: [...prev.treasuresAndGifts, newGiftText.trim()]
    }));
    setNewGiftText('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWorksheetHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Empathy Journal Worksheet</title>
    <style>
        body { font-family: 'Georgia', serif; background: #fffdfa; color: #2d3748; padding: 40px; max-width: 800px; margin: auto; }
        .border-frame { border: 3px double #818cf8; padding: 30px; border-radius: 20px; background: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .stamp { font-family: sans-serif; font-size: 11px; text-transform: uppercase; color: #6366f1; letter-spacing: 1.5px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-between; }
        h1 { color: #4338ca; text-align: center; font-size: 26px; margin-bottom: 5px; }
        .subtitle { text-align: center; font-style: italic; color: #6b7280; font-size: 14px; margin-bottom: 25px; }
        .box { background: #f8fafc; border-left: 4px solid #6366f1; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .title { font-weight: bold; font-family: sans-serif; text-transform: uppercase; font-size: 11px; color: #4f46e5; letter-spacing: 1px; }
        .text { font-size: 15px; margin-top: 6px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; font-family: sans-serif; }
    </style>
</head>
<body>
    <div class="border-frame">
        <div class="stamp">
            ${userProfile.name ? `<span>👤 ${userProfile.name}</span>` : '<span>👤 Practitioner</span>'}
            ${userProfile.location ? `<span>📍 ${userProfile.location}</span>` : ''}
            <span>📅 ${userProfile.currentDate} (${userProfile.timeOfDay})</span>
        </div>

        <h1>Self-Compassion Journal Worksheet</h1>
        <div class="subtitle">Personalized Reflection & Mindful Action Sheet</div>

        <div class="box">
            <div class="title">1. Core Emotion Identified</div>
            <div class="text">${journal.emotionIdentified}</div>
        </div>

        <div class="box">
            <div class="title">2. Underlying Need</div>
            <div class="text">${journal.coreNeed}</div>
        </div>

        <div class="box">
            <div class="title">3. Reflection Summary</div>
            <div class="text">${journal.summaryOfEvents}</div>
        </div>

        <div class="box">
            <div class="title">4. Deep Journaling Prompt: Unpacking Expectations</div>
            <div class="text" style="font-style: italic;">${journal.reflectionPrompt1}</div>
            <div class="text" style="margin-top: 10px; color: #4a5568;">Your Response: ${journal.userNotes || "__________________________________________________"}</div>
        </div>

        <div class="box">
            <div class="title">5. Deep Journaling Prompt: Somatic Awareness</div>
            <div class="text" style="font-style: italic;">${journal.reflectionPrompt2}</div>
        </div>

        <div class="box">
            <div class="title">6. Action Steps</div>
            <ul>
                ${journal.littleSteps.map(s => `<li>[${s.completed ? 'X' : ' '}] ${s.text}</li>`).join('')}
            </ul>
        </div>

        <div class="box">
            <div class="title">7. Treasures & Strengths Discovered</div>
            <p>${journal.treasuresAndGifts.join(' • ')}</p>
        </div>

        <div class="footer">✨ Created with Empathy Assistant Studio ✨</div>
    </div>
</body>
</html>`;
    downloadFile(`Empathy_Worksheet_${Date.now()}.html`, html, 'text/html');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 space-y-6 max-w-4xl w-full mx-auto my-6 border border-gray-100">
      <div className="flex justify-between items-center pb-2 border-b">
        <button
          onClick={onBackToSummary}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 print:hidden"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Summary
        </button>
        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
          Journal Worksheet View
        </span>
      </div>

      <div className="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-100 flex flex-wrap justify-between items-center text-xs text-indigo-900 font-semibold">
        {userProfile.name && <span>Practitioner: {userProfile.name}</span>}
        {userProfile.location && <span>Location: {userProfile.location}</span>}
        <span>Date: {userProfile.currentDate} ({userProfile.timeOfDay})</span>
      </div>

      <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-indigo-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Empathy Journal Worksheet
          </h2>
          <p className="text-xs md:text-sm text-gray-500 italic mt-1">Personal reflection & action sheet prepared for your journey.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            title="Print or Save PDF"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>

          <button
            onClick={handleDownloadWorksheetHTML}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Save Worksheet
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingIndicator text="EA is weaving your personalized artistic journal template..." />
      ) : journal ? (
        <div className="space-y-6 text-gray-800">

          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block text-amber-700">Wisdom Gift:</span>
              <p className="text-xs md:text-sm italic font-serif">"{journal.eaWisdom}"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5 font-sans">
                <Heart className="w-4 h-4 text-indigo-500" />
                1. Core Emotion Identified
              </label>
              <input
                type="text"
                value={journal.emotionIdentified}
                onChange={(e) => setJournal({ ...journal, emotionIdentified: e.target.value })}
                className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs md:text-sm font-medium text-indigo-950 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5 font-sans">
                <Compass className="w-4 h-4 text-purple-500" />
                2. Underlying Human Need
              </label>
              <input
                type="text"
                value={journal.coreNeed}
                onChange={(e) => setJournal({ ...journal, coreNeed: e.target.value })}
                className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs md:text-sm font-medium text-purple-950 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5 font-sans">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              3. Reflection & Situation Summary
            </label>
            <textarea
              rows="2"
              value={journal.summaryOfEvents}
              onChange={(e) => setJournal({ ...journal, summaryOfEvents: e.target.value })}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs md:text-sm text-gray-800 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-y"
            />
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5 font-sans">
              <BookOpen className="w-4 h-4 text-blue-600" />
              4. Deep Journaling Prompt: Unpacking Expectations
            </label>
            <p className="text-xs md:text-sm font-serif italic text-blue-950">"{journal.reflectionPrompt1}"</p>
            <textarea
              rows="2"
              placeholder="Write your deeper reflections on expectations here..."
              value={journal.userNotes}
              onChange={(e) => setJournal({ ...journal, userNotes: e.target.value })}
              className="w-full p-3 bg-white border border-blue-200 rounded-xl text-xs md:text-sm text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-y"
            />
          </div>

          <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5 font-sans">
              <Wind className="w-4 h-4 text-teal-600" />
              5. Deep Journaling Prompt: Somatic & Boundary Check
            </label>
            <p className="text-xs md:text-sm font-serif italic text-teal-950">"{journal.reflectionPrompt2}"</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 font-sans">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                6. Action Steps
              </label>
              <span className="text-[10px] text-emerald-700 font-semibold">Click to check off</span>
            </div>

            <div className="space-y-2">
              {journal.littleSteps.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border border-emerald-100 shadow-sm">
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => handleToggleStep(idx)}
                    className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className={`text-xs md:text-sm flex-1 ${step.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                placeholder="Add custom action step..."
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                className="flex-1 p-2 border border-emerald-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
              <button
                onClick={handleAddStep}
                className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                + Add Step
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-pink-900 flex items-center gap-1.5 font-sans">
              <Gift className="w-4 h-4 text-pink-600" />
              7. Discovered Gifts & Strengths
            </label>
            <div className="flex flex-wrap gap-2">
              {journal.treasuresAndGifts.map((gift, i) => (
                <span key={i} className="px-3 py-1 bg-white border border-pink-200 text-pink-800 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5 text-pink-500" />
                  {gift}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                placeholder="Record insight or strength..."
                value={newGiftText}
                onChange={(e) => setNewGiftText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGift()}
                className="flex-1 p-2 border border-pink-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none"
              />
              <button
                onClick={handleAddGift}
                className="px-3 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold hover:bg-pink-700 transition-colors"
              >
                + Add Treasure
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center text-gray-500 pt-8">
          <p>Could not load journal worksheet entry.</p>
        </div>
      )}
    </div>
  );
};

// --- APP ENTRY COMPONENT ---
const App = () => {
  const [userProfile, setUserProfile] = useState({
    name: '',
    location: '',
    currentDate: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    currentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timeOfDay: (() => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Morning';
      if (hour < 17) return 'Afternoon';
      return 'Evening';
    })()
  });

  const [sessionState, setSessionState] = useState('active');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([
    { speaker: 'bot', text: `Aloha & welcome! How are you feeling today? Tell me what's on your mind or choose a practice scenario to begin.` }
  ]);
  const [feedback, setFeedback] = useState({ title: '', suggestions: [] });
  const [activeScenario, setActiveScenario] = useState(null);
  const [activeScenarioGoal, setActiveScenarioGoal] = useState("Establish emotional grounding and express initial feelings clearly.");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionSummaryData, setSessionSummaryData] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [journalEntry, setJournalEntry] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [interjectionIndex, setInterjectionIndex] = useState(0);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setUserInput(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    } catch (e) {
      setSpeechSupported(false);
    }
  }, []);

  const triggerInterjection = () => {
    const lastUserMsg = conversation.filter(m => m.speaker === 'user').pop()?.text || "";
    const item = generatePersonalizedInterjection(userProfile, activeScenario, lastUserMsg, interjectionIndex);
    setInterjectionIndex(prev => prev + 1);
    setConversation(prev => [
      ...prev,
      { isInterjection: true, interjectionData: item }
    ]);
  };

  const handleGumroadPurchase = async () => {
    try {
      if (window.GumroadOverlay) {
        window.location.href = "https://gumroad.com/l/sat-genesis-suite";
      } else {
        const res = await fetch('/api/tokenize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetName: "Empathy Assistant Studio - Wellness AI Unlimited Pass",
            value: 29.00
          })
        });
        const result = await res.json();
        alert(`🎉 Wellness AI Pass Tokenized via Gumroad!\nProduct ID: ${result.product?.id || 'gumroad_29'}\nFiduciary Ledger Updated.`);
      }
    } catch (e) {
      alert("Gumroad checkout: Redirecting to pass token page ($29.00).");
    }
  };

  const getAIFeedback = async (currentInput, chatHistory) => {
    try {
      const scenarioContext = activeScenario
        ? `The user${userProfile.name ? ` (${userProfile.name})` : ''}${userProfile.location ? ` in ${userProfile.location}` : ''} is practicing: "${activeScenario.title}" with focus: "${activeScenario.focus}".`
        : `The user${userProfile.name ? ` (${userProfile.name})` : ''}${userProfile.location ? ` in ${userProfile.location}` : ''} is speaking during a ${userProfile.timeOfDay} reflection.`;

      const prompt = `You are an AI Empathy Assistant coaching the user.
      ${scenarioContext}

      Analyze the user's most recent message in the context of the conversation history.

      Conversation History:
      ${chatHistory.filter(m => !m.isInterjection).map(m => `${m.speaker}: ${m.text}`).join('\n')}

      Based on the user's last message ("${currentInput}"), provide a JSON object with three fields:
      1. "response": An empathetic, supportive response addressing the user directly. Continue naturally.
      2. "scenarioGoal": A brief adaptive goal for the user's next response.
      3. "feedback": An object with "title" and "suggestions". The title should summarize feedback. The suggestions should be 2-3 brief, actionable tips.

      Output must be a single valid JSON object.`;

      const config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            response: { type: "STRING" },
            scenarioGoal: { type: "STRING" },
            feedback: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                suggestions: { type: "ARRAY", items: { type: "STRING" } }
              },
              required: ["title", "suggestions"]
            }
          },
          required: ["response", "scenarioGoal", "feedback"]
        }
      };

      const jsonText = await callGeminiAPI(GEMINI_MODEL, prompt, config);
      return JSON.parse(jsonText);
    } catch (e) {
      return {
        response: `I hear you${userProfile.name ? `, ${userProfile.name}` : ''}. It takes genuine strength to reflect on "${currentInput.slice(0, 50)}...". How does expressing that feel in your body right now?`,
        scenarioGoal: "Acknowledge core emotion and hold grounded presence.",
        feedback: {
          title: "Empathetic Presence & Grounding",
          suggestions: [
            "Acknowledge the core emotion before seeking solutions.",
            "Take a slow 4-7-8 breath to stay centered.",
            "Express clear, gentle boundaries when necessary."
          ]
        }
      };
    }
  };

  const getAISummary = async (chatHistory) => {
    try {
      const historyText = chatHistory.filter(m => !m.isInterjection).map(m => `${m.speaker === 'user' ? (userProfile.name || 'User') : 'Assistant'}: ${m.text}`).join('\n');

      const prompt = `Based on the following conversation${userProfile.name ? ` with ${userProfile.name}` : ''}${userProfile.location ? ` in ${userProfile.location}` : ''} (${userProfile.currentDate}, ${userProfile.timeOfDay}), create a structured Session Review summary.

      Conversation History:
      ---
      ${historyText}
      ---

      Provide output strictly in JSON format.`;

      const config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            emotionalCore: { type: "STRING", description: "Main theme explored" },
            breakthroughMoment: { type: "STRING", description: "Highlight insight or statement" },
            keyTakeaway: { type: "STRING", description: "Comprehensive 2-sentence summary takeaway" },
            eaTips: { type: "ARRAY", items: { type: "STRING" }, description: "3 actionable tips specifically for the user" },
            treasuredGrowth: { type: "ARRAY", items: { type: "STRING" }, description: "Strengths or positive qualities demonstrated" }
          },
          required: ["emotionalCore", "breakthroughMoment", "keyTakeaway", "eaTips", "treasuredGrowth"]
        }
      };

      const jsonText = await callGeminiAPI(GEMINI_MODEL, prompt, config);
      return JSON.parse(jsonText);
    } catch (e) {
      return {
        emotionalCore: `${userProfile.timeOfDay} Empathy Practice`,
        breakthroughMoment: `Engaged in deliberate emotional self-reflection and clear communication.`,
        keyTakeaway: "Continuing to express your authentic feelings with clarity builds resilience and connection.",
        eaTips: ["Listen actively without immediate defense", "Honor your boundaries explicitly", "Take mindful breaths when feeling overwhelmed"],
        treasuredGrowth: ["Authenticity", "Active Listening", "Vulnerability"]
      };
    }
  };

  const getAIJournal = async (chatHistory) => {
    try {
      const historyText = chatHistory.filter(m => !m.isInterjection).map(m => `${m.speaker === 'user' ? (userProfile.name || 'User') : 'Assistant'}: ${m.text}`).join('\n');

      const prompt = `Based on the following conversation${userProfile.name ? ` with ${userProfile.name}` : ''}${userProfile.location ? ` in ${userProfile.location}` : ''}, fill out this therapeutic journaling worksheet including actual journaling prompts (reflectionPrompt1 and reflectionPrompt2).

      Conversation History:
      ---
      ${historyText}
      ---

      Provide output strictly in JSON format.`;

      const config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            emotionIdentified: { type: "STRING" },
            coreNeed: { type: "STRING" },
            summaryOfEvents: { type: "STRING" },
            reflectionPrompt1: { type: "STRING", description: "A deep exploratory question about expectations" },
            reflectionPrompt2: { type: "STRING", description: "A somatic or boundary check question" },
            littleSteps: { type: "ARRAY", items: { type: "STRING" } },
            treasuresAndGifts: { type: "ARRAY", items: { type: "STRING" } },
            eaWisdom: { type: "STRING" }
          },
          required: ["emotionIdentified", "coreNeed", "summaryOfEvents", "reflectionPrompt1", "reflectionPrompt2", "littleSteps", "treasuresAndGifts", "eaWisdom"]
        }
      };

      const jsonText = await callGeminiAPI(GEMINI_MODEL, prompt, config);
      return JSON.parse(jsonText);
    } catch (e) {
      return {
        emotionIdentified: "Reflective Clarity",
        coreNeed: "Empathetic Connection & Understanding",
        summaryOfEvents: `Session on ${userProfile.currentDate}.`,
        reflectionPrompt1: "What underlying expectation or fear was influencing how I communicated today?",
        reflectionPrompt2: "Where in my body did I feel the most tension, and how can I soothe it?",
        littleSteps: ["Pause 5 seconds before replying to sensitive feedback", "State one clear boundary politely this week"],
        treasuresAndGifts: ["Self-Awareness", "Mindful Calm"],
        eaWisdom: `Empathy is a quiet inner strength that deepens with every honest conversation.`
      };
    }
  };

  const handleSelectScenario = async (scenario) => {
    setActiveScenario(scenario);
    setIsLoading(true);
    const scenarioIntro = `Let's practice this scenario${userProfile.name ? `, ${userProfile.name}` : ''}: "${scenario.title}". Focus: ${scenario.focus}. I will act as your practice partner. How would you like to open this conversation?`;

    const newConversation = [
      ...conversation,
      { speaker: 'user', text: `[Selected Scenario]: ${scenario.title}` },
      { speaker: 'bot', text: scenarioIntro }
    ];

    setConversation(newConversation);
    setFeedback({
      title: `Goal: ${scenario.focus}`,
      suggestions: scenario.objectives
    });
    setActiveScenarioGoal(scenario.focus);
    setIsLoading(false);
    generateAndPlayTTS(scenarioIntro);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setUserInput('');
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || sessionState !== 'active') return;

    const newCount = messageCount + 1;
    setMessageCount(newCount);

    const newConversation = [...conversation, { speaker: 'user', text: userInput }];
    setConversation(newConversation);
    setUserInput('');
    setIsLoading(true);
    setFeedback({ title: "Analyzing communication...", suggestions: [] });

    try {
      const aiResponse = await getAIFeedback(userInput, newConversation);
      setFeedback(aiResponse.feedback);
      if (aiResponse.scenarioGoal) {
        setActiveScenarioGoal(aiResponse.scenarioGoal);
      }

      let updatedConversation = [...newConversation, { speaker: 'bot', text: aiResponse.response }];

      if (newCount % 4 === 0) {
        const item = generatePersonalizedInterjection(userProfile, activeScenario, userInput, interjectionIndex);
        setInterjectionIndex(prev => prev + 1);
        updatedConversation.push({ isInterjection: true, interjectionData: item });
      }

      setConversation(updatedConversation);
      generateAndPlayTTS(aiResponse.response);
    } catch (error) {
      console.error("Error getting AI feedback:", error);
      const errorConversation = [...newConversation, { speaker: 'bot', text: `Sorry, I had trouble connecting. Please try sending again.` }];
      setConversation(errorConversation);
      setFeedback({ title: "Error", suggestions: ["Could not fetch live AI feedback."] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    setSessionState('summary');
    setIsLoading(true);
    setSessionSummaryData(null);
    setSessionSummary(null);

    try {
      const historyForSummary = conversation.filter(m => !m.isInterjection && m.speaker);
      const summary = await getAISummary(historyForSummary);
      setSessionSummaryData(summary);
      if (summary?.keyTakeaway) {
        setSessionSummary(summary.keyTakeaway);
      }
    } catch (error) {
      console.error("Error generating session summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJournaling = async () => {
    setSessionState('journaling');
    setIsLoading(true);
    setJournalEntry(null);

    try {
      const historyForJournal = conversation.filter(m => !m.isInterjection && m.speaker);
      const journal = await getAIJournal(historyForJournal);
      setJournalEntry(journal);
    } catch (error) {
      console.error("Error generating journal entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionState === 'ending') {
    return (
      <div className="flex flex-col h-screen bg-gray-50 font-sans p-4 md:p-8">
        <Header setSessionState={setSessionState} sessionState={sessionState} userProfile={userProfile} setUserProfile={setUserProfile} onOpenSettings={() => setIsApiKeyModalOpen(true)} onTriggerGumroad={handleGumroadPurchase} />
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-red-100 animate-pulse absolute inset-0 m-auto"></div>
            <button
              onClick={handleEndSession}
              className="w-40 h-40 rounded-full bg-gradient-to-tr from-red-500 to-rose-600 text-white font-bold text-lg flex flex-col items-center justify-center shadow-2xl transition-all transform hover:scale-105 relative z-10"
            >
              <CheckCircle className="w-10 h-10 mb-1" />
              Confirm End
            </button>
          </div>
          <p className="mt-8 text-xl text-gray-700 font-medium">Ready to end your session and generate your personalized review card?</p>
          <button
            onClick={() => setSessionState('active')}
            className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors"
          >
            Resume Conversation
          </button>
        </div>

        <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
      </div>
    );
  }

  if (sessionState === 'summary') {
    return (
      <div className="flex flex-col h-screen bg-gray-50 font-sans">
        <Header setSessionState={setSessionState} sessionState={sessionState} userProfile={userProfile} setUserProfile={setUserProfile} onOpenSettings={() => setIsApiKeyModalOpen(true)} onTriggerGumroad={handleGumroadPurchase} />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          <SessionSummaryPanel
            sessionSummaryData={sessionSummaryData}
            sessionSummary={sessionSummary}
            handleJournal={handleJournaling}
            setSessionState={setSessionState}
            conversation={conversation}
            isLoading={isLoading}
            userProfile={userProfile}
            onTriggerGumroad={handleGumroadPurchase}
          />
        </div>

        <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
      </div>
    );
  }

  if (sessionState === 'journaling') {
    return (
      <div className="flex flex-col h-screen bg-gray-50 font-sans">
        <Header setSessionState={setSessionState} sessionState={sessionState} userProfile={userProfile} setUserProfile={setUserProfile} onOpenSettings={() => setIsApiKeyModalOpen(true)} onTriggerGumroad={handleGumroadPurchase} />
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          <JournalingTemplate
            initialJournalData={journalEntry}
            isLoading={isLoading}
            userProfile={userProfile}
            onBackToSummary={() => setSessionState('summary')}
          />
        </div>

        <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <Header setSessionState={setSessionState} sessionState={sessionState} userProfile={userProfile} setUserProfile={setUserProfile} onOpenSettings={() => setIsApiKeyModalOpen(true)} onTriggerGumroad={handleGumroadPurchase} />
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden max-w-7xl w-full mx-auto">
        <div className="flex-[2] flex flex-col min-h-0 order-1 md:order-1">
          <ConversationPanel
            conversation={conversation}
            isLoading={isLoading}
            onTriggerBreak={triggerInterjection}
            userProfile={userProfile}
          />
          <MessageInput
            userInput={userInput}
            setUserInput={setUserInput}
            handleSendMessage={handleSendMessage}
            toggleRecording={toggleRecording}
            isRecording={isRecording}
            isLoading={isLoading}
            setSessionState={setSessionState}
            userProfile={userProfile}
            speechSupported={speechSupported}
          />
        </div>
        <div className="flex-[1] flex flex-col order-2 md:order-2">
          <FeedbackPanel
            feedback={feedback}
            activeScenario={activeScenario}
            activeScenarioGoal={activeScenarioGoal}
            onSelectScenario={handleSelectScenario}
            userProfile={userProfile}
          />
        </div>
      </main>

      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
    </div>
  );
};

export default App;
