
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  RotateCcw, 
  History, 
  Wand2, 
  AlertCircle, 
  LayoutDashboard, 
  Zap, 
  Printer, 
  Maximize2, 
  Layers, 
  Palette, 
  Eye, 
  LogOut, 
  MessageSquare, 
  X, 
  Send, 
  Box, 
  Compass, 
  Phone, 
  ChevronUp, 
  ChevronDown, 
  Cpu,
  Mic,
  MicOff,
  Plus,
  Info,
  Terminal,
  BookOpen,
  Film,
  Key,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Settings2
} from 'lucide-react';
import LogoUploader from './components/LogoUploader';
import ProductSelector from './components/ProductSelector';
import ThreeDViewer from './components/ThreeDViewer';
import FrankVoiceCall from './components/FrankVoiceCall';
import FrankRobot from './components/FrankRobot';
import { AppState, GeneratedMockup, ChatMessage, AIModelId } from './types';
import { generateMerchMockup, editMockup, processFrankRequest } from './services/geminiService';

const MODEL_METADATA: Record<AIModelId, { label: string; description: string; specialty: string; color: string; icon: React.ReactNode }> = {
  'gemini': { 
    label: 'GEMINI', 
    description: 'Elegant & Technical.', 
    specialty: 'Expert in design physics & print specs.',
    color: 'bg-blue-500',
    icon: <Zap size={10} />
  },
  'gpt': { 
    label: 'GPT-4o', 
    description: 'Logical & Concise.', 
    specialty: 'Direct problem-solving & optimization.',
    color: 'bg-emerald-500',
    icon: <Cpu size={10} />
  },
  'grok': { 
    label: 'GROK', 
    description: 'Witty & Grounded.', 
    specialty: 'Real-time design trends & search.',
    color: 'bg-orange-500',
    icon: <Terminal size={10} />
  },
  'claude': { 
    label: 'CLAUDE', 
    description: 'Nuanced & Deep.', 
    specialty: 'Creative branding & detailed feedback.',
    color: 'bg-purple-500',
    icon: <BookOpen size={10} />
  },
  'stable-diffusion': { 
    label: 'STABLE DIFF.', 
    description: 'Pixel Synthesis.', 
    specialty: 'High-end creative image generation.',
    color: 'bg-pink-500',
    icon: <Palette size={10} />
  },
  'ling-v3': { 
    label: 'LING V3', 
    description: 'Motion Render.', 
    specialty: 'Next-gen brand video storytelling.',
    color: 'bg-yellow-500',
    icon: <Film size={10} />
  }
};

