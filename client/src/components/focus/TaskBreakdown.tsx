import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStore } from "@/store";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  ListChecks,
  MinusCircle,
  Plus,
  Star,
  Trash2,
  Play,
  ArrowRight,
} from "lucide-react";
import TaskExecutionModal from "./TaskExecutionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// 任务分解验证架构
const formSchema = z.object({
  title: z.string().min(2, "标题至少需要2个字符").max(100, "标题不能超过100个字符"),
  description: z.string().optional(),
  difficulty: z.enum(["简单", "中等", "困难", "非常困难"]),
  estimatedDuration: z.number().min(5, "预计时长至少为5分钟").max(240, "预计时长不能超过4小时"),
  steps: z.array(
    z.object({
      description: z.string().min(1, "步骤描述不能为空"),
      estimatedDuration: z.number().min(1, "预计时长至少为1分钟"),
      isCompleted: z.boolean().default(false),
    })
  ).min(1, "至少需要添加一个步骤"),
});

type FormData = z.infer<typeof formSchema>;

// 难度对应的积分倍数
const DIFFICULTY_POINT_MULTIPLIERS = {
  "简单": 1,
  "中等": 1.5,
  "困难": 2,
  "非常困难": 3,
};

// 难度对应的颜色
const DIFFICULTY_COLORS = {
  "简单": "bg-green-50 text-green-700 border-green-200",
  "中等": "bg-blue-50 text-blue-700 border-blue-200",
  "困难": "bg-orange-50 text-orange-700 border-orange-200",
  "非常困难": "bg-red-50 text-red-700 border-red-200",
};

// 单个任务步骤组件
interface TaskStepItemProps {
  step: {
    description: string;
    estimatedDuration: number;
    isCompleted: boolean;
  };
  index: number;
  onComplete: (index: number, isCompleted: boolean) => void;
  onDelete: (index: number) => void;
  isReadOnly?: boolean;
}

