import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronUp, Calendar, Clock, Zap, BarChart2, Trophy, Target, ArrowUpRight, ArrowDownRight, EyeOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface FocusStatsProps {
  timeFilter: 'Week' | 'Month';
  onFilterChange: (filter: 'Week' | 'Month') => void;
}

const FocusStats: React.FC<FocusStatsProps> = ({ timeFilter, onFilterChange }) => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'overview' | 'details'>('overview');
  
  // 周数据
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const weekData = [65, 85, 55, 75, 45, 25, 15]; // 百分比
  const weekColors = weekData.map(value => 
    value > 70 ? 'bg-green-500' : value > 40 ? 'bg-primary' : 'bg-primary/50'
  );
  
  // 月数据
  const monthWeeks = ['第1周', '第2周', '第3周', '第4周'];
  const monthData = [45, 60, 30, 55]; // 百分比
  const monthColors = monthData.map(value => 
    value > 70 ? 'bg-green-500' : value > 40 ? 'bg-primary' : 'bg-primary/50'
  );
  
  // 统计数据
  const stats = {
    hoursFocused: timeFilter === 'Week' ? 12.5 : 42.3,
    sessions: timeFilter === 'Week' ? 28 : 84,
    tasksCompleted: timeFilter === 'Week' ? 15 : 47,
    streak: 4,
    improvement: timeFilter === 'Week' ? '+15%' : '+8%',
    distractionRate: timeFilter === 'Week' ? '-12%' : '-5%',
    focusScore: 78,
    topTechnique: '番茄工作法',
    topDay: timeFilter === 'Week' ? '周三' : '星期五'
  };
  
  // 分散注意力因素和时间分布
  const distractions = [
    { name: '社交媒体', percentage: 35 },
    { name: '噪音干扰', percentage: 25 },
    { name: '疲劳', percentage: 20 },
    { name: '其他', percentage: 20 }
  ];
  
  const timeDistribution = [
    { time: '早晨 (6-10点)', percentage: 40 },
    { time: '中午 (10-14点)', percentage: 25 },
    { time: '下午 (14-18点)', percentage: 20 },
    { time: '晚上 (18-22点)', percentage: 15 }
  ];
  
  // 分享统计数据
  const handleShareStats = () => {
    toast({
      title: "统计数据已复制",
      description: "你的专注统计数据已复制到剪贴板，可以分享给朋友或社区",
    });
  };
  
  const currentData = timeFilter === 'Week' ? {
    labels: weekDays,
    data: weekData,
    colors: weekColors
  } : {
    labels: monthWeeks,
    data: monthData,
    colors: monthColors
  };
  
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
      <div className="p-4 border-b border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-neutral-800">专注统计</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'overview' | 'details')} className="w-[160px]">
              <TabsList className="grid grid-cols-2 h-8">
                <TabsTrigger value="overview" className="text-xs py-1 px-2">概览</TabsTrigger>
                <TabsTrigger value="details" className="text-xs py-1 px-2">详细</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex space-x-1">
              <Button
                variant={timeFilter === 'Week' ? "default" : "outline"}
                size="sm"
                className="rounded-l-md rounded-r-none h-8 px-3"
                onClick={() => onFilterChange('Week')}
              >
                周
              </Button>
              <Button
                variant={timeFilter === 'Month' ? "default" : "outline"}
                size="sm"
                className="rounded-r-md rounded-l-none h-8 px-3"
                onClick={() => onFilterChange('Month')}
              >
                月
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 概览视图 */}
      {activeView === 'overview' && (
        <div className="p-4">
          {/* 图表 */}
          <div className="mb-6 h-36 sm:h-48 flex items-end space-x-0.5 sm:space-x-1">
            {currentData.labels.map((label, index) => (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div 
                  className={`${currentData.colors[index]} w-full rounded-t transition-all duration-500`} 
                  style={{ height: `${currentData.data[index]}%` }}
                ></div>
                <span className="text-[8px] sm:text-xs text-neutral-500 mt-1 truncate max-w-full">{label}</span>
              </div>
            ))}
          </div>
          
          {/* 主要统计信息 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
            <div className="bg-neutral-50 rounded-lg p-2 sm:p-3 text-center">
              <div className="flex justify-center mb-1">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="text-base sm:text-xl font-semibold text-neutral-800">{stats.hoursFocused}</div>
              <div className="text-[10px] sm:text-xs text-neutral-500">专注小时</div>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-2 sm:p-3 text-center">
              <div className="flex justify-center mb-1">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              </div>
              <div className="text-base sm:text-xl font-semibold text-neutral-800">{stats.sessions}</div>
              <div className="text-[10px] sm:text-xs text-neutral-500">专注会话</div>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-2 sm:p-3 text-center">
              <div className="flex justify-center mb-1">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
              <div className="text-base sm:text-xl font-semibold text-neutral-800">{stats.focusScore}</div>
              <div className="text-[10px] sm:text-xs text-neutral-500">专注分数</div>
            </div>
          </div>
          
          {/* 次要统计信息 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div className="flex items-center justify-between border border-neutral-100 rounded-md p-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-neutral-500 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm">连续专注天数</span>
              </div>
              <span className="font-medium text-xs sm:text-sm">{stats.streak}天</span>
            </div>
            
            <div className="flex items-center justify-between border border-neutral-100 rounded-md p-2">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-neutral-500 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm">完成任务数</span>
              </div>
              <span className="font-medium text-xs sm:text-sm">{stats.tasksCompleted}</span>
            </div>
            
            <div className="flex items-center justify-between border border-neutral-100 rounded-md p-2">
              <div className="flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm">专注时间提升</span>
              </div>
              <span className="font-medium text-xs sm:text-sm text-green-500">{stats.improvement}</span>
            </div>
            
            <div className="flex items-center justify-between border border-neutral-100 rounded-md p-2">
              <div className="flex items-center">
                <ArrowDownRight className="h-4 w-4 text-green-500 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm">分心率下降</span>
              </div>
              <span className="font-medium text-xs sm:text-sm text-green-500">{stats.distractionRate}</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={handleShareStats}>
              分享我的专注统计
            </Button>
          </div>
        </div>
      )}
      
      {/* 详细视图 */}
      {activeView === 'details' && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {/* 最佳表现 */}
            <Card className="shadow-none">
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 text-amber-500 mr-1.5" />
                  专注表现
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm space-y-2 pt-0 px-3 pb-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">最佳专注日</span>
                  <span className="font-medium">{stats.topDay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">平均专注时长</span>
                  <span className="font-medium">{(stats.hoursFocused / stats.sessions).toFixed(1)}小时/次</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">常用专注技术</span>
                  <span className="font-medium">{stats.topTechnique}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* 分散注意力因素 */}
            <Card className="shadow-none">
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <EyeOff className="h-4 w-4 text-red-500 mr-1.5" />
                  分心因素分析
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm space-y-2.5 pt-0 px-3 pb-3">
                {distractions.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{item.name}</span>
                      <span className="text-neutral-500 text-[10px] sm:text-xs">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* 专注时间分布 */}
            <Card className="shadow-none sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                  <BarChart2 className="h-4 w-4 text-blue-500 mr-1.5" />
                  专注时间分布
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm space-y-2.5 pt-0 px-3 pb-3">
                {timeDistribution.map((item) => (
                  <div key={item.time} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{item.time}</span>
                      <span className="text-neutral-500 text-[10px] sm:text-xs">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-3 text-xs sm:text-sm text-neutral-500 border-t border-neutral-100 pt-3 text-center">
            <p>基于你的ADHD特征，建议在早晨专注能力高峰期安排重要任务，分解任务以保持动力</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusStats;
