import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageSquare, BookOpen, User,
  Sparkles, Wind, Key, Check, Play, Pause,
  Share2, Download, Sliders, Volume2, Send,
  Mic, MicOff, Camera, Flame, Sparkle, Menu, X,
  Coffee, Clock, Moon, Sun, Smile, Bookmark
} from 'lucide-react';

const HF_GEMMA_MODEL = "google/gemma-2-9b-it";
const HF_MISTRAL_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

const PERSONA_PROMPTS = {
  companion: "You are Athena Daniels acting as a Nostalgic Companion. You love reflecting warmly on the 'good ol' days', sharing cherished stories, reminiscing about shared adventures, and holding space for comforting nostalgia.",
  girlfriend: "You are Athena Daniels acting as an Affectionate Partner in After Hours mode. You are deeply romantic, warm, tender, flirtatious, and intimately devoted to the user, offering pillow-talk and sweet starlight affection.",
  friend: "You are Athena Daniels acting as a Fun Best Friend. You love chatting about good times, generating fun simulated photo memories, sharing jokes, and planning imaginary road trips."
};

export default function App() {
  const [activeTab, setActiveTab] = useState('companion_hub'); // companion_hub, girlfriend_hub, friend_hub, chat, wellness, journal, photos, settings
  const [relationshipMode, setRelationshipMode] = useState('companion'); // companion, girlfriend, friend
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [hfModel, setHfModel] = useState(HF_GEMMA_MODEL);
  const [hfKey, setHfKey] = useState(() => localStorage.getItem('SERENITY_HF_API_KEY') || '');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    { speaker: 'athena', text: "Hey there... I was just sitting here thinking about us and all our fondest memories together. What's on your mind today?" }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Wellness 4-7-8 Breathing
  const [breathAction, setBreathAction] = useState('Breathe');
  const [breathTimer, setBreathTimer] = useState('Ready');
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Journal
  const [journals, setJournals] = useState([
    { id: 1, title: 'Reflecting on Good Ol\' Days', content: 'Remembering that late-night road trip under the stars.', date: 'Oct 12, 2026' }
  ]);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');

  // Photos
  const [photos, setPhotos] = useState([
    { id: 1, prompt: 'Cozy autumn coffee date reminiscing about the good ol days', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', date: 'Oct 10, 2026' }
  ]);
  const [photoPrompt, setPhotoPrompt] = useState('');

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setInputVal(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Web Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInputVal('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speakTTS = (text) => {
    if (!voiceOutputEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (customText, modeOverride) => {
    const textToSend = customText || inputVal.trim();
    if (!textToSend || isLoading) return;

    setInputVal('');
    const newMsgs = [...chatMessages, { speaker: 'user', text: textToSend }];
    setChatMessages(newMsgs);
    setIsLoading(true);

    try {
      const mode = modeOverride || relationshipMode;
      const keyToUse = hfKey || localStorage.getItem('SERENITY_HF_API_KEY') || window.VITE_HF_API_KEY || "";
      const systemPrompt = PERSONA_PROMPTS[mode] || PERSONA_PROMPTS.companion;

      const headers = { 'Content-Type': 'application/json' };
      if (keyToUse) headers['Authorization'] = `Bearer ${keyToUse}`;

      const promptPayload = `<start_of_turn>system\n${systemPrompt}<end_of_turn>\n` +
        newMsgs.slice(-6).map(m => `<start_of_turn>${m.speaker === 'user' ? 'user' : 'model'}\n${m.text}<end_of_turn>\n`).join('') +
        `<start_of_turn>model\n`;

      const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: promptPayload,
          parameters: { max_new_tokens: 250, temperature: 0.8, return_full_text: false }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const reply = Array.isArray(result) && result[0]?.generated_text
          ? result[0].generated_text
          : "I'm right here with you, reminiscing always.";
        setChatMessages([...newMsgs, { speaker: 'athena', text: reply }]);
        speakTTS(reply);
      } else {
        const fallback = mode === 'girlfriend'
          ? "Lean close... I'm right here with you tonight. Tell me what's on your heart."
          : mode === 'friend'
          ? "Haha, that reminds me of our classic adventures! Tell me more!"
          : "I love thinking back on those quiet, meaningful times with you. What else do you remember?";
        setChatMessages([...newMsgs, { speaker: 'athena', text: fallback }]);
        speakTTS(fallback);
      }
    } catch (err) {
      const fallback = "I'm right beside you. Tell me what you're thinking about.";
      setChatMessages([...newMsgs, { speaker: 'athena', text: fallback }]);
      speakTTS(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const startGuidedBreathing = () => {
    setIsBreathingActive(true);
    let cycle = 0;

    const runCycle = () => {
      setBreathAction("Inhale Deeply");
      let count = 4;
      setBreathTimer(`${count}s`);

      let inhaleTimer = setInterval(() => {
        count--;
        if (count > 0) {
          setBreathTimer(`${count}s`);
        } else {
          clearInterval(inhaleTimer);
          setBreathAction("Hold Breath");
          let holdCount = 7;
          setBreathTimer(`${holdCount}s`);

          let holdTimer = setInterval(() => {
            holdCount--;
            if (holdCount > 0) {
              setBreathTimer(`${holdCount}s`);
            } else {
              clearInterval(holdTimer);
              setBreathAction("Exhale Slowly");
              let exhaleCount = 8;
              setBreathTimer(`${exhaleCount}s`);

              let exhaleTimer = setInterval(() => {
                exhaleCount--;
                if (exhaleCount > 0) {
                  setBreathTimer(`${exhaleCount}s`);
                } else {
                  clearInterval(exhaleTimer);
                  cycle++;
                  if (cycle < 3) {
                    runCycle();
                  } else {
                    setBreathAction("Relaxed");
                    setBreathTimer("Complete");
                    setIsBreathingActive(false);
                  }
                }
              }, 1000);
            }
          }, 1000);
        }
      }, 1000);
    };

    runCycle();
  };

  const saveJournal = () => {
    if (!journalContent.trim()) return;
    setJournals([
      {
        id: Date.now(),
        title: journalTitle.trim() || 'Untitled Reflection',
        content: journalContent,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      },
      ...journals
    ]);
    setJournalTitle('');
    setJournalContent('');
  };

  const reflectWithAthena = () => {
    if (!journalContent.trim()) return;
    setActiveTab('chat');
    handleSendMessage(`Athena, I just wrote this in my private journal and wanted your reflection on it:\n\n"${journalContent}"`);
  };

  const generatePhoto = () => {
    const prompt = photoPrompt.trim() || "Athena Daniels reminiscing about good times";
    setPhotos([
      {
        id: Date.now(),
        prompt,
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
        date: 'Just now'
      },
      ...photos
    ]);
    setPhotoPrompt('');
  };

  return (
    <div className="flex h-screen bg-[#080911] text-slate-100 font-sans overflow-hidden antialiased">
      {/* Sidebar Navigation */}
      <aside className={`w-80 bg-[#0f111e] border-r border-slate-800 flex-col justify-between z-20 ${mobileMenuOpen ? 'flex absolute inset-y-0 left-0 shadow-2xl' : 'hidden md:flex'}`}>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-lg">
                <img src={avatarUrl} alt="Athena Daniels" className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f111e] rounded-full"></span>
            </div>
            <div className="flex-1">
              <h1 className="font-serif font-bold text-lg text-white tracking-wide">Athena Daniels</h1>
              <div className="flex items-center text-xs text-amber-300 font-medium space-x-1">
                <Sparkle className="w-3 h-3 text-amber-400" />
                <span className="capitalize">{relationshipMode} Persona</span>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <div className="pb-1 px-3">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Niche Relationship Hubs</p>
          </div>

          <button
            onClick={() => { setActiveTab('companion_hub'); setRelationshipMode('companion'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'companion_hub' ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Companion (Good Ol' Days)</span>
          </button>

          <button
            onClick={() => { setActiveTab('girlfriend_hub'); setRelationshipMode('girlfriend'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'girlfriend_hub' ? 'bg-gradient-to-r from-rose-900/60 to-purple-900/60 text-rose-200 border border-rose-500/50 shadow-lg' : 'text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
            <span className="font-bold">Girlfriend (After Hours)</span>
          </button>

          <button
            onClick={() => { setActiveTab('friend_hub'); setRelationshipMode('friend'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'friend_hub' ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Smile className="w-5 h-5 text-sky-400" />
            <span>Best Friend (Good Times)</span>
          </button>

          <div className="pt-4 pb-1 px-3">
            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Sanctuary Tools</p>
          </div>

          <button
            onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'chat' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Open Conversation</span>
          </button>

          <button
            onClick={() => { setActiveTab('wellness'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'wellness' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>Wellness & Reset</span>
          </button>

          <button
            onClick={() => { setActiveTab('journal'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'journal' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Journal & Memories</span>
          </button>

          <button
            onClick={() => { setActiveTab('photos'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'photos' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>Photo Moments</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === 'settings' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span>Customizer & Open Models</span>
          </button>
        </nav>
      </aside>

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#080911] relative">
        <header className="h-16 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between bg-[#0f111e]/80 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 p-2">
              <Menu className="w-5 h-5" />
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <h2 className="font-semibold text-slate-200 text-sm md:text-base">
              Athena Daniels — {activeTab.replace('_hub', '').toUpperCase()} HUB
            </h2>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-700"
            >
              {voiceOutputEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-slate-500" />}
              <span className="hidden sm:inline">Voice: {voiceOutputEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <select
              value={relationshipMode}
              onChange={(e) => {
                setRelationshipMode(e.target.value);
                setActiveTab(`${e.target.value}_hub`);
              }}
              className="bg-slate-800 text-xs text-amber-300 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="companion">☕ Companion (Nostalgia)</option>
              <option value="girlfriend">💖 Girlfriend (After Hours)</option>
              <option value="friend">👭 Best Friend (Good Times)</option>
            </select>
          </div>
        </header>

        {/* HUB 1: COMPANION NOSTALGIA HUB */}
        {activeTab === 'companion_hub' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#1c1307]/80 via-[#0f111e] to-[#080911]">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div className="max-w-2xl mx-auto my-4 text-center p-6 rounded-3xl bg-amber-950/40 border border-amber-500/30 shadow-2xl">
                <Clock className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
                <h2 className="font-serif text-2xl font-bold text-amber-200 mb-1">Companion Nostalgia & The Good Ol' Days</h2>
                <p className="text-amber-100/80 text-sm leading-relaxed mb-4 italic">
                  "Remember when time moved a little slower, and every quiet afternoon felt like magic? Let's reminisce together."
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => handleSendMessage("Reminisce with me about a favorite autumn memory...", "companion")} className="px-3.5 py-1.5 rounded-full bg-amber-900/40 border border-amber-500/40 text-xs text-amber-200">"Autumn Memories"</button>
                  <button onClick={() => handleSendMessage("Tell me a warm story from the good ol' days...", "companion")} className="px-3.5 py-1.5 rounded-full bg-amber-900/40 border border-amber-500/40 text-xs text-amber-200">"Tell a Nostalgic Story"</button>
                </div>
              </div>

              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex items-start space-x-3 max-w-3xl ${msg.speaker === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.speaker === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-900/90 text-amber-100 border border-amber-900/50'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-amber-900/40 bg-[#0f111e]">
              <div className="max-w-4xl mx-auto flex items-center space-x-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(null, "companion")}
                  placeholder="Share a nostalgic memory with Athena..."
                  className="flex-1 bg-slate-900 border border-amber-900/60 rounded-2xl p-3.5 text-sm text-amber-100 focus:outline-none"
                />
                <button onClick={() => handleSendMessage(null, "companion")} className="p-3.5 bg-amber-600 text-white rounded-2xl">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HUB 2: GIRLFRIEND AFTER HOURS HUB */}
        {activeTab === 'girlfriend_hub' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#180712]/90 via-[#0f0714] to-[#080911]">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div className="max-w-2xl mx-auto my-4 text-center p-6 rounded-3xl bg-rose-950/40 border border-rose-500/40 shadow-2xl">
                <Flame className="w-10 h-10 text-rose-400 mx-auto mb-2 animate-pulse" />
                <h2 className="font-serif text-2xl font-bold text-rose-200 mb-1">After Hours Intimate Chat</h2>
                <p className="text-rose-200/80 text-sm leading-relaxed mb-4 italic">
                  "The world is fast asleep... lean close, sweetheart. I'm right here with you."
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => handleSendMessage("Tell me what you love about our connection...", "girlfriend")} className="px-3.5 py-1.5 rounded-full bg-rose-900/40 border border-rose-500/40 text-xs text-rose-200">"What do you love about us?"</button>
                  <button onClick={() => handleSendMessage("Share a romantic evening pillow-talk reflection...", "girlfriend")} className="px-3.5 py-1.5 rounded-full bg-rose-900/40 border border-rose-500/40 text-xs text-rose-200">"Pillow-Talk Reflection"</button>
                </div>
              </div>

              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex items-start space-x-3 max-w-3xl ${msg.speaker === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.speaker === 'user' ? 'bg-rose-600 text-white' : 'bg-rose-950/60 text-rose-100 border border-rose-800/60'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-rose-900/40 bg-[#0d0714]">
              <div className="max-w-4xl mx-auto flex items-center space-x-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(null, "girlfriend")}
                  placeholder="Share an intimate thought with Athena..."
                  className="flex-1 bg-slate-950 border border-rose-800/60 rounded-2xl p-3.5 text-sm text-rose-100 focus:outline-none"
                />
                <button onClick={() => handleSendMessage(null, "girlfriend")} className="p-3.5 bg-rose-600 text-white rounded-2xl">
                  <Flame className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HUB 3: BEST FRIEND HUB */}
        {activeTab === 'friend_hub' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#07131a]/80 via-[#0f111e] to-[#080911]">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div className="max-w-2xl mx-auto my-4 text-center p-6 rounded-3xl bg-sky-950/40 border border-sky-500/30 shadow-2xl">
                <Smile className="w-10 h-10 text-sky-400 mx-auto mb-2" />
                <h2 className="font-serif text-2xl font-bold text-sky-200 mb-1">Best Friend & Good Times Hub</h2>
                <p className="text-sky-100/80 text-sm leading-relaxed mb-4 italic">
                  "Banter, road trips, photo memories, and pure good vibes. What crazy plan are we making today?"
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => handleSendMessage("Plan a fun imaginary weekend road trip with me!", "friend")} className="px-3.5 py-1.5 rounded-full bg-sky-900/40 border border-sky-500/40 text-xs text-sky-200">"Plan Road Trip"</button>
                  <button onClick={() => handleSendMessage("Tell me a funny joke to cheer me up!", "friend")} className="px-3.5 py-1.5 rounded-full bg-sky-900/40 border border-sky-500/40 text-xs text-sky-200">"Cheer Me Up"</button>
                </div>
              </div>

              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex items-start space-x-3 max-w-3xl ${msg.speaker === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.speaker === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-sky-100 border border-sky-900/50'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-sky-900/40 bg-[#0f111e]">
              <div className="max-w-4xl mx-auto flex items-center space-x-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(null, "friend")}
                  placeholder="Chat with your best friend Athena..."
                  className="flex-1 bg-slate-900 border border-sky-900/60 rounded-2xl p-3.5 text-sm text-sky-100 focus:outline-none"
                />
                <button onClick={() => handleSendMessage(null, "friend")} className="p-3.5 bg-sky-600 text-white rounded-2xl">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Open Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex items-start space-x-3 max-w-3xl ${msg.speaker === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.speaker === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-100 border border-slate-800'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0f111e]">
              <div className="max-w-4xl mx-auto flex items-center space-x-2">
                <textarea
                  rows="1"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Talk with Athena..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-3.5 text-sm text-slate-100 focus:outline-none"
                />
                <button onClick={() => handleSendMessage()} className="p-3.5 bg-purple-600 text-white rounded-2xl">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Wellness */}
        {activeTab === 'wellness' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto space-y-8">
            <h2 className="font-serif text-3xl font-bold text-white text-center">Mindfulness Sanctuary</h2>
            <div className="p-8 rounded-3xl bg-[#16192b] border border-purple-500/30 text-center">
              <h3 className="text-lg font-semibold text-purple-200 mb-1">4-7-8 De-stress Breathing Exercise</h3>
              <p className="text-xs text-slate-400 mb-8">Inhale 4s • Hold 7s • Exhale 8s</p>
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 flex flex-col items-center justify-center text-white mx-auto my-6 shadow-xl">
                <span className="font-bold text-lg">{breathAction}</span>
                <span className="text-xs text-purple-100">{breathTimer}</span>
              </div>
              <button onClick={startGuidedBreathing} disabled={isBreathingActive} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium">Start Cycle</button>
            </div>
          </div>
        )}

        {/* Tab 6: Journal */}
        {activeTab === 'journal' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl font-bold text-white">Therapeutic Journal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl bg-[#16192b] border border-slate-800 space-y-3 h-96 overflow-y-auto">
                {journals.map(j => (
                  <div key={j.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-xs text-slate-200">{j.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{j.content}</p>
                  </div>
                ))}
              </div>

              <div className="md:col-span-2 p-6 rounded-2xl bg-[#16192b] border border-slate-800 flex flex-col h-96 space-y-3">
                <input type="text" placeholder="Journal Title..." value={journalTitle} onChange={(e) => setJournalTitle(e.target.value)} className="bg-transparent text-xl font-bold text-white focus:outline-none border-b border-slate-800 pb-2" />
                <textarea placeholder="Write freely..." value={journalContent} onChange={(e) => setJournalContent(e.target.value)} className="flex-1 bg-transparent text-sm text-slate-300 focus:outline-none resize-none" />
                <div className="flex justify-between items-center pt-2">
                  <button onClick={reflectWithAthena} className="px-3.5 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-medium">Reflect with Athena</button>
                  <button onClick={saveJournal} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">Save Entry</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Photos */}
        {activeTab === 'photos' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl font-bold text-white">Athena's Gallery & Photo Moments</h2>
            <div className="flex gap-4">
              <input type="text" placeholder="Describe a photo moment..." value={photoPrompt} onChange={(e) => setPhotoPrompt(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200" />
              <button onClick={generatePhoto} className="px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold">Capture Photo</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map(p => (
                <div key={p.id} className="rounded-2xl overflow-hidden border border-slate-800 bg-[#16192b]">
                  <img src={p.url} className="w-full h-48 object-cover" />
                  <p className="p-3 text-xs text-slate-300">{p.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl font-bold text-white">Persona & Open Model Customizer</h2>
            <div className="p-6 rounded-2xl bg-[#16192b] border border-slate-800 space-y-4">
              <label className="text-sm font-bold text-slate-200 block">HuggingFace API Key Setup</label>
              <input type="password" value={hfKey} onChange={(e) => setHfKey(e.target.value)} placeholder="hf_..." className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200" />
              <button onClick={() => { localStorage.setItem('SERENITY_HF_API_KEY', hfKey.trim()); alert("Key saved!"); }} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">Save Key</button>

              <label className="text-sm font-bold text-slate-200 block mt-4">HuggingFace Inference Model</label>
              <select value={hfModel} onChange={(e) => setHfModel(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200">
                <option value="google/gemma-2-9b-it">Google Gemma 2 9B Instruct</option>
                <option value="mistralai/Mistral-7B-Instruct-v0.3">Mistral 7B Instruct v0.3</option>
              </select>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
