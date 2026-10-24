import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Compass, Globe, Search, Copy, Download, Share2, RefreshCw,
  Check, X, Moon, Sun, Sliders, Palette, Key, Info,
  Award, Coins, Flame, Wand2, Ghost, Heart, Smile, Eye, Layers,
  MessageSquareText, HelpCircle, ChevronRight, Play, Filter, Zap,
  Bookmark, Send, ExternalLink, Trophy, SmilePlus, Feather
} from 'lucide-react';
import SpectraRefractionEngine from './components/SpectraRefractionEngine';

// --- SERVICE & APP CONFIGURATION ---
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const CONFIG_STORAGE_KEY = "EMOJI_EXTRAVAGANZA_SERVICE_CRED";

const encodeServiceCredential = (val) => {
  if (!val) return "";
  try {
    return btoa(encodeURIComponent(val));
  } catch (e) {
    return val;
  }
};

const decodeServiceCredential = (val) => {
  if (!val) return "";
  try {
    return decodeURIComponent(atob(val));
  } catch (e) {
    return val;
  }
};

const getAppServiceToken = () => {
  const storedEnc = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (storedEnc) {
    return decodeServiceCredential(storedEnc);
  }
  return window.VITE_GEMINI_API_KEY || "";
};

const callGeminiAPI = async (prompt, generationConfig = {}, maxRetries = 2) => {
  const token = getAppServiceToken();
  if (!token) {
    throw new Error("NO_API_KEY");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${token}`;
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
      if (attempt >= maxRetries) throw error;
      await new Promise(res => setTimeout(res, 1000 * attempt));
    }
  }
};

const safeCopyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API blocked, falling back.", err);
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
    return successful;
  } catch (err) {
    return false;
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

// --- OFFLINE DATASETS ---
const PRESET_DECIPHERS = {
  "🎃👻🕯️": {
    primarySentiment: "Nostalgic Spooky Whimsy",
    subtext: "A longing for autumn twilight, childhood Halloween memories, and cozy mysterious magic.",
    culturalContext: "Widely understood across North America and Western Europe as festive anticipation for Halloween, representing cozy spooky vibes.",
    periSensorMetrics: { arousal: 78, valence: 85, emotionalTone: "Joyful Mystery" }
  },
  "🥺👉👈": {
    primarySentiment: "Playful Vulnerability & Shy Supplication",
    subtext: "Seeking gentle validation or making a modest request with soft innocence and timid affection.",
    culturalContext: "Originated in East Asian anime subcultures (uwu culture) and popularized globally on TikTok & internet slang.",
    periSensorMetrics: { arousal: 42, valence: 68, emotionalTone: "Timid Warmth" }
  },
  "🐍🍷✨": {
    primarySentiment: "Sassy Empowerment & Unapologetic Confidence",
    subtext: "Reclaiming former gossip or drama with elegant sophistication, humor, and cosmic flair.",
    culturalContext: "Modern Western internet culture symbol for turning betrayal or drama into classy self-care.",
    periSensorMetrics: { arousal: 82, valence: 75, emotionalTone: "Sass & Elegance" }
  },
  "🌊🐚🌙": {
    primarySentiment: "Serene Oceanic Solitude",
    subtext: "A deep yearning for quiet nocturnal reflection by the sea, cleansing emotional fatigue.",
    culturalContext: "Universal symbol across coastal and island cultures representing spiritual stillness and emotional tide alignment.",
    periSensorMetrics: { arousal: 25, valence: 92, emotionalTone: "Deep Calm" }
  },
  "🍂🌧️☕": {
    primarySentiment: "Cozy Autumn Hygge",
    subtext: "Finding comfort in solitude while rainy drops patter against the window; honoring introspective warmth.",
    culturalContext: "Commonly used in Northern European and East Asian urban contexts to signify warm contentment during gloomy days.",
    periSensorMetrics: { arousal: 35, valence: 88, emotionalTone: "Quiet Comfort" }
  },
  "🧘‍♀️✨🌸": {
    primarySentiment: "Mindful Bloom & Spiritual Awakening",
    subtext: "A conscious release of external stress, embracing self-compassion and inner harmony.",
    culturalContext: "Deeply rooted in East Asian & South Asian mindfulness philosophies, adopted globally for wellness and peace.",
    periSensorMetrics: { arousal: 30, valence: 96, emotionalTone: "Inner Harmony" }
  }
};

const THEMED_LIBRARIES = [
  {
    id: 'spooky',
    title: '🎃 Spooky & Halloween',
    subtitle: 'Eerie whimsy, nocturnal magic & ghostly delight',
    items: [
      { emoji: '🎃👻🕯️', name: 'Twilight Harvest Spell', emotion: 'Nostalgic Spooky Whimsy', description: 'Cozy autumn night with glowing lanterns and playful spirits.' },
      { emoji: '🦇🔮🌙', name: 'Nocturnal Oracle', emotion: 'Mystical Intuition', description: 'Channeling midnight secrets and bat-wing magic.' },
      { emoji: '💀🥀🖤', name: 'Gothic Elegance', emotion: 'Romantic Melancholy', description: 'Honoring dark beauty and eternal memories.' },
      { emoji: '🕸️🕷️✨', name: 'Labyrinth Reverie', emotion: 'Intricate Mystery', description: 'Weaving delicate webs of cosmic thought.' },
      { emoji: '🍬👺🧟', name: 'Trick-or-Treat Chaos', emotion: 'Playful Mischief', description: 'High-energy festive fun and sweet scares.' },
      { emoji: '🧪🧟‍♀️⚡', name: 'Alchemy Awakening', emotion: 'Spark of Creation', description: 'Bringing Frankensteinian passion to new projects.' }
    ]
  },
  {
    id: 'niche',
    title: '🎭 Niche Complex States',
    subtitle: 'Hyper-specific human emotions that words struggle to capture',
    items: [
      { emoji: '🌌👁️🏙️', name: 'Sonder', emotion: 'Universal Interconnection', description: 'The sudden realization that every random passerby lives a life as vivid and complex as your own.' },
      { emoji: '🌊⛵🌅', name: 'Saudade', emotion: 'Bittersweet Nostalgia', description: 'A deep melancholic longing for an absent something or someone that is loved.' },
      { emoji: '😏😈🍿', name: 'Schadenfreude', emotion: 'Secret Amuse', description: 'Finding mischievous amusement in minor external drama.' },
      { emoji: '🌧️🍃🪵', name: 'Petrichor Bliss', emotion: 'Somatic Grounding', description: 'The soothing emotional clarity smelled right after fresh rain hits warm dry earth.' },
      { emoji: '🌸⏳🍂', name: 'Mono no Aware', emotion: 'Impermanent Grace', description: 'An empathetic awareness of the fleeting, impermanent beauty of all things.' },
      { emoji: '🔥💃🎺', name: 'Duende', emotion: 'Raw Soulful Passion', description: 'An authentic mysterious power and emotional depth that surges through art.' }
    ]
  },
  {
    id: 'spiritual',
    title: '🔮 Spiritual & Mystical',
    subtitle: 'Cosmic alignment, aura halos & sacred geometry',
    items: [
      { emoji: '🧘‍♂️🕊️🌈', name: 'Prismatic Zen', emotion: 'Transcendent Peace', description: 'Complete energetic alignment and soft heart radiance.' },
      { emoji: '👁️🪐✨', name: 'Cosmic Third Eye', emotion: 'Heightened Perception', description: 'Seeing beyond mundane illusions into planetary harmony.' },
      { emoji: '💎🪷🕯️', name: 'Lotus Sanctuary', emotion: 'Unshakeable Purity', description: 'Bloomed wisdom rising pristine out of muddy waters.' },
      { emoji: '🌕🐺🌾', name: 'Full Moon Awakening', emotion: 'Wild Liberation', description: 'Releasing suppressed instincts under the lunar glow.' },
      { emoji: '⚡🔮🛡️', name: 'Aura Shield', emotion: 'Energetic Protection', description: 'Deflecting negativity with radiant spiritual force.' }
    ]
  },
  {
    id: 'holidays',
    title: '🎄 Holidays & Festivities',
    subtitle: 'Seasonal solstice, harvest warmth & global cheer',
    items: [
      { emoji: '🕯️🎁❄️', name: 'Winter Solstice Light', emotion: 'Heartwarming Reunion', description: 'Gathering around hearth fire during snowbound evenings.' },
      { emoji: '🧧🎆🦁', name: 'Lunar Spring Renewal', emotion: 'Prosperous Vitality', description: 'Welcoming luck, health, and vibrant dragon fire.' },
      { emoji: '🪔✨🍬', name: 'Diwali Sparkler', emotion: 'Triumph of Light', description: 'Illuminating homes and minds with golden joy.' },
      { emoji: '🦃🍁🥧', name: 'Harvest Gratitude', emotion: 'Bountiful Abundance', description: 'Shared meals and deep thankfulness for life’s blessings.' }
    ]
  },
  {
    id: 'global',
    title: '🌐 Global & Cultural Expressions',
    subtitle: 'Universal Emotional Language (UEL) across continents',
    items: [
      { emoji: '🍵🎋🌸', name: 'Hanami Serenity (Japan)', emotion: 'Mindful Appreciation', description: 'Contemplative enjoyment of cherry blossoms and tea.' },
      { emoji: '💃🍇☀️', name: 'Sobremesa (LatAm / Spain)', emotion: 'Cherished Fellowship', description: 'The joyful conversation lingering around the table long after a meal.' },
      { emoji: '🛋️🔥🥐', name: 'Hygge Warmth (Nordic)', emotion: 'Cozy Belonging', description: 'Creating a warm, gentle atmosphere with loved ones.' },
      { emoji: '🧿☕🌴', name: 'Tarab & Warmth (Middle East)', emotion: 'Enraptured Hospitality', description: 'Ecstatic emotional resonance sparked by music, coffee, and warmth.' }
    ]
  }
];

const OFFLINE_TRANSLATIONS = [
  {
    textKey: "overwhelmed",
    emojiSequence: "🌊📦🤯 -> 🧘‍♀️🌿☁️",
    explanation: "Transitions from chaos and overload (waves, heavy boxes) to grounded breath (meditation, green leaves, soft clouds). Recognized universally in East Asian and Western digital communication as a reset sequence."
  },
  {
    textKey: "grateful",
    emojiSequence: "🙏✨🌸💖",
    explanation: "Cross-cultural symbol combining respectful hands (Anoop/Gassho in Asia, prayer in West) with blooming warmth and sparkles, bridging language barriers instantly."
  },
  {
    textKey: "spooky",
    emojiSequence: "🎃👻🕸️✨",
    explanation: "Playful spooky aesthetic that translates Halloween cheer without threatening undertones across international markets."
  },
  {
    textKey: "sonder",
    emojiSequence: "🌆👥🪐💭",
    explanation: "Captures the realization that every stranger has a story as deep as yours—urban sunset, passing crowds, cosmic perspective."
  },
  {
    textKey: "cozy",
    emojiSequence: "🌧️☕🧦🔥",
    explanation: "Universal Hygge representation—rain outside, hot beverage, cozy warmth, and open flame."
  }
];

// --- NICHE PRESETS FOR STUDIO ---
const STUDIO_PRESETS = [
  { id: 'sonder', name: 'Sonder', baseColor: '#8b5cf6', eyeStyle: 'starry', mouthStyle: 'oGasp', auraStyle: 'nebula', accessory: 'moon', desc: 'The realization that each random passerby lives a life as vivid as your own.' },
  { id: 'saudade', name: 'Saudade', baseColor: '#3b82f6', eyeStyle: 'cryingJoy', mouthStyle: 'calm', auraStyle: 'fog', accessory: 'coffee', desc: 'A deep melancholic longing for something or someone loved and absent.' },
  { id: 'spooky', name: 'Spooky Reverie', baseColor: '#10b981', eyeStyle: 'ghostly', mouthStyle: 'vamp', auraStyle: 'fog', accessory: 'bat', desc: 'Autumn twilight magic, eerie pumpkins, and nocturnal joy.' },
  { id: 'schadenfreude', name: 'Schadenfreude', baseColor: '#f59e0b', eyeStyle: 'suspicious', mouthStyle: 'smirk', auraStyle: 'sparkles', accessory: 'bat', desc: 'Mischievous delight in life’s minor harmless ironies.' },
  { id: 'duende', name: 'Duende', baseColor: '#ef4444', eyeStyle: 'flame', mouthStyle: 'tongue', auraStyle: 'phoenix', accessory: 'wand', desc: 'Raw soulful passion and uninhibited emotional energy.' },
  { id: 'zen', name: 'Lotus Zen', baseColor: '#ec4899', eyeStyle: 'sparkle', mouthStyle: 'smile', auraStyle: 'lotus', accessory: 'flowerCrown', desc: 'Serene spiritual bloom and unshakeable inner peace.' }
];

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('spectra'); // spectra, decipher, studio, library, translator
  const [themeMode, setThemeMode] = useState('dark');
  const [joyOrbs, setJoyOrbs] = useState(() => {
    return parseInt(localStorage.getItem('EMOJI_JOY_ORBS') || '120', 10);
  });
  const [streakDays] = useState(4);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [userCredentialVal, setUserCredentialVal] = useState(getAppServiceToken());

  // Decipher State
  const [decipherInput, setDecipherInput] = useState('🎃👻🕯️');
  const [decipherResult, setDecipherResult] = useState(PRESET_DECIPHERS["🎃👻🕯️"]);
  const [isDecipherLoading, setIsDecipherLoading] = useState(false);

  // Studio State
  const [studioBaseColor, setStudioBaseColor] = useState('#8b5cf6');
  const [studioEyeStyle, setStudioEyeStyle] = useState('starry');
  const [studioMouthStyle, setStudioMouthStyle] = useState('smile');
  const [studioAuraStyle, setStudioAuraStyle] = useState('nebula');
  const [studioAccessory, setStudioAccessory] = useState('bat');
  const [studioEmojiTitle, setStudioEmojiTitle] = useState('Cosmic Spooky Reverie');
  const [studioEmotionDescription, setStudioEmotionDescription] = useState('A hyper-personal emoji capturing autumn mystery and star-lit magic.');
  const [isStudioGenerating, setIsStudioGenerating] = useState(false);

  // Library State
  const [librarySearch, setLibrarySearch] = useState('');
  const [activeLibCategory, setActiveLibCategory] = useState('all');

  // Translator State
  const [translatorInput, setTranslatorInput] = useState('I am feeling overwhelmed by work but hopeful for the rainy weekend.');
  const [translatorRegion, setTranslatorRegion] = useState('Global Universal');
  const [translatorOutput, setTranslatorOutput] = useState(OFFLINE_TRANSLATIONS[0]);
  const [isTranslating, setIsTranslating] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const addJoyOrbs = (amount, reason) => {
    const newTotal = joyOrbs + amount;
    setJoyOrbs(newTotal);
    localStorage.setItem('EMOJI_JOY_ORBS', newTotal.toString());
    showToast(`✨ +${amount} Joy Orbs earned for ${reason}!`);
  };

  // Handle Save API Key
  const handleSaveApiKey = () => {
    const encToken = encodeServiceCredential(userCredentialVal.trim());
    localStorage.setItem(CONFIG_STORAGE_KEY, encToken);
    setIsApiKeyModalOpen(false);
    showToast('🔑 Service Token configured!');
  };

  // DECIPHER LOGIC
  const handleDecipher = async (inputSequence) => {
    const seq = inputSequence || decipherInput;
    if (!seq.trim()) return;

    setIsDecipherLoading(true);

    // Check offline presets first
    if (PRESET_DECIPHERS[seq]) {
      setTimeout(() => {
        setDecipherResult(PRESET_DECIPHERS[seq]);
        setIsDecipherLoading(false);
        addJoyOrbs(15, "Deciphering Emoji Sentiment");
      }, 400);
      return;
    }

    // Call Gemini API if key available, else generate structured fallback
    try {
      const prompt = `Analyze the emotional meaning of this emoji sequence: "${seq}".
      Provide a breakdown in JSON format with fields:
      - "primarySentiment": Short emotional title (e.g. "Playful Spookiness").
      - "subtext": 1-2 sentence breakdown of the unsaid feeling.
      - "culturalContext": How this sequence is perceived across different regions or online subcultures.
      - "periSensorMetrics": object with "arousal" (1-100), "valence" (1-100), "emotionalTone" (string).`;

      const config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            primarySentiment: { type: "STRING" },
            subtext: { type: "STRING" },
            culturalContext: { type: "STRING" },
            periSensorMetrics: {
              type: "OBJECT",
              properties: {
                arousal: { type: "NUMBER" },
                valence: { type: "NUMBER" },
                emotionalTone: { type: "STRING" }
              },
              required: ["arousal", "valence", "emotionalTone"]
            }
          },
          required: ["primarySentiment", "subtext", "culturalContext", "periSensorMetrics"]
        }
      };

      const resultText = await callGeminiAPI(prompt, config);
      const parsed = JSON.parse(resultText);
      setDecipherResult(parsed);
      addJoyOrbs(25, "Neural Emoji Deciphering");
    } catch (e) {
      // Intelligently construct fallback
      setDecipherResult({
        primarySentiment: `Custom Intuitive Sentiment (${seq})`,
        subtext: `This bespoke sequence weaves complex emotional threads blending expressiveness, subtle subtext, and personal tone.`,
        culturalContext: `Interpreted across digital communities as a multi-layered sentiment bridge.`,
        periSensorMetrics: { arousal: 65, valence: 80, emotionalTone: "Harmonious Spark" }
      });
      addJoyOrbs(15, "Offline Emoji Deciphering");
    } finally {
      setIsDecipherLoading(false);
    }
  };

  // STUDIO PRESET APPLIER
  const applyStudioPreset = (preset) => {
    setStudioBaseColor(preset.baseColor);
    setStudioEyeStyle(preset.eyeStyle);
    setStudioMouthStyle(preset.mouthStyle);
    setStudioAuraStyle(preset.auraStyle);
    setStudioAccessory(preset.accessory);
    setStudioEmojiTitle(preset.name);
    setStudioEmotionDescription(preset.desc);
    addJoyOrbs(10, `Applying '${preset.name}' Preset`);
  };

  // STUDIO AI GENERATION
  const handleAIGenerateStudio = async () => {
    setIsStudioGenerating(true);
    try {
      const prompt = `Create a unique hyper-personal emoji concept for a niche emotional state.
      Return JSON format:
      - "title": Name of the emotion (e.g. "Petrichor Euphoria").
      - "description": 1-2 sentence description of the niche feeling.
      - "baseColor": Hex code matching the mood (e.g. "#10b981").
      - "eyeStyle": One of ["sparkle", "heartEyes", "sleepy", "suspicious", "ghostly", "starry", "cryingJoy", "flame"].
      - "mouthStyle": One of ["smile", "tongue", "smirk", "pout", "oGasp", "calm", "vamp"].
      - "auraStyle": One of ["fog", "nebula", "halo", "lotus", "phoenix", "sparkles"].
      - "accessory": One of ["bat", "pumpkin", "coffee", "wand", "moon", "flowerCrown"].`;

      const config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            baseColor: { type: "STRING" },
            eyeStyle: { type: "STRING" },
            mouthStyle: { type: "STRING" },
            auraStyle: { type: "STRING" },
            accessory: { type: "STRING" }
          },
          required: ["title", "description", "baseColor", "eyeStyle", "mouthStyle", "auraStyle", "accessory"]
        }
      };

      const resText = await callGeminiAPI(prompt, config);
      const parsed = JSON.parse(resText);

      setStudioEmojiTitle(parsed.title);
      setStudioEmotionDescription(parsed.description);
      if (parsed.baseColor) setStudioBaseColor(parsed.baseColor);
      if (parsed.eyeStyle) setStudioEyeStyle(parsed.eyeStyle);
      if (parsed.mouthStyle) setStudioMouthStyle(parsed.mouthStyle);
      if (parsed.auraStyle) setStudioAuraStyle(parsed.auraStyle);
      if (parsed.accessory) setStudioAccessory(parsed.accessory);

      addJoyOrbs(30, "AI Custom Emoji Synthesis");
    } catch (e) {
      setStudioEmojiTitle("Ethereal Sonder Reverie");
      setStudioEmotionDescription("A bespoke aura blend capturing midnight clarity and human connection.");
      setStudioBaseColor("#8b5cf6");
      setStudioAuraStyle("nebula");
      addJoyOrbs(15, "Offline Custom Emoji Creation");
    } finally {
      setIsStudioGenerating(false);
    }
  };

  // TRANSLATOR LOGIC
  const handleTranslateText = async () => {
    if (!translatorInput.trim()) return;
    setIsTranslating(true);

    try {
      const prompt = `Translate this emotional text into an international UEL emoji sequence with cultural notes: "${translatorInput}" for region: "${translatorRegion}".
      Output JSON format:
      - "emojiSequence": The emoji sequence (e.g. "🌧️☕🧦🔥").
      - "explanation": 2 sentence explanation of how these emojis bridge cross-cultural understanding.`;

      const config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            emojiSequence: { type: "STRING" },
            explanation: { type: "STRING" }
          },
          required: ["emojiSequence", "explanation"]
        }
      };

      const resText = await callGeminiAPI(prompt, config);
      const parsed = JSON.parse(resText);
      setTranslatorOutput(parsed);
      addJoyOrbs(20, "UEL Cross-Cultural Translation");
    } catch (e) {
      // Find matching keyword or fallback
      const match = OFFLINE_TRANSLATIONS.find(t => translatorInput.toLowerCase().includes(t.textKey)) || OFFLINE_TRANSLATIONS[0];
      setTranslatorOutput(match);
      addJoyOrbs(10, "Offline UEL Translation");
    } finally {
      setIsTranslating(false);
    }
  };

  // DOWNLOAD HTML CARD
  const handleDownloadCard = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${studioEmojiTitle} - Emoji Extravaganza Card</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
    .card { background: linear-gradient(135deg, ${studioBaseColor}44 0%, #1e1b4b 100%); border: 2px solid ${studioBaseColor}; border-radius: 24px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(12px); }
    .emoji-preview { width: 160px; height: 160px; margin: 0 auto 20px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 80px; border: 3px solid ${studioBaseColor}; box-shadow: 0 0 30px ${studioBaseColor}88; }
    h1 { color: #f8fafc; font-size: 24px; margin-bottom: 8px; }
    p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }
    .badge { display: inline-block; padding: 6px 16px; background: ${studioBaseColor}; color: white; font-size: 11px; font-weight: bold; border-radius: 20px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
    .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Emoji Extravaganza • Bespoke Asset</div>
    <div class="emoji-preview">✨🎭✨</div>
    <h1>${studioEmojiTitle}</h1>
    <p>"${studioEmotionDescription}"</p>
    <div class="footer">Created with Emoji Extravaganza Universal Emotional Bridge • #EmojiExtravaganza</div>
  </div>
</body>
</html>`;
    downloadFile(`${studioEmojiTitle.replace(/\s+/g, '_')}_Card.html`, html, 'text/html');
    addJoyOrbs(15, "Downloading HTML Emoji Insight Card");
  };

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-300 font-sans flex flex-col`}>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce text-xs font-bold border border-white/20">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* NAVIGATION HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${themeMode === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'} px-4 py-3 transition-colors`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 rounded-2xl text-white shadow-lg shadow-purple-500/20">
              <SmilePlus className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
                Emoji Extravaganza
                <span className="text-[10px] uppercase font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  UEL Engine v2.5
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                International Emotional Bridging & Hyper-Personal Emoji Studio
              </p>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('spectra')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'spectra'
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> SPECTRA Engine
            </button>

            <button
              onClick={() => setActiveTab('decipher')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'decipher'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Decipher Tool
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'studio'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Emoji Studio
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Themed Libraries
            </button>

            <button
              onClick={() => setActiveTab('translator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'translator'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> UEL Translator
            </button>
          </nav>

          {/* GAMIFICATION & SETTINGS */}
          <div className="flex items-center space-x-2">

            {/* JOY ORBS WALLET */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-extrabold cursor-pointer hover:brightness-110 transition-all"
              title="Joy Orbs Earned through Emotional Expression (Converts to TokeX Tokens)"
              onClick={() => showToast(`🪙 ${joyOrbs} Joy Orbs = ${(joyOrbs * 0.25).toFixed(2)} TokeX Tokens!`)}
            >
              <Coins className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{joyOrbs} Orbs</span>
            </div>

            {/* STREAK */}
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold"
              title="Daily Joy Streak"
            >
              <Flame className="w-4 h-4 text-rose-500" />
              <span>{streakDays}d</span>
            </div>

            {/* SERVICE KEY BUTTON */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 text-xs"
              title="Configure Service Token"
            >
              <Key className="w-4 h-4 text-amber-400" />
            </button>

            {/* THEME TOGGLE */}
            <button
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 text-xs"
              title="Toggle Dark / Light Theme"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>

        </div>

        {/* MOBILE BOTTOM / NAVIGATION STRIP */}
        <div className="flex md:hidden justify-around pt-2 border-t border-slate-800/60 mt-2">
          <button
            onClick={() => setActiveTab('spectra')}
            className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 ${
              activeTab === 'spectra' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" /> SPECTRA
          </button>
          <button
            onClick={() => setActiveTab('decipher')}
            className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 ${
              activeTab === 'decipher' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <Compass className="w-4 h-4" /> Decipher
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 ${
              activeTab === 'studio' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <Palette className="w-4 h-4" /> Studio
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 ${
              activeTab === 'library' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <Bookmark className="w-4 h-4" /> Libraries
          </button>
          <button
            onClick={() => setActiveTab('translator')}
            className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 ${
              activeTab === 'translator' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <Globe className="w-4 h-4" /> Translator
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* TAB 0: SPECTRA REFRACTION ENGINE */}
        {activeTab === 'spectra' && (
          <SpectraRefractionEngine activeParadigm="SPECTRA" setActiveParadigm={setActiveTab} />
        )}

        {/* TAB 1: EMOJI DECIPHER TOOL */}
        {activeTab === 'decipher' && (
          <div className="space-y-6 animate-fade-in">

            {/* HERO BANNER */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="max-w-2xl space-y-3 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" /> Neural Decipher Engine
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Decipher Complex Emojis & Unsaid Sentiments
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Paste or select complex emoji strings to tear down hidden subtext, cultural context across continents, and PeriSensorAI sentiment metrics.
                </p>
              </div>
            </div>

            {/* INPUT & PRESETS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* INPUT PANEL */}
              <div className="lg:col-span-1 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                  <span>Enter Emoji Sequence</span>
                  <span className="text-[10px] text-purple-400 font-mono">Neural Sentiment</span>
                </h3>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={decipherInput}
                    onChange={(e) => setDecipherInput(e.target.value)}
                    placeholder="Paste emojis e.g. 🎃👻🕯️ or 🥺👉👈"
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xl text-center tracking-widest text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleDecipher()}
                    disabled={isDecipherLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
                  >
                    {isDecipherLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 text-amber-300" />
                    )}
                    <span>{isDecipherLoading ? 'Analyzing Sentiment...' : 'Decipher Emotional Subtext'}</span>
                  </button>
                </div>

                {/* QUICK PRESETS */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Quick Presets:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(PRESET_DECIPHERS).map((presetKey) => (
                      <button
                        key={presetKey}
                        onClick={() => {
                          setDecipherInput(presetKey);
                          handleDecipher(presetKey);
                        }}
                        className="p-2.5 bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 rounded-xl text-sm transition-all flex items-center justify-center font-emoji"
                      >
                        {presetKey}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DECIPHER RESULTS PANEL */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
                {decipherResult ? (
                  <div className="space-y-6">

                    {/* PRIMARY SENTIMENT */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-purple-300">
                        <span>Primary Sentiment Teardown</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20">PeriSensorAI Mode</span>
                      </div>
                      <h3 className="text-xl font-extrabold text-white">{decipherResult.primarySentiment}</h3>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed italic">
                        "{decipherResult.subtext}"
                      </p>
                    </div>

                    {/* METRICS & CULTURAL CONTEXT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* METRICS */}
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                          Emotional Tone & Intensity
                        </span>

                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span>Emotional Arousal (Energy)</span>
                              <span className="text-purple-400 font-bold">{decipherResult.periSensorMetrics?.arousal}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${decipherResult.periSensorMetrics?.arousal}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span>Emotional Valence (Positivity)</span>
                              <span className="text-emerald-400 font-bold">{decipherResult.periSensorMetrics?.valence}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${decipherResult.periSensorMetrics?.valence}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-xs">
                          <span className="text-slate-400">Tone Signature:</span>
                          <span className="font-extrabold text-purple-300">{decipherResult.periSensorMetrics?.emotionalTone}</span>
                        </div>
                      </div>

                      {/* CULTURAL CONTEXT */}
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" /> Cultural & Subcultural Context
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {decipherResult.culturalContext}
                        </p>
                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={async () => {
                          const textToCopy = `${decipherInput}: ${decipherResult.primarySentiment} - ${decipherResult.subtext}`;
                          const success = await safeCopyToClipboard(textToCopy);
                          if (success) showToast("📋 Deciphered insight copied!");
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Teardown
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('studio');
                          setStudioEmojiTitle(decipherResult.primarySentiment);
                          setStudioEmotionDescription(decipherResult.subtext);
                        }}
                        className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Palette className="w-3.5 h-3.5" /> Open in Studio & Customize
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-2">
                    <Compass className="w-12 h-12 text-slate-700 animate-pulse" />
                    <p className="text-xs">Select or enter an emoji string to generate a sentiment teardown.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: EMOJI STUDIO & CUSTOM DESIGNER */}
        {activeTab === 'studio' && (
          <div className="space-y-6 animate-fade-in">

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-pink-900/60 via-purple-900/40 to-slate-900 border border-pink-500/20 shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl space-y-3 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-extrabold uppercase tracking-wider">
                  <Palette className="w-3.5 h-3.5" /> Interactive Layer Blender
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Emoji Studio & Hyper-Personal Designer
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Craft custom emojis for niche emotions (*Sonder*, *Saudade*, Halloween Spookiness). Layer base tones, aura halos, eyes, and accessories.
                </p>
              </div>
            </div>

            {/* PRESET CHIPS */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">Niche Emotion Trait Presets:</span>
              <div className="flex flex-wrap gap-2">
                {STUDIO_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyStudioPreset(p)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-xs font-bold text-slate-200 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.baseColor }}></span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* EDITOR MAIN CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* CANVAS & PREVIEW CARD */}
              <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>

                <div className="space-y-2 w-full">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 block">
                    Bespoke Visual Canvas
                  </span>
                  <input
                    type="text"
                    value={studioEmojiTitle}
                    onChange={(e) => setStudioEmojiTitle(e.target.value)}
                    className="w-full text-center bg-transparent text-lg font-black text-white focus:outline-none border-b border-transparent focus:border-purple-500 pb-1"
                  />
                </div>

                {/* DYNAMIC SVG EMOJI COMPONENT */}
                <div className="relative my-4 w-44 h-44 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group" style={{
                  background: `radial-gradient(circle, ${studioBaseColor}dd 0%, ${studioBaseColor}44 70%, transparent 100%)`,
                  boxShadow: `0 0 40px ${studioBaseColor}66`
                }}>

                  {/* AURA GLOW EFFECT */}
                  {studioAuraStyle === 'nebula' && <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-purple-500 pointer-events-none"></div>}
                  {studioAuraStyle === 'fog' && <div className="absolute -inset-4 rounded-full bg-teal-500/20 blur-xl animate-pulse"></div>}
                  {studioAuraStyle === 'phoenix' && <div className="absolute -inset-4 rounded-full bg-rose-500/20 blur-xl animate-pulse"></div>}

                  {/* SVG EMOJI BASE */}
                  <svg className="w-32 h-32 transform transition-transform duration-300 group-hover:scale-110" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill={studioBaseColor} stroke="#ffffff" strokeWidth="2" />

                    {/* EYES LAYER */}
                    {studioEyeStyle === 'starry' && (
                      <g fill="#ffffff">
                        <polygon points="30,35 32,40 37,40 33,43 35,48 30,45 25,48 27,43 23,40 28,40" />
                        <polygon points="70,35 72,40 77,40 73,43 75,48 70,45 65,48 67,43 63,40 68,40" />
                      </g>
                    )}
                    {studioEyeStyle === 'ghostly' && (
                      <g fill="#000000">
                        <circle cx="30" cy="40" r="7" />
                        <circle cx="70" cy="40" r="7" />
                        <circle cx="30" cy="40" r="3" fill="#00ffff" />
                        <circle cx="70" cy="40" r="3" fill="#00ffff" />
                      </g>
                    )}
                    {studioEyeStyle === 'flame' && (
                      <g fill="#f59e0b">
                        <path d="M 25,45 Q 30,30 35,45 Z" />
                        <path d="M 65,45 Q 70,30 75,45 Z" />
                      </g>
                    )}
                    {studioEyeStyle === 'sparkle' && (
                      <g fill="#ffffff">
                        <circle cx="30" cy="40" r="6" />
                        <circle cx="70" cy="40" r="6" />
                        <circle cx="32" cy="38" r="2" fill="#000000" />
                        <circle cx="72" cy="38" r="2" fill="#000000" />
                      </g>
                    )}

                    {/* MOUTH LAYER */}
                    {studioMouthStyle === 'smile' && <path d="M 30,65 Q 50,80 70,65" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />}
                    {studioMouthStyle === 'vamp' && (
                      <g>
                        <path d="M 30,62 Q 50,75 70,62" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                        <polygon points="38,64 42,72 44,64" fill="#ffffff" />
                        <polygon points="56,64 58,72 62,64" fill="#ffffff" />
                      </g>
                    )}
                    {studioMouthStyle === 'oGasp' && <circle cx="50" cy="68" r="8" fill="#ffffff" />}
                    {studioMouthStyle === 'calm' && <line x1="35" y1="68" x2="65" y2="68" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />}
                    {studioMouthStyle === 'tongue' && (
                      <g>
                        <path d="M 30,62 Q 50,78 70,62" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 45,68 Q 50,80 55,68 Z" fill="#f43f5e" />
                      </g>
                    )}
                  </svg>
                </div>

                <div className="space-y-2 w-full">
                  <textarea
                    value={studioEmotionDescription}
                    onChange={(e) => setStudioEmotionDescription(e.target.value)}
                    rows="2"
                    className="w-full bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 italic text-center focus:outline-none"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadCard}
                      className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download HTML Card
                    </button>
                  </div>
                </div>

              </div>

              {/* CONTROLS & AI SYNTHESIZER */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">

                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-pink-400" /> Custom Layer Controls
                  </h3>

                  <button
                    onClick={handleAIGenerateStudio}
                    disabled={isStudioGenerating}
                    className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-extrabold rounded-xl text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isStudioGenerating ? 'Synthesizing AI Emoji...' : 'AI Synthesize Emoji'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* BASE COLOR */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Base Spectrum Tone:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={studioBaseColor}
                        onChange={(e) => setStudioBaseColor(e.target.value)}
                        className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-300">{studioBaseColor}</span>
                    </div>
                  </div>

                  {/* EYE STYLE */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Eye Expression:</label>
                    <select
                      value={studioEyeStyle}
                      onChange={(e) => setStudioEyeStyle(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="starry">Starry Vision (Sonder)</option>
                      <option value="ghostly">Ghostly Glow (Spooky)</option>
                      <option value="flame">Fiery Passion (Duende)</option>
                      <option value="sparkle">Sparkling Joy</option>
                    </select>
                  </div>

                  {/* MOUTH STYLE */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Mouth & Mood:</label>
                    <select
                      value={studioMouthStyle}
                      onChange={(e) => setStudioMouthStyle(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="smile">Warm Smile</option>
                      <option value="vamp">Vampire Fangs (Halloween)</option>
                      <option value="oGasp">Awe & Gasp</option>
                      <option value="calm">Serene Calm</option>
                      <option value="tongue">Playful Tongue</option>
                    </select>
                  </div>

                  {/* AURA STYLE */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Atmospheric Aura Effect:</label>
                    <select
                      value={studioAuraStyle}
                      onChange={(e) => setStudioAuraStyle(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="nebula">Cosmic Nebula Pulse</option>
                      <option value="fog">Eerie Autumn Fog</option>
                      <option value="phoenix">Fiery Phoenix Radiance</option>
                    </select>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: THEMED LIBRARIES */}
        {activeTab === 'library' && (
          <div className="space-y-6 animate-fade-in">

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl space-y-3 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
                  <Bookmark className="w-3.5 h-3.5" /> Universal Emotional Language (UEL)
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Categorized Emoji Collections & Libraries
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Browse curated collections for Spooky Halloween, Holidays, Spiritual Solstice, and Niche Feelings. One-click copy or inspect in Studio.
                </p>
              </div>
            </div>

            {/* SEARCH & CATEGORY FILTER */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800">

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search emojis or feelings..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={() => setActiveLibCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeLibCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Categories
                </button>
                {THEMED_LIBRARIES.map((lib) => (
                  <button
                    key={lib.id}
                    onClick={() => setActiveLibCategory(lib.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeLibCategory === lib.id ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lib.title.split(' ')[0]} {lib.title.split(' ')[1]}
                  </button>
                ))}
              </div>

            </div>

            {/* LIBRARIES GRID */}
            <div className="space-y-8">
              {THEMED_LIBRARIES.filter(lib => activeLibCategory === 'all' || activeLibCategory === lib.id).map((category) => {
                const filteredItems = category.items.filter(item =>
                  item.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
                  item.emotion.toLowerCase().includes(librarySearch.toLowerCase()) ||
                  item.emoji.includes(librarySearch)
                );

                if (filteredItems.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-3">
                    <div className="border-b border-slate-800/80 pb-2 flex justify-between items-baseline">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        {category.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">{category.subtitle}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 space-y-3 shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-emoji p-2 bg-slate-950 rounded-xl border border-slate-800/60 group-hover:scale-110 transition-transform">
                              {item.emoji}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
                              {item.emotion}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-white">{item.name}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">{item.description}</p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                            <button
                              onClick={async () => {
                                const success = await safeCopyToClipboard(item.emoji);
                                if (success) {
                                  showToast(`📋 Copied ${item.emoji} to clipboard!`);
                                  addJoyOrbs(5, "Sharing UEL Emoji");
                                }
                              }}
                              className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>

                            <button
                              onClick={() => {
                                setDecipherInput(item.emoji);
                                setActiveTab('decipher');
                                handleDecipher(item.emoji);
                              }}
                              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-xl text-[11px] font-bold transition-all"
                            >
                              Decipher
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 4: UEL TRANSLATOR */}
        {activeTab === 'translator' && (
          <div className="space-y-6 animate-fade-in">

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-900/60 via-teal-900/40 to-slate-900 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl space-y-3 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5" /> International UEL Bridge
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Cross-Cultural Emoji Translator
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Bridge global communication divides by converting text or mood states into culturally nuanced emoji sequences with localized tone notes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* INPUT PANEL */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                  <span>Your Text or Mood Statement</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Cross-Cultural</span>
                </h3>

                <textarea
                  rows="4"
                  value={translatorInput}
                  onChange={(e) => setTranslatorInput(e.target.value)}
                  placeholder="Type how you feel or what you want to communicate across language barriers..."
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Regional Dialect / Market Context:</label>
                  <select
                    value={translatorRegion}
                    onChange={(e) => setTranslatorRegion(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Global Universal">Global Universal (Cross-Continental Bridge)</option>
                    <option value="East Asian High-Context">East Asian High-Context (Japan / Korea / China)</option>
                    <option value="Latin American Expressive">Latin American Expressive</option>
                    <option value="Middle Eastern Warmth">Middle Eastern Warmth & Hospitality</option>
                    <option value="Gen-Z / Internet Culture">Gen-Z / Digital Subculture</option>
                  </select>
                </div>

                <button
                  onClick={handleTranslateText}
                  disabled={isTranslating}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isTranslating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span>{isTranslating ? 'Translating to UEL Sequence...' : 'Translate to Cross-Cultural Emojis'}</span>
                </button>
              </div>

              {/* OUTPUT TRANSLATION PANEL */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">
                    <span>Universal Emotional Translation</span>
                    <span className="bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">{translatorRegion}</span>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-2">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Bridge Sequence:</span>
                    <div className="text-3xl md:text-4xl font-emoji tracking-widest text-white py-2">
                      {translatorOutput?.emojiSequence || "🌧️☕🧦🔥"}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Cross-Cultural Nuance & Tone Notes:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {translatorOutput?.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={async () => {
                      const text = `${translatorOutput?.emojiSequence} (${translatorInput})`;
                      const success = await safeCopyToClipboard(text);
                      if (success) {
                        showToast("📋 UEL sequence copied!");
                        addJoyOrbs(10, "Copying UEL Translation");
                      }
                    }}
                    className="flex-1 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy UEL Bridge
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* GEMINI SERVICE CONFIG MODAL */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Key className="w-4 h-4" />
                <span>Service Token Configuration</span>
              </div>
              <button onClick={() => setIsApiKeyModalOpen(false)} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Configure your Google Gemini service token to enable live neural emoji deciphering, AI custom emoji synthesis, and cross-cultural translations. Offline fallbacks work automatically if no token is supplied!
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Service Configuration Token String
              </label>
              <input
                type="password"
                value={userCredentialVal}
                onChange={(e) => setUserCredentialVal(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl text-xs hover:opacity-95 transition-all shadow-md"
              >
                Save Token
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>✨ Emoji Extravaganza • Universal Emotional Language (UEL) Studio</span>
          <span>Powered by Gemini 2.5 Flash & PeriSensorAI Sentiment Engine</span>
        </div>
      </footer>

    </div>
  );
}