const TaskStepItem = ({ 
  step, 
  index, 
  onComplete, 
  onDelete, 
  isReadOnly = false 
}: TaskStepItemProps) => {
  return (
    <div className={`p-3 rounded-md border mb-2 ${step.isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3">
          {!isReadOnly ? (
            <Checkbox 
              id={`step-${index}`}
              checked={step.isCompleted}
              onCheckedChange={(checked) => onComplete(index, checked === true)}
              className="mt-1"
            />
          ) : step.isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
          ) : (
            <div className="h-5 w-5 border rounded-full mt-1"></div>
          )}
          <div className="flex-1">
            <div className={`text-sm ${step.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {step.description}
            </div>
            <div className="text-xs text-gray-500 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              预计 {step.estimatedDuration} 分钟
            </div>
          </div>
        </div>
        {!isReadOnly && !step.isCompleted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index)}
            className="h-7 w-7 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// 创建任务分解表单
interface CreateTaskBreakdownFormProps {
  onSuccess?: () => void;
}

export const CreateTaskBreakdownForm = ({ onSuccess }: CreateTaskBreakdownFormProps) => {
  const { currentUser } = useStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "中等",
      estimatedDuration: 30,
      steps: [
        { description: "", estimatedDuration: 10, isCompleted: false }
      ],
    },
  });

  // 添加步骤
  const addStep = () => {
    const steps = form.getValues("steps");
    form.setValue("steps", [
      ...steps,
      { description: "", estimatedDuration: 10, isCompleted: false }
    ]);
  };

  // 删除步骤
  const removeStep = (index: number) => {
    const steps = form.getValues("steps");
    if (steps.length > 1) {
      form.setValue(
        "steps",
        steps.filter((_, i) => i !== index)
      );
    } else {
      toast({
        title: "无法删除",
        description: "任务至少需要一个步骤",
        variant: "destructive",
      });
    }
  };

  // 自动更新总时长
  const updateTotalDuration = () => {
    const steps = form.getValues("steps");
    const totalDuration = steps.reduce((total, step) => total + (step.estimatedDuration || 0), 0);
    form.setValue("estimatedDuration", totalDuration);
  };

  // 提交表单
  const onSubmit = async (data: FormData) => {
    if (!currentUser?.id) return;
    
    setIsSubmitting(true);
    try {
      // 计算任务积分 = 基础分(10) * 难度系数 * (总时长/60)
      const pointsMultiplier = DIFFICULTY_POINT_MULTIPLIERS[data.difficulty];
      const durationMultiplier = Math.max(1, data.estimatedDuration / 60);
      const totalPoints = Math.round(10 * pointsMultiplier * durationMultiplier);
      
      // 构建要发送的数据
      const taskData = {
        userId: currentUser.id,
        title: data.title,
        description: data.description || null,
        priority: data.difficulty,
        steps: data.steps,
        estimatedDuration: data.estimatedDuration,
        totalPoints,
      };
      
      // 发送创建任务请求
      const res = await apiRequest("POST", "/api/tasks/breakdown", taskData);
      
      if (!res.ok) {
        throw new Error("创建任务失败");
      }
      
      // 更新缓存
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/breakdown'] });
      
      toast({
        title: "任务创建成功",
        description: `任务"${data.title}"已成功创建，完成后可获得${totalPoints}积分`,
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "创建任务失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>任务标题</FormLabel>
              <FormControl>
                <Input placeholder="例如：准备月度报告" {...field} />
              </FormControl>
              <FormDescription>
                简洁明了的标题有助于明确任务目标
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>任务描述（可选）</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="详细描述任务内容和注意事项"
                  {...field}
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>任务难度</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择任务难度" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="简单">简单</SelectItem>
                    <SelectItem value="中等">中等</SelectItem>
                    <SelectItem value="困难">困难</SelectItem>
                    <SelectItem value="非常困难">非常困难</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  任务难度影响完成后获得的积分
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="estimatedDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>预计总时长（分钟）</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    max={240}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  会根据步骤时长自动更新
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel>任务步骤分解</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addStep}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加步骤
            </Button>
          </div>
          
          {form.getValues("steps").map((_, index) => (
            <div key={index} className="mb-3 p-3 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">步骤 {index + 1}</h4>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(index)}
                    className="h-7 w-7 text-gray-400 hover:text-red-500"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <FormField
                control={form.control}
                name={`steps.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="步骤描述" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name={`steps.${index}.estimatedDuration`}
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <div className="flex items-center">
                      <FormLabel className="mr-2 text-gray-500 text-sm">预计时长</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            setTimeout(updateTotalDuration, 100);
                          }}
                          className="max-w-20"
                        />
                      </FormControl>
                      <span className="ml-2 text-sm text-gray-500">分钟</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          {form.formState.errors.steps && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.steps.message}
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "创建中..." : "创建任务"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// 任务分解列表组件
export const TaskBreakdownList = () => {
  const { currentUser } = useStore();
  const { toast } = useToast();
  const userId = currentUser?.id;
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [executingTask, setExecutingTask] = useState<any>(null);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);

  // 获取任务列表
  const { data: tasks = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/tasks/breakdown'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/tasks/breakdown?userId=${userId}`);
      if (!response.ok) {
        throw new Error('获取任务列表失败');
      }
      return response.json();
    },
    enabled: !!userId,
  });
  
  // 组件挂载时自动获取任务列表
  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);

  // 切换任务展开状态
  const toggleTaskExpand = (taskId: number) => {
    if (expandedTaskIds.includes(taskId)) {
      setExpandedTaskIds(expandedTaskIds.filter(id => id !== taskId));
    } else {
      setExpandedTaskIds([...expandedTaskIds, taskId]);
    }
  };

  // 完成步骤
  const completeStep = async (taskId: number, stepIndex: number, isCompleted: boolean) => {
    if (!userId) return;
    
    setIsUpdating(taskId);
    try {
      const res = await apiRequest("POST", `/api/tasks/breakdown/${taskId}/step/${stepIndex}`, {
        isCompleted,
        userId
      });
      
      if (!res.ok) {
        throw new Error("更新步骤状态失败");
      }
      
      // 更新缓存
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/breakdown'] });
      
      // 检查是否所有步骤都已完成
      const task = await res.json();
      if (task.allStepsCompleted && isCompleted) {
        toast({
          title: "恭喜你完成了整个任务！",
          description: `获得${task.pointsAwarded}积分奖励`,
        });
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // 删除任务
  const deleteTask = async (taskId: number) => {
    if (!userId) return;
    
    if (!confirm("确定要删除这个任务吗？所有步骤进度将会丢失。")) {
      return;
    }
    
    try {
      const res = await apiRequest("DELETE", `/api/tasks/breakdown/${taskId}`, { userId });
      
      if (!res.ok) {
        throw new Error("删除任务失败");
      }
      
      // 更新缓存
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/breakdown'] });
      
      toast({
        title: "任务已删除",
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  // 计算任务进度
  const calculateProgress = (task: any) => {
    if (!task.steps || task.steps.length === 0) return 0;
    const completedSteps = task.steps.filter((step: any) => step.isCompleted).length;
    return Math.round((completedSteps / task.steps.length) * 100);
  };
  
  // 执行任务
  const startTaskExecution = (task: any) => {
    setExecutingTask(task);
    setIsExecutionModalOpen(true);
  };
  
  // 任务执行完成后的回调
  const handleTaskExecutionComplete = () => {
    // 刷新任务列表
    queryClient.invalidateQueries({ queryKey: ['/api/tasks/breakdown'] });
    
    // 更新用户积分
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">任务分解</h2>
        <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              创建任务
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建分解任务</DialogTitle>
              <DialogDescription>
                将大任务分解为多个小步骤，逐步完成后获得积分奖励
              </DialogDescription>
            </DialogHeader>
            <CreateTaskBreakdownForm onSuccess={() => setIsCreatingTask(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">正在加载任务...</div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">暂无分解任务</h3>
            <p className="text-gray-500 mb-4">
              ADHD大脑适合将大任务分解为小步骤，点击"创建任务"开始体验
            </p>
            <Button onClick={() => setIsCreatingTask(true)}>
              <Plus className="mr-1 h-4 w-4" />
              创建第一个任务
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task: any) => {
            const progress = calculateProgress(task);
            const isExpanded = expandedTaskIds.includes(task.id);
            const isAllCompleted = progress === 100;
            
            return (
              <Card key={task.id} className={isAllCompleted ? "border-green-200 bg-green-50" : ""}>
                <CardContent className="p-4">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleTaskExpand(task.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className={`text-lg font-medium ${isAllCompleted ? "text-green-800" : ""}`}>
                            {task.title}
                          </h3>
                          {isAllCompleted && (
                            <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                              已完成
                            </Badge>
                          )}
                          <Badge 
                            className={`ml-2 ${task.priority && DIFFICULTY_COLORS[task.priority as keyof typeof DIFFICULTY_COLORS] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                          >
                            {task.priority || '未设置'}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        )}
                      </div>

                      <div className="flex items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center mr-3 text-sm">
                                <Star className="h-4 w-4 text-amber-500 mr-1" />
                                <span>{task.totalPoints}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>完成后可获得的积分</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center mr-3 text-sm">
                                <Clock className="h-4 w-4 text-blue-500 mr-1" />
                                <span>{task.estimatedDuration}分钟</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>预计完成时间</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center mr-3 text-sm">
                                <Dumbbell className="h-4 w-4 text-purple-500 mr-1" />
                                <span>{task.steps.length}步</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>任务被分解为{task.steps.length}个步骤</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                        <span>完成进度: {progress}%</span>
                        <span>{task.steps.filter((s: any) => s.isCompleted).length}/{task.steps.length} 步骤</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="flex gap-2 my-2">
                      <Button 
                        size="sm" 
                        className={`flex-1 ${isAllCompleted ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' : 'bg-primary'}`}
                        onClick={() => !isAllCompleted && startTaskExecution(task)}
                        disabled={isAllCompleted}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        开始执行
                      </Button>
                      
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          )}
                          {isExpanded ? "收起详情" : "查看详情"}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="mt-3 space-y-1">
                      {task.steps.map((step: any, index: number) => (
                        <TaskStepItem
                          key={`${task.id}-step-${index}`}
                          step={step}
                          index={index}
                          onComplete={(stepIndex, isCompleted) => 
                            completeStep(task.id, stepIndex, isCompleted)
                          }
                          onDelete={() => {}}
                          isReadOnly={isUpdating === task.id || isAllCompleted}
                        />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* 任务执行模态窗口 */}
      <TaskExecutionModal
        task={executingTask}
        open={isExecutionModalOpen}
        onOpenChange={setIsExecutionModalOpen}
        onComplete={handleTaskExecutionComplete}
      />
    </div>
  );
};

// 默认导出的TaskBreakdown组件（包含列表和创建表单）
const TaskBreakdown = () => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
      <TaskBreakdownList />
    </div>
  );
};

export default TaskBreakdown;