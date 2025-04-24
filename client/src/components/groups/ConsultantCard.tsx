import { useState } from "react";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Briefcase, MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ConsultantCardProps {
  consultant: User;
  isGroupConsultant?: boolean;
}

export default function ConsultantCard({ consultant, isGroupConsultant = false }: ConsultantCardProps) {
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    setIsSending(true);
    // 模拟发送消息
    setTimeout(() => {
      toast({
        title: "消息已发送",
        description: "顾问会尽快回复你的咨询",
      });
      setMessageText("");
      setIsSending(false);
    }, 1000);
  };

  const handleBookAppointment = () => {
    toast({
      title: "预约功能即将推出",
      description: "我们正在开发预约功能，敬请期待",
    });
  };

  return (
    <Card className={`w-full mb-4 ${isGroupConsultant ? 'border-blue-200 bg-blue-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={consultant.profileImage || undefined} alt={consultant.displayName} />
              <AvatarFallback>{consultant.displayName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base flex items-center">
                {consultant.displayName}
                {consultant.consultantVerified && (
                  <CheckCircle2 className="h-4 w-4 ml-1 text-blue-500" />
                )}
              </CardTitle>
              <CardDescription>{consultant.consultantTitle}</CardDescription>
            </div>
          </div>
          {isGroupConsultant && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              小圈子顾问
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm line-clamp-3">
          {consultant.consultantBio || "专注于帮助ADHD患者改善生活质量和工作效率。拥有多年临床经验，善于为患者提供个性化的应对策略和支持。"}
        </p>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 mr-1" />
          <span>专业顾问</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              发送消息
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[50vh]">
            <SheetHeader>
              <SheetTitle>向 {consultant.displayName} 发送消息</SheetTitle>
              <SheetDescription>
                描述你的问题，顾问将在24小时内回复
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <Textarea
                placeholder="请详细描述你遇到的问题或需要咨询的内容..."
                className="min-h-[150px]"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">取消</Button>
              </SheetClose>
              <Button 
                onClick={handleSendMessage}
                disabled={isSending || !messageText.trim()}
              >
                {isSending ? "发送中..." : "发送消息"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              预约咨询
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>预约 {consultant.displayName} 的咨询</DialogTitle>
              <DialogDescription>
                选择合适的时间进行一对一专业咨询
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center">
              <p className="mb-2">预约功能即将推出</p>
              <p className="text-sm text-muted-foreground">我们正在开发更完善的预约系统，敬请期待</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {}}>
                关闭
              </Button>
              <Button onClick={handleBookAppointment}>
                预约
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}