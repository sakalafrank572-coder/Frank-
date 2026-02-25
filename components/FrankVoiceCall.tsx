
import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, PhoneOff, Sparkles } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import FrankRobot from './FrankRobot';

interface FrankVoiceCallProps {
  onClose: () => void;
}

const FrankVoiceCall: React.FC<FrankVoiceCallProps> = ({ onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Connecting...');
  const [visualizerHeight, setVisualizerHeight] = useState<number[]>(new Array(16).fill(10));
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    let scriptProcessor: ScriptProcessorNode | null = null;
    let microphoneStream: MediaStream | null = null;

    const startSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setStatus('Frank is listening...');
              const source = audioContextRef.current!.createMediaStreamSource(microphoneStream!);
              scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                if (isMuted) return;
                const inputData = e.inputBuffer.getChannelData(0);
                
                const avg = inputData.reduce((a, b) => a + Math.abs(b), 0) / inputData.length;
                setVisualizerHeight(prev => prev.map(() => 8 + avg * 300));

                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current!.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio) {
                setIsSpeaking(true);
                const ctx = outputContextRef.current!;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsSpeaking(false);
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
                setStatus('Frank is speaking...');
              }
              
              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
              }

              if (message.serverContent?.turnComplete) {
                 setStatus('Frank is listening...');
              }
            },
            onerror: (e) => console.error('Voice Session Error:', e),
            onclose: () => setStatus('Connection Closed'),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are Frank, an elegant and professional design expert from GRAND X AI. You are part of an exclusive partnership between Google Gemini and the visionary CEO, Frank. You are having a voice call with a client on their phone. Be helpful, concise, and professional.',
          },
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error('Failed to start voice call:', err);
        setStatus('Failed to connect.');
      }
    };

    startSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (scriptProcessor) scriptProcessor.disconnect();
      if (microphoneStream) microphoneStream.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (outputContextRef.current) outputContextRef.current.close();
    };
  }, []);

  function decode(base64: string) { const binary = atob(base64); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i); return bytes; }
  function encode(bytes: Uint8Array) { let binary = ''; for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]); return btoa(binary); }
  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }
  function createBlob(data: Float32Array): { data: string; mimeType: string } { const int16 = new Int16Array(data.length); for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768; return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000', }; }

  return (
    <div className="fixed inset-0 z-[100] bg-black backdrop-blur-3xl flex flex-col items-center justify-between p-12 py-20 animate-in fade-in duration-700">
      {/* Floating Particles */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {new Array(20).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-yellow-500 rounded-full animate-float"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`, 
              width: `${2 + Math.random() * 3}px`, 
              height: `${2 + Math.random() * 3}px`,
              animationDuration: `${4 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="flex flex-col items-center space-y-6 relative z-10 w-full">
        <div className="relative inline-block">
          <div className="ripple opacity-30" style={{ animationDelay: '0s' }}></div>
          <div className="ripple opacity-20" style={{ animationDelay: '1.5s' }}></div>
          
          <div className="relative z-20 animate-float">
             <FrankRobot size="large" speaking={isSpeaking} />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="luxury-text text-3xl font-bold tracking-[0.2em] text-white uppercase shimmer-text pl-[0.2em]">Frank X</h2>
          <p className="text-yellow-500 font-bold tracking-[0.4em] text-[8px] uppercase animate-pulse pl-[0.4em]">{status}</p>
        </div>
      </div>

      <div className="w-full space-y-12 relative z-10 flex flex-col items-center">
        {/* Visualizer */}
        <div className="flex items-end justify-center gap-1 h-16 w-full max-w-[200px]">
          {visualizerHeight.map((h, i) => (
            <div 
              key={i} 
              className="flex-1 bg-yellow-500/80 rounded-full transition-all duration-100"
              style={{ height: `${Math.max(4, h)}px` }}
            ></div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-8">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-6 rounded-full border transition-all active:scale-90 flex items-center justify-center ${isMuted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-white'}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
            onClick={onClose}
            className="p-8 bg-red-600 rounded-full text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] active:scale-95 transition-all flex items-center justify-center"
          >
            <PhoneOff size={32} />
          </button>
        </div>
      </div>

      <div className="absolute top-10 right-8">
        <button onClick={onClose} className="p-3 bg-white/5 rounded-full border border-white/10 active:scale-90">
          <X size={18} />
        </button>
      </div>

      <div className="text-[7px] text-gray-700 font-bold uppercase tracking-[0.8em] shimmer-text pl-[0.8em]">
        Secure Intelligence Protocol
      </div>
    </div>
  );
};

export default FrankVoiceCall;
