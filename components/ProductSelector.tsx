
import React from 'react';
import { ProductType } from '../types';
import { Shirt, ShoppingBag, Coffee, GraduationCap, Image as ImageIcon, Briefcase, Smartphone, StickyNote, Smile } from 'lucide-react';

interface ProductSelectorProps {
  selected: ProductType;
  onSelect: (product: ProductType) => void;
}

const products: { id: ProductType; label: string; icon: React.ReactNode }[] = [
  { id: 't-shirt', label: 'PREMIUM TEE', icon: <Shirt size={18} /> },
  { id: 'hoodie', label: 'HEAVY HOODIE', icon: <Shirt size={18} className="rotate-3" /> },
  { id: 'tote-bag', label: 'CANVAS TOTE', icon: <ShoppingBag size={18} /> },
  { id: 'mug', label: 'CERAMIC MUG', icon: <Coffee size={18} /> },
  { id: 'cap', label: 'STREET CAP', icon: <GraduationCap size={18} /> },
  { id: 'hat', label: 'CLASSIC HAT', icon: <GraduationCap size={18} className="-rotate-12" /> },
  { id: 'phone-case', label: 'PHONE CASE', icon: <Smartphone size={18} /> },
  { id: 'sticker', label: 'BRAND STICKER', icon: <StickyNote size={18} /> },
  { id: 'poster', label: 'GALLERY PRINT', icon: <ImageIcon size={18} /> },
];

const ProductSelector: React.FC<ProductSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2. Select Canvas</label>
        <Briefcase size={14} className="text-yellow-500" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
              selected === p.id
                ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_20px_rgba(255,215,0,0.15)]'
                : 'bg-white/2 border-white/5 text-gray-500 hover:border-white/10 hover:bg-white/5'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${
              selected === p.id ? 'bg-black/10 text-black' : 'bg-white/5 text-gray-600 group-hover:text-gray-300'
            }`}>
              {p.icon}
            </div>
            <span className="text-[10px] font-bold tracking-widest leading-none">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSelector;