const App: React.FC = () => {
  const [isSplashing, setIsSplashing] = useState(true);
  const [state, setState] = useState<AppState>({
    logo: null,
    product: 't-shirt',
    environment: 'High-end luxury studio with cinematic lighting and soft bokeh background',
    isGenerating: false,
    history: [],
    currentMockup: null,
    error: null,
    selectedModel: 'gemini'
  });

  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'print' | '3d'>('editor');
  const [generationStep, setGenerationStep] = useState('');
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const [chatMessages, setChatMessages] = useState<(ChatMessage & { sources?: { title: string; uri: string }[] })[]>([
    { role: 'model', text: 'Hello, I am Frank. I am proud to represent the exclusive partnership between Google Gemini and our visionary CEO, Frank. How can I assist with your design vision today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isFrankThinking, setIsFrankThinking] = useState(false);
  const [frankThinkingStep, setFrankThinkingStep] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Splash timeout
  useEffect(() => {
    const timer = setTimeout(() => setIsSplashing(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isFrankThinking]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleGenerate = async () => {
    if (!state.logo) {
      setState(prev => ({ ...prev, error: 'Please upload a brand logo' }));
      return;
    }
    setIsConfigOpen(false);
    setState(prev => ({ ...prev, isGenerating: true, error: null }));
    
    let stepIdx = 0;
    const steps = ['Analyzing identity...', 'Mapping textures...', 'Simulating light...', 'Applying logo...', 'Rendering...'];
    const interval = setInterval(() => {
      setGenerationStep(steps[stepIdx % steps.length]);
      stepIdx++;
    }, 1200);

    try {
      const imageUrl = await generateMerchMockup(state.logo, state.product, state.environment);
      const newMockup: GeneratedMockup = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        prompt: state.environment,
        timestamp: Date.now(),
        product: state.product,
      };
      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentMockup: newMockup,
        history: [newMockup, ...prev.history],
      }));
      setActiveTab('editor');
    } catch (err: any) {
      setState(prev => ({ ...prev, isGenerating: false, error: err.message || 'Generation failed' }));
    } finally {
      clearInterval(interval);
      setGenerationStep('');
    }
  };

  const handleAIEdit = async () => {
    if (!state.currentMockup) return;
    setState(prev => ({ ...prev, isGenerating: true, error: null }));
    setGenerationStep('Tweak in progress...');
    try {
      const newImageUrl = await editMockup(state.currentMockup.url, aiEditPrompt);
      const updatedMockup: GeneratedMockup = {
        ...state.currentMockup,
        id: Math.random().toString(36).substr(2, 9),
        url: newImageUrl,
        prompt: aiEditPrompt,
        timestamp: Date.now(),
      };
      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentMockup: updatedMockup,
        history: [updatedMockup, ...prev.history],
      }));
      setAiEditPrompt('');
    } catch (err: any) {
      setState(prev => ({ ...prev, isGenerating: false, error: err.message || 'Edit failed' }));
    } finally {
      setGenerationStep('');
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    if (state.selectedModel === 'ling-v3') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        if (confirm("Ling V3 requires a paid API key for video generation. Would you like to select one now?")) {
          await (window as any).aistudio.openSelectKey();
        } else {
          return;
        }
      }
    }

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', text: userInput }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsFrankThinking(true);
    setFrankThinkingStep('Consulting neural design network...');

    try {
      const result = await processFrankRequest(newMessages, state.selectedModel, (step) => {
        setFrankThinkingStep(step);
      });

      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: result.text, 
        image: result.image, 
        video: result.video,
        type: result.type as any,
        sources: (result as any).sources
      }]);
    } catch (err: any) {
      let errorMsg = "Apologies, I encountered a brief technical interruption.";
      if (err.message?.includes("entity was not found")) {
        errorMsg = "Your session key has expired or is invalid. Please re-authenticate.";
        await (window as any).aistudio.openSelectKey();
      }
      setChatMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsFrankThinking(false);
      setFrankThinkingStep('');
    }
  };

  const downloadFile = (url: string, prefix: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prefix}-${Date.now()}.png`;
    link.click();
  };

  if (isSplashing) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[1000] luxury-gradient">
        <div className="relative">
          <div className="ripple opacity-20 scale-150"></div>
          <div className="relative z-10 animate-float">
            <div className="w-24 h-24 gold-gradient rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.2)]">
              <Zap size={48} className="text-black" />
            </div>
          </div>
        </div>
        <div className="mt-12 text-center space-y-3">
          <h1 className="luxury-text text-3xl font-bold tracking-[0.4em] text-white pl-[0.4em]">GRAND X</h1>
          <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.6em] animate-pulse pl-[0.6em]">Neural Print Engine v7.0</p>
        </div>
        <div className="absolute bottom-12 w-32 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 w-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white luxury-gradient overflow-hidden select-none">
      {/* MOBILE HEADER */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-md z-50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <div className="flex flex-col">
            <h1 className="luxury-text text-sm font-bold tracking-widest text-white leading-none">GRAND X</h1>
            <p className="text-[8px] text-yellow-500 uppercase tracking-widest">v7.0 AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state.currentMockup && (
            <button 
              onClick={() => downloadFile(state.currentMockup!.url, 'mockup')}
              className="p-2 bg-white text-black rounded-full hover:bg-yellow-500 transition-all active:scale-90"
              title="Download Mockup"
            >
              <Download size={16} />
            </button>
          )}
          <button 
            onClick={() => setIsVoiceActive(true)}
            className="p-2 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20 active:scale-90 animate-pulse"
            title="Voice Call"
          >
            <Phone size={16} />
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* VIEW TABS */}
        <div className="flex justify-center p-4 z-40">
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10 w-full max-w-[280px]">
            <button 
              className={`flex-1 py-2 rounded-full text-[10px] font-bold transition-all ${activeTab === 'editor' ? 'bg-yellow-500 text-black' : 'text-gray-400'}`} 
              onClick={() => setActiveTab('editor')}
            >
              CANVAS
            </button>
            <button 
              className={`flex-1 py-2 rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${activeTab === '3d' ? 'bg-yellow-500 text-black' : 'text-gray-400'}`} 
              onClick={() => setActiveTab('3d')}
            >
              <Box size={12} /> 3D
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex flex-col px-4 pb-20 overflow-y-auto no-scrollbar">
          {activeTab === 'editor' && (
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
               {!state.currentMockup && !state.isGenerating ? (
                <div className="text-center space-y-4 px-8">
                  <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-float">
                    <Layers size={32} className="text-black" />
                  </div>
                  <h2 className="luxury-text text-2xl font-bold text-white tracking-widest pl-[0.1em]">AWAITING DESIGN</h2>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest leading-loose">Tap the Plus to begin crafting your identity</p>
                  <button 
                    onClick={() => setIsConfigOpen(true)}
                    className="mt-6 px-10 py-4 bg-yellow-500 text-black rounded-full font-bold text-xs tracking-widest shadow-xl active:scale-95 pl-[0.1em]"
                  >
                    START ENGINE
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center">
                  <div className="relative w-full flex-1 glass-panel rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center min-h-[300px]">
                    {state.isGenerating && (
                      <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-2 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin"></div>
                        <div className="text-center">
                          <p className="luxury-text text-lg font-bold tracking-[0.2em] animate-pulse pl-[0.2em]">{generationStep}</p>
                          <p className="text-[8px] text-yellow-500/50 uppercase tracking-[0.4em] font-bold mt-2 pl-[0.1em]">Neural Link Active</p>
                        </div>
                      </div>
                    )}
                    {state.currentMockup && <img src={state.currentMockup.url} alt="Mockup" className="max-w-full max-h-full object-contain p-2" />}
                  </div>
                  
                  {state.currentMockup && !state.isGenerating && (
                    <div className="w-full mt-4 pb-4 px-2">
                      <div className="relative gold-border-focus rounded-full overflow-hidden transition-all bg-white/5 border border-white/10 p-1 flex items-center">
                        <div className="pl-4 pr-2 text-yellow-500"><Wand2 size={16} /></div>
                        <input
                          type="text"
                          value={aiEditPrompt}
                          onChange={(e) => setAiEditPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAIEdit()}
                          placeholder="Tweak scene..."
                          className="flex-1 bg-transparent py-3 text-xs outline-none placeholder:text-gray-600"
                        />
                        <button onClick={handleAIEdit} disabled={!aiEditPrompt.trim()} className="bg-yellow-500 text-black px-4 py-2.5 rounded-full font-bold text-[10px] tracking-widest hover:bg-yellow-400 disabled:opacity-20 transition-all active:scale-95 pl-[0.1em]">GO</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === '3d' && (
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
              {state.logo ? (
                <div className="w-full h-full glass-panel rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative min-h-[350px]">
                  <ThreeDViewer logo={state.logo} product={state.product} />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                     <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest pl-[0.1em]">
                        <Compass size={10} className="text-yellow-500" /> Touch to Rotate & Zoom
                     </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto"><Box size={24} className="text-gray-600" /></div>
                   <h2 className="luxury-text text-lg font-bold tracking-widest pl-[0.1em]">3D LOCKED</h2>
                   <p className="text-gray-500 text-[10px] uppercase tracking-widest px-10 pl-[0.1em]">Initialize identity to project 3D volume</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex-1 flex flex-col p-2 space-y-6">
              <div className="flex justify-between items-center px-2">
                <div>
                  <h2 className="luxury-text text-lg font-bold tracking-widest pl-[0.1em]">PORTFOLIO</h2>
                  <p className="text-[8px] text-yellow-500 uppercase tracking-widest pl-[0.1em]">Historical Renders</p>
                </div>
                <History className="text-yellow-500/50" size={20} />
              </div>
              
              {state.history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-30">
                  <Maximize2 size={40} className="mb-4" />
                  <p className="text-[10px] font-bold tracking-widest uppercase">No records found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {state.history.map((mockup) => (
                    <div key={mockup.id} className="group relative glass-panel rounded-2xl overflow-hidden border border-white/5 aspect-square flex items-center justify-center p-2 hover:border-yellow-500/30 transition-all active:scale-95" onClick={() => { setState(prev => ({...prev, currentMockup: mockup})); setActiveTab('editor'); }}>
                      <img src={mockup.url} alt="History item" className="max-w-full max-h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-yellow-500 text-black p-2 rounded-full"><Eye size={16} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'print' && (
            <div className="flex-1 flex flex-col p-4 space-y-8">
              <div>
                <h2 className="luxury-text text-lg font-bold tracking-widest pl-[0.1em]">PRINT SHOP</h2>
                <p className="text-[8px] text-yellow-500 uppercase tracking-widest pl-[0.1em]">Specs & Logistics</p>
              </div>

              <div className="space-y-4">
                <div className="glass-panel p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center border border-yellow-500/20"><Printer size={20} /></div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase">Production Ready</p>
                      <p className="text-[8px] text-gray-500 uppercase tracking-widest">300 DPI - CMYK Verified</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/5 w-full"></div>
                  <ul className="space-y-3">
                    {[
                      'Vectorized Brand Mapping',
                      'Automated Bleed Analysis',
                      'Direct-to-Garment Optimized',
                      'Global Distribution Network'
                    ].map((text, i) => (
                      <li key={i} className="flex items-center gap-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        <CheckCircle2 size={12} className="text-yellow-500" /> {text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 text-center">
                    <MapPin className="text-yellow-500" size={16} />
                    <p className="text-[8px] font-bold uppercase tracking-widest">Nearest Hub</p>
                    <p className="text-[7px] text-gray-500 uppercase tracking-widest">LAX-7 - Silicon Valley</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 text-center">
                    <Settings2 className="text-yellow-500" size={16} />
                    <p className="text-[8px] font-bold uppercase tracking-widest">Tech Config</p>
                    <p className="text-[7px] text-gray-500 uppercase tracking-widest">AI v7.0 Engine</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-5 gold-gradient text-black rounded-full font-bold text-xs tracking-[0.2em] shadow-2xl active:scale-95">
                EXECUTE ORDER
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="h-20 bg-black/80 border-t border-white/5 backdrop-blur-xl flex items-center justify-around px-4 z-[60] shrink-0">
        <button onClick={() => { setActiveTab('editor'); setIsConfigOpen(false); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'editor' && !isConfigOpen ? 'text-yellow-500' : 'text-gray-500'}`}>
          <LayoutDashboard size={20} /><span className="text-[8px] font-bold tracking-widest uppercase pl-[0.1em]">Editor</span>
        </button>
        <button onClick={() => { setActiveTab('history'); setIsConfigOpen(false); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-yellow-500' : 'text-gray-500'}`}>
          <History size={20} /><span className="text-[8px] font-bold tracking-widest uppercase pl-[0.1em]">Portfolio</span>
        </button>
        <button onClick={() => setIsConfigOpen(true)} className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center -translate-y-6 shadow-[0_0_30px_rgba(255,215,0,0.3)] active:scale-90 transition-all text-black" title="New Project">
          <Plus size={28} />
        </button>
        <button onClick={() => { setActiveTab('print'); setIsConfigOpen(false); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'print' ? 'text-yellow-500' : 'text-gray-500'}`}>
          <Printer size={20} /><span className="text-[8px] font-bold tracking-widest uppercase pl-[0.1em]">Print</span>
        </button>
        <button onClick={() => { setIsChatOpen(true); setIsConfigOpen(false); }} className={`flex flex-col items-center gap-1 transition-all ${isChatOpen ? 'text-yellow-500' : 'text-gray-500'}`}>
          <MessageSquare size={20} /><span className="text-[8px] font-bold tracking-widest uppercase pl-[0.1em]">Chat</span>
        </button>
      </nav>

      {/* CONFIG PANEL */}
      <div className={`fixed inset-0 z-[70] transition-opacity duration-300 ${isConfigOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
        <div className={`absolute bottom-0 left-0 right-0 bg-neutral-900 rounded-t-[2.5rem] border-t border-white/10 p-6 space-y-6 transition-transform duration-500 transform ${isConfigOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
          <div className="flex justify-center -mt-2 mb-4"><div className="w-12 h-1 bg-white/20 rounded-full"></div></div>
          <div className="flex justify-between items-center">
            <div><h2 className="luxury-text text-xl font-bold tracking-widest pl-[0.1em]">CONFIGURE</h2><p className="text-[8px] text-yellow-500 uppercase tracking-[0.3em] pl-[0.1em]">Build your identity</p></div>
            <button onClick={() => setIsConfigOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={18} /></button>
          </div>
          <LogoUploader logo={state.logo} onLogoChange={(logo) => setState(prev => ({ ...prev, logo }))} />
          <ProductSelector selected={state.product} onSelect={(product) => setState(prev => ({ ...prev, product }))} />
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-[0.1em]">Scene Mood</label>
            <textarea value={state.environment} onChange={(e) => setState(prev => ({ ...prev, environment: e.target.value }))} placeholder="Describe the mood..." className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] outline-none transition-all resize-none text-gray-300 placeholder:text-gray-600" />
          </div>
          <button onClick={handleGenerate} disabled={state.isGenerating || !state.logo} className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-yellow-500/20 shadow-xl active:scale-95 pl-[0.1em] ${state.isGenerating || !state.logo ? 'bg-white/5 text-gray-600 border-white/5' : 'bg-yellow-500 text-black'}`}>
            <Sparkles size={18} /><span className="tracking-widest text-xs">CREATE MOCKUP</span>
          </button>
        </div>
      </div>

      {/* CHAT INTERFACE */}
      <div className={`fixed inset-0 z-[80] bg-black transition-transform duration-500 transform ${isChatOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex flex-col h-full">
          <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3"><FrankRobot size="small" speaking={isFrankThinking} modelId={state.selectedModel} /><div className="flex flex-col justify-center"><h3 className="text-xs font-bold tracking-widest text-white uppercase shimmer-text pl-[0.1em]">Frank</h3><p className="text-[8px] text-yellow-500 uppercase tracking-widest pl-[0.1em]">X Design Intelligence</p></div></div>
            <button onClick={() => setIsChatOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
          </header>

          <div className="px-4 py-4 bg-black/60 border-b border-white/5 space-y-3 shrink-0 backdrop-blur-md">
             <div className="flex items-center justify-between pl-1">
               <div className="flex items-center gap-2"><Cpu size={14} className="text-yellow-500 shrink-0" /><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Engine</span></div>
               {state.selectedModel === 'ling-v3' && (<button onClick={async () => await (window as any).aistudio.openSelectKey()} className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-md border border-yellow-500/20 text-[7px] font-bold uppercase tracking-widest animate-pulse"><Key size={10} /> Active Key Required</button>)}
             </div>
             <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
               {(['gemini', 'gpt', 'grok', 'claude', 'stable-diffusion', 'ling-v3'] as AIModelId[]).map(id => (
                 <button key={id} onClick={() => setState(prev => ({ ...prev, selectedModel: id }))} title={`${MODEL_METADATA[id].description} ${MODEL_METADATA[id].specialty}`} className={`px-4 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all border shrink-0 flex items-center justify-center gap-2 relative ${state.selectedModel === id ? `bg-black text-white border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]` : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'}`}>
                   <div className={`w-2 h-2 rounded-full ${MODEL_METADATA[id].color}`}></div>{MODEL_METADATA[id].label}
                   {state.selectedModel === id && (<div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-black border border-black ${MODEL_METADATA[id].color}`}>{MODEL_METADATA[id].icon}</div>)}
                 </button>
               ))}
             </div>
             <div className={`flex items-start gap-2 p-3 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-1 ${state.selectedModel ? 'bg-white/5 border-white/10' : 'opacity-0'}`}>
                <div className={`p-1.5 rounded-lg mt-0.5 ${MODEL_METADATA[state.selectedModel].color} text-black`}>{MODEL_METADATA[state.selectedModel].icon}</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-white uppercase tracking-widest">{MODEL_METADATA[state.selectedModel].description}</span><div className={`w-1 h-1 rounded-full ${MODEL_METADATA[state.selectedModel].color} animate-pulse`}></div></div>
                  <span className="text-[9px] text-gray-500 leading-tight mt-0.5">{MODEL_METADATA[state.selectedModel].specialty}</span>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-[11px] leading-relaxed space-y-4 ${msg.role === 'user' ? 'bg-yellow-500 text-black font-semibold rounded-tr-none shadow-lg' : 'bg-white/5 text-gray-300 border border-white/10 rounded-tl-none'}`}>
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  {msg.image && <img src={msg.image} alt="AI Generated" className="w-full rounded-xl border border-white/10 shadow-2xl" />}
                  {msg.video && <video controls src={msg.video} className="w-full rounded-xl border border-white/10 shadow-2xl" />}
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest">Grounding Citations</span>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.sources.map((src, i) => (
                          <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="p-1 bg-yellow-500/20 rounded text-yellow-500 shrink-0">
                                {src.uri.includes('google.com/maps') ? <MapPin size={10} /> : <ExternalLink size={10} />}
                              </div>
                              <span className="text-[9px] text-gray-400 font-medium truncate group-hover:text-white transition-colors">{src.title || 'View Source'}</span>
                            </div>
                            <ChevronUp size={10} className="rotate-90 text-gray-600 group-hover:text-yellow-500 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isFrankThinking && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-[1.5rem] rounded-tl-none flex flex-col gap-3 max-w-[85%]">
                  <div className="flex gap-2 items-center">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-[8px] font-bold text-yellow-500/50 uppercase tracking-[0.2em]">{frankThinkingStep}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-black border-t border-white/5 shrink-0">
            <div className="relative flex items-center gap-2">
              <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isListening ? "Listening..." : `Prompt ${MODEL_METADATA[state.selectedModel].label}...`} className={`flex-1 bg-white/5 border border-white/10 rounded-full py-4 px-5 text-xs outline-none focus:border-yellow-500/50 transition-all ${isListening ? 'border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.1)]' : ''}`} />
              <button onClick={toggleListening} className={`p-4 rounded-full transition-all flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-gray-400'}`} title="Voice Recognition">{isListening ? <MicOff size={18} /> : <Mic size={18} />}</button>
              <button onClick={handleSendMessage} disabled={!userInput.trim() || isFrankThinking} className="p-4 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center" title="Send Message"><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {isVoiceActive && <FrankVoiceCall onClose={() => setIsVoiceActive(false)} />}
    </div>
  );
};

export default App;
