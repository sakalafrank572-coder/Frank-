
import React, { useRef } from 'react';
import { Upload, X, ShieldCheck } from 'lucide-react';

interface LogoUploaderProps {
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ logo, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">1. Brand Identity</label>
        {logo && <ShieldCheck size={14} className="text-yellow-500" />}
      </div>
      {logo ? (
        <div className="relative group rounded-3xl overflow-hidden border border-yellow-500/30 bg-yellow-500/5 aspect-video flex items-center justify-center p-4 backdrop-blur-sm transition-all hover:border-yellow-500/60 shadow-inner">
          <img src={logo} alt="Uploaded logo" className="max-w-full max-h-full object-contain filter drop-shadow-xl" />
          <button
            onClick={() => onLogoChange(null)}
            className="absolute top-3 right-3 p-2 bg-black/80 text-white rounded-full shadow-xl transition-all border border-white/10 active:scale-90"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-3 left-4 text-[8px] font-bold text-yellow-500/50 uppercase tracking-widest">
            Identity Verified
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-white/5 hover:border-yellow-500/40 bg-white/2 hover:bg-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all group relative overflow-hidden active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:text-yellow-500">
            <Upload size={20} />
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Upload Logo</span>
            <span className="block text-[7px] text-gray-600 font-medium tracking-[0.2em] mt-1">SVG, PNG or AI</span>
          </div>
          <div className="absolute inset-0 shimmer opacity-10 pointer-events-none"></div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </button>
      )}
    </div>
  );
};

export default LogoUploader;
