import React from 'react';
import { Brain } from 'lucide-react';
import type { MediaItem } from '../../types';

interface InsightFactor {
  description: string;
  score: number;
}

interface InsightDetail {
  type: 'content' | 'social' | 'personal';
  factors: InsightFactor[];
}

interface InsightData {
  primary: string;
  details: InsightDetail[];
}

interface InsightProps {
  item: MediaItem;
  insights: InsightData;
}

export const PersonalizedInsights: React.FC<InsightProps> = ({ item: _, insights }) => {
  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-6 w-6 text-purple-500" />
        <h3 className="text-lg font-semibold text-white">Why We Think You'll Like This</h3>
      </div>
      
      <p className="text-gray-300 mb-4">{insights.primary}</p>
      
      <div className="space-y-4">
        {insights.details.map((detail, index) => (
          <div key={index} className="border-t border-white/10 pt-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              {detail.type === 'content' ? 'Content Match' : 
               detail.type === 'social' ? 'Social Proof' : 
               'Personal Factors'}
            </h4>
            <ul className="space-y-2">
              {detail.factors.map((factor, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${factor.score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-300">{factor.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}