import React from 'react';
import { User } from '../types';

interface UserCardProps {
  user: User;
  index: number;
}

const COLORS = [
  '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#14B8A6'
];

const getInitials = (name: string): string => {
  const nameParts = name.trim().split(' ');
  if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UserCard: React.FC<UserCardProps> = ({ user, index }) => {
  const avatarColor = COLORS[index % COLORS.length];

  const votesCasted = [];
  if (user.poll1) votesCasted.push('poll1');
  if (user.poll2) votesCasted.push('poll2');

  const hasVotedInTwoPolls = votesCasted.length >= 2;

  const cardClasses = `
    bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-lg 
    transition-all duration-300 transform hover:-translate-y-1 
    flex flex-col text-center h-full
    ${hasVotedInTwoPolls
      ? 'border-2 border-green-500'
      : 'border border-gray-700/50 hover:border-indigo-500/50'
    }
  `;

  return (
    <div className={cardClasses}>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 flex-shrink-0 mx-auto"
        style={{ backgroundColor: avatarColor }}
      >
        {getInitials(user.name)}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-white truncate w-full">{user.name}</h3>
        <p className="text-indigo-300 text-sm mb-2">{user.department}</p>
        <p className="text-sm font-mono text-gray-400">{user.username}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-gray-700/50 w-full">
        <p className="text-xs text-gray-400 mb-2">Voting Status</p>
        <div className="flex justify-center items-center space-x-2 h-6">
          {votesCasted.length > 0 ? (
            votesCasted.map((voteKey) => <CheckIcon key={voteKey} />)
          ) : (
            <p className="text-sm text-gray-500">No votes cast</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;