import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingItem {
  title: string;
  description: string;
}

const SettingsSection: React.FC = () => {
  const settings: SettingItem[] = [
    {
      title: '通知偏好',
      description: '管理如何以及何时接收提醒'
    },
    {
      title: '外观',
      description: '自定义颜色和对比度设置'
    },
    {
      title: '隐私设置',
      description: '控制数据和共享偏好'
    }
  ];
  
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-800 mb-3">应用设置</h2>
      
      <div className="space-y-4">
        {settings.map((setting, index) => (
          <div key={index} className="flex items-center justify-between cursor-pointer hover:bg-neutral-50 p-2 rounded-lg transition-colors">
            <div>
              <h3 className="font-medium text-neutral-800">{setting.title}</h3>
              <p className="text-sm text-neutral-600">{setting.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsSection;
