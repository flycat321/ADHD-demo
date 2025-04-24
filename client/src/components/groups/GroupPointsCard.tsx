import { useState } from "react";
import { Award, Gift, Plus, PiggyBank, Briefcase } from "lucide-react";
import { IdentityGroup } from "@shared/schema";
import { useStore } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatNumberWithSuffix } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface GroupPointsCardProps {
  group: IdentityGroup;
}

export default function GroupPointsCard({ group }: GroupPointsCardProps) {
  const { currentUser } = useStore();
  const { toast } = useToast();
  const [isAddingPoints, setIsAddingPoints] = useState(false);
  const [amount, setAmount] = useState("10");
  const [isHiringConsultant, setIsHiringConsultant] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 定义顾问费用
  const consultantCost = 500;
  // 判断小圈子积分是否足够
  const hasEnoughPoints = group.points >= consultantCost;
  // 假设的目标积分（例如：下一个里程碑）
  const pointsGoal = 1000;
  const progress = Math.min((group.points / pointsGoal) * 100, 100);

  // 模拟的顾问列表
  const consultants = [
    { id: "1", name: "张医生", title: "ADHD专业心理咨询师", cost: consultantCost },
    { id: "2", name: "李教授", title: "儿童发展心理学专家", cost: consultantCost + 100 },
    { id: "3", name: "王顾问", title: "行为干预治疗师", cost: consultantCost - 50 },
  ];

  // 添加积分
  const handleAddPoints = async () => {
    if (!currentUser?.id || !amount) return;
    
    setIsLoading(true);
    try {
      const res = await apiRequest('POST', `/api/identity-groups/${group.id}/donate-points`, { 
        userId: currentUser.id,
        amount: parseInt(amount)
      });
      
      if (!res.ok) throw new Error("添加积分失败");
      
      // 更新缓存
      queryClient.invalidateQueries({ queryKey: ['/api/identity-groups', group.id] });
      
      toast({
        title: "积分添加成功",
        description: `你成功为小圈子捐赠了 ${amount} 积分`,
      });
      
      setIsAddingPoints(false);
    } catch (error) {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 聘请顾问
  const handleHireConsultant = async () => {
    if (!selectedConsultant) return;
    
    setIsLoading(true);
    try {
      const res = await apiRequest('POST', `/api/identity-groups/${group.id}/hire-consultant`, { 
        consultantId: parseInt(selectedConsultant)
      });
      
      if (!res.ok) throw new Error("聘请顾问失败");
      
      // 更新缓存
      queryClient.invalidateQueries({ queryKey: ['/api/identity-groups', group.id] });
      
      toast({
        title: "聘请成功",
        description: "顾问已加入小圈子，现在成员可以获得专业指导",
      });
      
      setIsHiringConsultant(false);
    } catch (error) {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Award className="h-5 w-5 mr-2 text-amber-500" />
            小圈子积分系统
          </CardTitle>
          <CardDescription>
            积分可用于聘请顾问和兑换服务
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="text-2xl font-bold">{formatNumberWithSuffix(group.points)}</div>
            <div className="text-sm text-muted-foreground">目标: {formatNumberWithSuffix(pointsGoal)}</div>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md">
              <div className="flex items-center">
                <PiggyBank className="h-5 w-5 mr-2 text-amber-500" />
                <div>
                  <div className="font-medium">积分捐赠</div>
                  <div className="text-xs text-muted-foreground">贡献个人积分给小圈子</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingPoints(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                捐赠
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                <div>
                  <div className="font-medium">聘请顾问</div>
                  <div className="text-xs text-muted-foreground">花费 {consultantCost} 积分聘请专业顾问</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!hasEnoughPoints || group.hasConsultant}
                onClick={() => setIsHiringConsultant(true)}
              >
                {group.hasConsultant ? "已有顾问" : "聘请"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
              <div className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-green-500" />
                <div>
                  <div className="font-medium">积分兑换</div>
                  <div className="text-xs text-muted-foreground">使用积分兑换服务和资源</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                disabled={group.points < 100}
              >
                兑换
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          小圈子成员可以通过上传知识资源、举办活动和参与社区贡献获取更多积分
        </CardFooter>
      </Card>
      
      {/* 添加积分对话框 */}
      <Dialog open={isAddingPoints} onOpenChange={setIsAddingPoints}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>向小圈子捐赠积分</DialogTitle>
            <DialogDescription>
              你的个人积分将转入小圈子公共基金，用于聘请顾问和福利服务
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <label htmlFor="points" className="text-sm font-medium">
                  捐赠积分数量
                </label>
                <Input
                  id="points"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max={currentUser?.points || 100}
                />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              你当前拥有 {currentUser?.points || 0} 积分
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingPoints(false)}>
              取消
            </Button>
            <Button 
              onClick={handleAddPoints}
              disabled={isLoading || !amount || parseInt(amount) <= 0 || parseInt(amount) > (currentUser?.points || 0)}
            >
              {isLoading ? "处理中..." : "确认捐赠"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 聘请顾问对话框 */}
      <Dialog open={isHiringConsultant} onOpenChange={setIsHiringConsultant}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>聘请ADHD专业顾问</DialogTitle>
            <DialogDescription>
              专业顾问将加入小圈子，为成员提供专业指导和支持
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <label htmlFor="consultant" className="text-sm font-medium">
                  选择顾问
                </label>
                <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择一位顾问" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultants.map((consultant) => (
                      <SelectItem key={consultant.id} value={consultant.id}>
                        <div className="flex flex-col">
                          <span>{consultant.name}</span>
                          <span className="text-xs text-muted-foreground">{consultant.title} ({consultant.cost} 积分)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="text-sm">
              <div className="font-medium mb-1">聘请顾问将消耗小圈子积分:</div>
              <div className="flex justify-between text-muted-foreground">
                <span>小圈子当前积分:</span>
                <span>{group.points}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>聘请费用:</span>
                <span>-{consultantCost}</span>
              </div>
              <div className="flex justify-between font-medium mt-1 pt-1 border-t">
                <span>聘请后剩余:</span>
                <span>{group.points - consultantCost}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHiringConsultant(false)}>
              取消
            </Button>
            <Button 
              onClick={handleHireConsultant}
              disabled={isLoading || !selectedConsultant || !hasEnoughPoints}
            >
              {isLoading ? "处理中..." : "确认聘请"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}