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

const UserCard: React.FC<UserCardProps> = ({ user, index }) => {
  const avatarColor = COLORS[index % COLORS.length];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 flex-shrink-0"
        style={{ backgroundColor: avatarColor }}
      >
        {getInitials(user.name)}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-white truncate w-full">{user.name}</h3>
        <p className="text-indigo-300 text-sm mb-2">{user.department}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700/50 w-full">
        <p className="text-xs text-gray-400">Username</p>
        <p className="text-sm font-mono text-gray-300">{user.username}</p>
      </div>
    </div>
  );
};

export default UserCard;