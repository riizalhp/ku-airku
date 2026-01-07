import React from 'react';
import { formatCapacity } from '../../services/capacityApiService';

interface CapacityIndicatorProps {
  used: number;
  total: number;
  className?: string;
  showDetails?: boolean;
}

export const CapacityIndicator: React.FC<CapacityIndicatorProps> = ({ 
  used, 
  total, 
  className = '',
  showDetails = true 
}) => {
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0;
  const remaining = total - used;

  const getBarColor = () => {
    if (percentage <= 60) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    if (percentage <= 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (percentage <= 60) return 'text-green-700';
    if (percentage <= 80) return 'text-yellow-700';
    if (percentage <= 100) return 'text-orange-700';
    return 'text-red-700';
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {showDetails && (
        <div className="flex justify-between text-xs font-medium text-gray-600">
          <span>Kapasitas</span>
          <span className={getTextColor()}>
            {formatCapacity(used)} / {total} ({percentage}%)
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className={`h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {percentage > 15 && `${percentage}%`}
        </div>
      </div>

      {showDetails && (
        <div className="text-xs text-gray-500">
          {remaining >= 0 ? (
            <span>✅ Sisa: <strong>{formatCapacity(remaining)}</strong></span>
          ) : (
            <span className="text-red-600">❌ Kelebihan: <strong>{formatCapacity(Math.abs(remaining))}</strong></span>
          )}
        </div>
      )}
    </div>
  );
};
