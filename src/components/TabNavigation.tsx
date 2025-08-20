import React from 'react';
import { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'all' as const, label: '全やること' },
    { key: 'week' as const, label: '今週やること' },
    { key: 'today' as const, label: '今日やること' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <nav className="flex space-x-1 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`
              py-3 px-6 text-sm font-medium border-b-2 transition-colors duration-200
              ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;