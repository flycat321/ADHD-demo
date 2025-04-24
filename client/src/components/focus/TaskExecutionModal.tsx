import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Star,
  Hourglass,
  Award,
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useStore } from "@/store";
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface TaskStep {
  description: string;
  estimatedDuration: number;
  isCompleted: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  steps: TaskStep[];
  priority: string;
  estimatedDuration: number;
  totalPoints: number;
}

interface TaskExecutionModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

// 鼓励消息
const encouragingMessages = [
  "你太棒了！原来你没有完成不了的任务！",
  "了不起！每一步的坚持都在改变你的大脑！",
  "真厉害！你已经战胜了ADHD的执行功能障碍！",
  "哇！看看你做到了什么！继续保持这股动力！",
  "惊人的成就！你的专注力正在变得更强！",
  "太赞了！你正在形成新的神经通路！",
  "成功！你的大脑正在学习如何更好地运作！",
  "太给力了！你已经证明ADHD不能阻止你的成功！"
];

// 随机选择鼓励消息
const getRandomMessage = () => {
  return encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
};

// 任务执行组件
const TaskExecutionModal: React.FC<TaskExecutionModalProps> = ({ 
  task, 
  open, 
  onOpenChange,
  onComplete 
}) => {
  const { currentUser } = useStore();
  const { toast } = useToast();
  const userId = currentUser?.id;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDelayed, setIsDelayed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [encourageMessage, setEncourageMessage] = useState('');
  
  const audioSuccessRef = useRef<HTMLAudioElement | null>(null);
  const audioAlertRef = useRef<HTMLAudioElement | null>(null);
  const audioCompleteRef = useRef<HTMLAudioElement | null>(null);
  
  // 初始化当前步骤时间
  useEffect(() => {
    if (task && task.steps && task.steps.length > currentStepIndex) {
      setTimeRemaining(task.steps[currentStepIndex].estimatedDuration * 60);
    }
  }, [task, currentStepIndex]);
  
  // 倒计时逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          // 当剩余时间为60秒时播放提示音
          if (prevTime === 60 && audioAlertRef.current) {
            audioAlertRef.current.play().catch(err => console.error("播放提示音失败:", err));
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      setIsTimerActive(false);
      setIsDelayed(true);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeRemaining]);
  
  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 开始当前步骤计时
  const startCurrentStep = () => {
    setIsTimerActive(true);
    setIsDelayed(false);
  };
  
  // 暂停当前步骤计时
  const pauseCurrentStep = () => {
    setIsTimerActive(false);
  };
  
  // 完成当前步骤
  const completeCurrentStep = async () => {
    if (!task || !userId) return;
    
    try {
      // 记录是否按时完成
      const onTime = !isDelayed;
      
      // 更新步骤状态
      const res = await apiRequest('POST', `/api/tasks/breakdown/${task.id}/step/${currentStepIndex}`, {
        isCompleted: true,
        userId,
        onTime // 传递是否按时完成的信息
      });
      
      if (!res.ok) {
        throw new Error("更新步骤状态失败");
      }
      
      const data = await res.json();
      
      // 播放成功音效
      if (audioSuccessRef.current) {
        audioSuccessRef.current.play().catch(err => console.error("播放成功音效失败:", err));
      }
      
      // 显示庆祝效果
      triggerStepSuccessEffect();
      
      // 更新积分
      const stepPoints = data.pointsAwarded || Math.round(task.totalPoints / task.steps.length);
      setPointsEarned(prev => prev + stepPoints);
      
      // 弹出提示
      toast({
        title: "步骤完成！",
        description: `获得 ${stepPoints} 积分奖励${!onTime ? ' (由于延迟，积分已减少)' : ''}`,
      });
      
      // 检查是否所有步骤都已完成
      if (currentStepIndex < task.steps.length - 1) {
        // 前进到下一个步骤
        setCurrentStepIndex(currentStepIndex + 1);
        setIsTimerActive(false);
        setIsDelayed(false);
        // 重置当前步骤的时间
        if (task.steps[currentStepIndex + 1]) {
          setTimeRemaining(task.steps[currentStepIndex + 1].estimatedDuration * 60);
        }
      } else {
        // 所有步骤完成
        setIsCompleted(true);
        
        // 播放完成音效
        if (audioCompleteRef.current) {
          audioCompleteRef.current.play().catch(err => console.error("播放完成音效失败:", err));
        }
        
        // 全屏庆祝效果
        triggerTaskCompletionCelebration();
        
        // 显示成功消息
        setEncourageMessage(getRandomMessage());
        setShowCelebration(true);
        
        // 更新缓存
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/breakdown', { userId }] });
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };
  
  // 点击拖延按钮
  const handleDelay = () => {
    // 减少积分
    const penaltyPoints = Math.max(5, Math.round(task!.totalPoints * 0.1 / task!.steps.length));
    
    toast({
      title: "已延迟任务",
      description: `因为拖延，将损失 ${penaltyPoints} 积分`,
      variant: "destructive",
    });
    
    // 继续任务
    setIsDelayed(false);
    setIsTimerActive(true);
  };
  
  // 步骤完成特效
  const triggerStepSuccessEffect = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  // 任务全部完成特效
  const triggerTaskCompletionCelebration = () => {
    // 创建一个持续10秒的庆祝效果
    const duration = 10 * 1000;
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 }
      });
      
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 }
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  };
  
  // 完成整个任务流程
  const finishTask = () => {
    onComplete();
    onOpenChange(false);
    
    // 重置状态
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setIsTimerActive(false);
    setIsDelayed(false);
    setShowCelebration(false);
    setPointsEarned(0);
  };
  
  if (!task) return null;
  
  // 计算当前总体进度
  const overallProgress = Math.round(((currentStepIndex + (isCompleted ? 1 : 0)) / task.steps.length) * 100);
  
  // 当前步骤
  const currentStep = task.steps[currentStepIndex];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        {!showCelebration ? (
          <>
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between mb-2">
                <DialogTitle className="text-xl">{task.title}</DialogTitle>
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary font-medium">{pointsEarned}/{task.totalPoints} 积分</span>
                </div>
              </div>
              <DialogDescription>
                共 {task.steps.length} 个步骤，当前第 {currentStepIndex + 1} 步
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6 pt-4">
              {/* 总体进度条 */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-neutral-500 mb-1">
                  <span>总体进度</span>
                  <span>{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2 bg-neutral-100" />
              </div>
              
              {/* 当前步骤详情 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-1">当前步骤</h3>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <p className="mb-3">{currentStep.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-neutral-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>预计时间: {currentStep.estimatedDuration} 分钟</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-neutral-500">
                      <ChevronRight className="h-4 w-4 mr-1" />
                      <span>步骤 {currentStepIndex + 1}/{task.steps.length}</span>
                    </div>
                  </div>
                  
                  {isTimerActive && (
                    <div className="flex justify-center mb-3">
                      <div className={`text-3xl font-bold ${timeRemaining <= 60 ? 'text-red-500' : 'text-neutral-700'}`}>
                        {formatTime(timeRemaining)}
                      </div>
                    </div>
                  )}
                  
                  {showWarning && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md flex items-start mb-4">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 shrink-0" />
                      <p className="text-sm">还剩下1分钟时间，请专注完成当前步骤！</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {!isTimerActive && !isDelayed && !isCompleted && (
                      <Button 
                        onClick={startCurrentStep} 
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        开始步骤
                      </Button>
                    )}
                    
                    {isTimerActive && !isDelayed && !isCompleted && (
                      <>
                        <Button 
                          onClick={pauseCurrentStep} 
                          variant="outline"
                          className="flex-1"
                        >
                          暂停
                        </Button>
                        
                        <Button 
                          onClick={completeCurrentStep} 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          完成步骤
                        </Button>
                      </>
                    )}
                    
                    {isDelayed && !isCompleted && (
                      <>
                        <Button 
                          onClick={handleDelay} 
                          variant="destructive"
                          className="flex-1"
                        >
                          拖延
                        </Button>
                        
                        <Button 
                          onClick={completeCurrentStep} 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          完成步骤
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 步骤列表 */}
              <div>
                <h3 className="text-sm font-medium mb-2">所有步骤</h3>
                <ul className="space-y-2">
                  {task.steps.map((step, index) => (
                    <li 
                      key={index}
                      className={`
                        flex items-center p-2 rounded-md border 
                        ${index === currentStepIndex ? 'border-primary/70 bg-primary/5' : 
                          index < currentStepIndex ? 'border-green-200 bg-green-50' : 
                          'border-neutral-200 bg-white'
                        }
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center mr-3
                        ${index === currentStepIndex ? 'bg-primary text-white' : 
                          index < currentStepIndex ? 'bg-green-500 text-white' : 
                          'bg-neutral-200 text-neutral-600'
                        }
                      `}>
                        {index < currentStepIndex ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 mr-2">
                        <p className={`text-sm ${index < currentStepIndex ? 'line-through text-neutral-500' : 'text-neutral-700'}`}>
                          {step.description}
                        </p>
                      </div>
                      <div className="text-xs text-neutral-500">
                        {step.estimatedDuration} 分钟
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <DialogFooter className="bg-neutral-50 p-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                退出任务
              </Button>
              
              {isTimerActive ? (
                <Button onClick={completeCurrentStep}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  完成当前步骤
                </Button>
              ) : (
                <Button onClick={startCurrentStep} disabled={isCompleted}>
                  <Play className="h-4 w-4 mr-2" />
                  {isCompleted ? '已完成所有步骤' : '开始执行'}
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          // 庆祝成功完成页面
          <div className="p-6 flex flex-col items-center justify-center min-h-[500px]">
            <Award className="h-20 w-20 text-amber-500 mb-6" />
            
            <h2 className="text-2xl font-bold text-center mb-3">
              恭喜！任务完成！
            </h2>
            
            <p className="text-lg text-center font-medium text-neutral-700 mb-6">
              {encourageMessage}
            </p>
            
            <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-lg p-4 mb-8 w-full max-w-[300px]">
              <Star className="h-6 w-6 text-amber-500 mr-2" />
              <span className="text-xl font-bold text-neutral-800">
                +{pointsEarned} 积分奖励
              </span>
            </div>
            
            <Button onClick={finishTask} className="w-full max-w-[300px] h-12 text-lg">
              太棒了！
            </Button>
          </div>
        )}
      </DialogContent>
      
      {/* 音效文件 */}
      <audio ref={audioSuccessRef} preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3" type="audio/mpeg" />
      </audio>
      
      <audio ref={audioAlertRef} preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-alert-quick-chime-766.mp3" type="audio/mpeg" />
      </audio>
      
      <audio ref={audioCompleteRef} preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-medieval-show-fanfare-announcement-226.mp3" type="audio/mpeg" />
      </audio>
    </Dialog>
  );
};

export default TaskExecutionModal;