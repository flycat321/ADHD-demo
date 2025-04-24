import React, { useState } from 'react';
import { LucideIcon, Check, Play, Info, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface TechniqueProps {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
}

interface TechniqueCardProps {
  technique: TechniqueProps;
  isApplied: boolean;
}

const TechniqueCard: React.FC<TechniqueCardProps> = ({ technique, isApplied: initialIsApplied }) => {
  const [isApplied, setIsApplied] = useState(initialIsApplied);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const { toast } = useToast();
  const Icon = technique.icon;
  
  // 模拟技术应用处理
  const handleApplyTechnique = () => {
    if (isApplied) return;
    
    setInProgress(true);
    // 模拟应用过程
    setTimeout(() => {
      setIsApplied(true);
      setInProgress(false);
      toast({
        title: "专注技术已应用",
        description: `你已成功应用 ${technique.name} 技术，继续专注！`,
      });
    }, 1000);
  };
  
  // 模拟技术详情内容
  const getTechniqueDetails = () => {
    return {
      steps: [
        "找一个安静的环境，减少可能的干扰",
        "设置计时器，按照技术要求设定时间周期",
        "在专注期间，完全投入当前任务",
        "时间结束后，短暂休息，然后进入下一个循环"
      ],
      benefitsForADHD: [
        "帮助建立工作节奏，减轻执行功能障碍",
        "通过结构化时间，降低拖延倾向",
        "利用固定时间框架，减少注意力分散",
        "创造小型成功体验，增强自我效能感"
      ],
      researchLinks: [
        { title: "ADHD工作记忆与专注技术研究", url: "#" },
        { title: "行为干预对ADHD症状的影响", url: "#" }
      ]
    };
  };
  
  const details = getTechniqueDetails();
  
  return (
    <Collapsible 
      open={isExpanded} 
      onOpenChange={setIsExpanded}
      className={`bg-white border rounded-lg shadow-sm transition-all duration-200 ${
        isApplied 
          ? 'border-primary/30 bg-primary/5' 
          : 'border-neutral-200'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={`w-12 h-12 ${technique.iconColor} rounded-full flex items-center justify-center mr-3 shrink-0`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-neutral-800 text-lg">{technique.name}</h3>
              {isApplied && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" /> 已应用
                </Badge>
              )}
            </div>
            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{technique.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button 
            className={`flex-1 ${
              isApplied 
                ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' 
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
            onClick={handleApplyTechnique}
            disabled={isApplied || inProgress}
          >
            {inProgress ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                应用中...
              </>
            ) : isApplied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                已应用
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                应用技术
              </>
            )}
          </Button>
          
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-none">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <div className={`w-8 h-8 ${technique.iconColor} rounded-full flex items-center justify-center mr-2`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {technique.name}
                </DialogTitle>
                <DialogDescription>
                  专为ADHD患者设计的专注技术详情
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    应用步骤
                  </h4>
                  <ul className="space-y-2">
                    {details.steps.map((step, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <div className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          {index + 1}
                        </div>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    ADHD益处
                  </h4>
                  <ul className="space-y-1.5">
                    {details.benefitsForADHD.map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <ArrowRight className="h-3 w-3 text-primary mr-2 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">相关研究</h4>
                  <ul className="space-y-1">
                    {details.researchLinks.map((link, index) => (
                      <li key={index}>
                        <a href={link.url} className="text-sm text-primary hover:underline">
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => {
                  setShowDetails(false);
                  !isApplied && handleApplyTechnique();
                }}>
                  {isApplied ? '我明白了' : '应用此技术'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon">
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="px-4 pb-4 border-t border-neutral-100 pt-3">
          <div className="text-sm text-neutral-700">
            <p className="mb-3">{technique.description}</p>
            <div className="space-y-2">
              <h4 className="font-medium">使用建议:</h4>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                {details.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
              
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowDetails(true)}
                >
                  查看完整详情
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TechniqueCard;
