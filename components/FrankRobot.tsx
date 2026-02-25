
import React from 'react';
import { AIModelId } from '../types';

interface FrankRobotProps {
  size?: 'small' | 'medium' | 'large';
  speaking?: boolean;
  modelId?: AIModelId;
}

const MODEL_COLORS: Record<AIModelId, string> = {
  'gemini': 'from-blue-500 via-blue-400 to-blue-600',
  'gpt': 'from-emerald-500 via-emerald-400 to-emerald-600',
  'grok': 'from-orange-500 via-orange-400 to-orange-600',
  'claude': 'from-purple-500 via-purple-400 to-purple-600',
  'stable-diffusion': 'from-pink-500 via-pink-400 to-pink-600',
  'ling-v3': 'from-yellow-500 via-yellow-400 to-yellow-600'
};

const EYE_COLORS: Record<AIModelId, string> = {
  'gemini': 'bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.8)]',
  'gpt': 'bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]',
  'grok': 'bg-orange-300 shadow-[0_0_8px_rgba(253,186,116,0.8)]',
  'claude': 'bg-purple-300 shadow-[0_0_8px_rgba(196,181,253,0.8)]',
  'stable-diffusion': 'bg-pink-300 shadow-[0_0_8px_rgba(249,168,212,0.8)]',
  'ling-v3': 'bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.8)]'
};

const FrankRobot: React.FC<FrankRobotProps> = ({ size = 'medium', speaking = false, modelId = 'gemini' }) => {
  const baseSize = size === 'small' ? 40 : size === 'medium' ? 64 : 160;
  const scale = size === 'small' ? 0.4 : size === 'medium' ? 0.6 : 1.5;

  return (
    <div 
      className="relative flex items-center justify-center transition-all duration-500" 
      style={{ width: baseSize, height: baseSize }}
    >
      <div className="robot-head relative flex flex-col items-center justify-center" style={{ transform: `scale(${scale})` }}>
        {/* Antenna */}
        <div className="w-1 h-6 bg-gray-600 rounded-full mb-[-2px]"></div>
        <div className={`antenna-light w-4 h-4 rounded-full mb-[-4px] transition-colors duration-500 ${EYE_COLORS[modelId]}`}></div>
        
        {/* Head Base */}
        <div className={`w-24 h-20 bg-gradient-to-br transition-all duration-500 ${MODEL_COLORS[modelId]} rounded-[2rem] border-2 border-black/20 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden`}>
          {/* Face Panel */}
          <div className="w-[85%] h-[75%] bg-black/80 rounded-2xl flex flex-col items-center justify-center gap-2 p-2 relative">
            {/* Eyes Container with Scanning Animation */}
            <div className="robot-eye-container flex gap-4 items-center justify-center">
              <div className={`robot-eye w-4 h-4 rounded-full transition-all duration-500 ${EYE_COLORS[modelId]}`}></div>
              <div className={`robot-eye w-4 h-4 rounded-full transition-all duration-500 ${EYE_COLORS[modelId]}`}></div>
            </div>
            
            {/* Mouth / Equalizer bars */}
            <div className="h-4 flex items-center justify-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-300 ${EYE_COLORS[modelId]} ${speaking ? 'animate-equalizer' : 'h-1 opacity-20'}`}
                  style={{ 
                    animationDelay: speaking ? `${i * 0.1}s` : '0s',
                    height: speaking ? undefined : '2px'
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Reflection */}
          <div className="absolute top-1 left-4 w-8 h-4 bg-white/20 rounded-full blur-[2px] -rotate-12"></div>
        </div>

        {/* Neck / Body Top */}
        <div className="w-8 h-4 bg-gray-800 rounded-b-lg -mt-1 shadow-lg"></div>
        
        {/* Glow Effect under robot */}
        <div className={`absolute -bottom-10 w-16 h-4 blur-xl rounded-full opacity-30 ${EYE_COLORS[modelId]}`}></div>
      </div>
    </div>
  );
};

export default FrankRobot;
