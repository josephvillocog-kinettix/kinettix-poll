import React from 'react';
import { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  disabled: boolean;
  index: number;
}

const GRADIENTS = [
  'from-purple-600 to-indigo-600',
  'from-red-500 to-orange-500',
  'from-green-500 to-teal-500',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-yellow-400 to-amber-500',
  'from-indigo-500 to-violet-600',
  'from-lime-400 to-green-600',
];


const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isSelected, onSelect, disabled, index }) => {
  const gradientClass = GRADIENTS[index % GRADIENTS.length];
  const isClickable = !disabled && onSelect;
  
  const baseClasses = `relative rounded-lg overflow-hidden group transform transition-all duration-300 ease-in-out shadow-lg bg-gradient-to-br ${gradientClass} aspect-square flex items-center justify-center p-4 text-center ${isClickable ? 'cursor-pointer' : 'cursor-default'}`;
  const stateClasses = isSelected
    ? 'ring-4 ring-offset-2 ring-offset-gray-900 ring-red-500 scale-105'
    : `ring-2 ring-transparent ${isClickable ? 'hover:scale-105 hover:shadow-2xl hover:ring-red-400' : ''} ${disabled ? 'opacity-60' : ''}`;
  
  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      onClick={() => isClickable && onSelect(candidate.id)}
      role={isClickable ? "button" : undefined}
      aria-pressed={isClickable ? isSelected : undefined}
      tabIndex={isClickable ? 0 : -1}
    >
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
      <h3 className="relative text-white text-2xl md:text-3xl font-bold break-words tracking-tight">{candidate.name}</h3>
    </div>
  );
};

export default CandidateCard;
