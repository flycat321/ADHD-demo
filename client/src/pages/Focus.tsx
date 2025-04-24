import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/store";
import FocusTimer from "@/components/focus/FocusTimer";
import TaskCard from "@/components/focus/TaskCard";
import TechniqueCard from "@/components/focus/TechniqueCard";
import FocusStats from "@/components/focus/FocusStats";
import TaskBreakdown from "@/components/focus/TaskBreakdown";
import { Task } from "@shared/schema";
import { 
  Braces, 
  Brain, 
  Clock, 
  FlaskConical, 
  ListChecks, 
  MoveRight, 
  Pause, 
  Timer, 
  Zap,
  Plus,
  BarChart2,
  Star,
  Lightbulb,
  Info
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// ADHD专注提示组件
const FocusTip = () => {
  const tips = [
    "尝试使用环境声音（如咖啡厅噪音）提高ADHD大脑的专注度",
    "正念练习可以帮助ADHD患者提高注意力调节能力",
    "多巴胺奖励对ADHD大脑很重要，设置小目标并庆祝每个胜利",
    "为专注活动创建明确的开始和结束仪式，帮助大脑进入状态",
    "身体活动可以提高ADHD大脑的认知功能，尝试专注前短暂运动"
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 flex items-start">
      <Lightbulb className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
      <div>
        <div className="font-medium text-sm mb-1">ADHD专注提示</div>
        <p className="text-xs text-amber-700">{randomTip}</p>
      </div>
    </div>
  );
};

// 推荐任务组件
const RecommendedTask = () => {
  const { toast } = useToast();
  
  const handleStartTask = () => {
    toast({
      title: "已添加到任务列表",
      description: "推荐任务已添加到你的专注任务列表中"
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">今日推荐任务</CardTitle>
            <CardDescription>基于你的ADHD特征和当前状态推荐</CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            高效专注时段
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">数据分析任务</h4>
              <p className="text-sm text-muted-foreground">
                安排在你最佳专注时间 (9:00-11:00)
              </p>
            </div>
          </div>
          
          <div className="text-sm text-neutral-600 border-l-2 border-primary/20 pl-3">
            现在是你专注力高峰期，适合处理需要深度思考的任务。将任务分解为25分钟小段，提高完成效率。
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartTask} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          添加到我的任务
        </Button>
      </CardFooter>
    </Card>
  );
};

const Focus: React.FC = () => {
  const { currentUser } = useStore();
  const { toast } = useToast();
  const userId = currentUser?.id || 1; // Default to 1 for demo purposes
  const [timeFilter, setTimeFilter] = useState<"Week" | "Month">("Week");
  const [activeTab, setActiveTab] = useState("timer");
  const [showADHDInfo, setShowADHDInfo] = useState(false);

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { userId }],
  });

  // 基于科学研究的ADHD专注技术
  const focusTechniques = [
    {
      id: 1,
      name: "番茄工作法",
      description: "专注工作25分钟，然后休息5分钟。完成4个循环后，休息较长时间。适合ADHD患者的注意力周期。",
      icon: Timer,
      iconColor: "bg-red-50 text-red-500",
    },
    {
      id: 2,
      name: "身体替身",
      description: "与他人一起工作（虚拟或面对面），通过社交责任感提高专注力和任务完成率。",
      icon: Zap,
      iconColor: "bg-purple-50 text-purple-500",
    },
    {
      id: 3,
      name: "任务分拆",
      description: "将大型复杂任务分解为更小、更具体的步骤，减轻执行功能负担，增强成就感。",
      icon: Braces,
      iconColor: "bg-blue-50 text-blue-500",
    },
    {
      id: 4,
      name: "环境调整",
      description: "创建低刺激环境，消除潜在干扰源，或使用白噪音屏蔽分散注意力的声音。",
      icon: FlaskConical,
      iconColor: "bg-green-50 text-green-500",
    },
    {
      id: 5,
      name: "意识休息法",
      description: "定期短暂休息，进行深呼吸或简短冥想，重置注意力并减少过度刺激。",
      icon: Brain,
      iconColor: "bg-amber-50 text-amber-500",
    },
    {
      id: 6,
      name: "前进动量法",
      description: "为任务设定最低起点门槛（仅工作2分钟），利用开始后的动量继续前进。",
      icon: MoveRight,
      iconColor: "bg-indigo-50 text-indigo-500",
    },
    {
      id: 7,
      name: "计划—暂停—执行",
      description: "执行任务前停下来规划策略，设定清晰目标，然后再开始行动。",
      icon: Pause,
      iconColor: "bg-orange-50 text-orange-500",
    },
  ];

  // 获取未完成任务
  const incompleteTasks = tasks?.filter(task => !task.completed) || [];
  const currentFocusTask = incompleteTasks[0] || null;

  return (
    <div className="p-4 pb-20 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">专注工具</h1>
          <p className="text-sm text-muted-foreground mt-1">为ADHD大脑定制的专注力辅助工具</p>
        </div>
        
        <Dialog open={showADHDInfo} onOpenChange={setShowADHDInfo}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">ADHD与专注力</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>ADHD与专注力</DialogTitle>
              <DialogDescription>
                了解注意力缺陷过动障碍(ADHD)如何影响专注力和工作能力
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-primary" />
                  为什么ADHD影响专注力?
                </h3>
                <p className="text-sm text-neutral-600">
                  ADHD是一种神经发育障碍，会影响前额叶皮质的功能，这个区域负责执行功能，包括专注力、组织能力和情绪调节。ADHD患者大脑中的多巴胺和去甲肾上腺素水平往往不足，这些神经递质对维持注意力和控制冲动至关重要。
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-amber-500" />
                  ADHD大脑的专注特点
                </h3>
                <ul className="text-sm text-neutral-600 space-y-2">
                  <li className="flex items-start">
                    <span className="bg-neutral-200 rounded-full w-4 h-4 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    <span><strong>超专注状态:</strong> 在感兴趣的活动上可能出现过度专注(hyperfocus)，但在其他任务上难以保持注意力</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-neutral-200 rounded-full w-4 h-4 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    <span><strong>工作记忆受限:</strong> 难以在脑中同时处理多个信息，容易忘记指令或任务细节</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-neutral-200 rounded-full w-4 h-4 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    <span><strong>时间知觉模糊:</strong> 难以准确感知时间流逝，导致拖延或时间管理困难</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-neutral-200 rounded-full w-4 h-4 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                    <span><strong>执行功能障碍:</strong> 启动任务、设定优先级和完成任务的困难</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                  专注工具如何帮助
                </h3>
                <p className="text-sm text-neutral-600">
                  我们的专注工具基于认知行为疗法和ADHD研究设计，提供结构化的时间管理、任务分解和专注技术，帮助ADHD大脑克服执行功能障碍，建立适合的工作习惯，充分发挥潜能。
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setShowADHDInfo(false)}>了解了</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <FocusTip />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <FocusTimer currentTask={currentFocusTask} />
          <TaskBreakdown tasks={tasks || []} isLoading={tasksLoading} />
          <FocusStats timeFilter={timeFilter} onFilterChange={setTimeFilter} />
        </div>

        <div className="space-y-6">
          <RecommendedTask />
          <FocusTip />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">专注技巧库</CardTitle>
              <CardDescription>科学验证的ADHD专注策略</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {focusTechniques.map((tech) => (
                <TechniqueCard key={tech.id} technique={tech} isApplied={tech.id === 1} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Focus;
