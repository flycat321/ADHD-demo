import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useStore } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { useIdentityGroup, useGroupMembers, useGroupActivities, useJoinGroup, useJoinGroupActivity } from "@/hooks/useIdentityGroups";
import { 
  Users, Calendar, Award, ArrowLeft, UserPlus, 
  Clock, MapPin, Activity, ChevronRight, Plus
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GroupPointsCard from "@/components/groups/GroupPointsCard";
import ConsultantCard from "@/components/groups/ConsultantCard";
import CreateGroupActivityForm from "@/components/groups/CreateGroupActivityForm";

// 小圈子成员列表组件
const MembersList = ({ groupId }: { groupId: number }) => {
  const { data: members = [], isLoading } = useGroupMembers(groupId);
  
  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">成员 ({members.length})</h3>
        <Button variant="ghost" size="sm">
          查看全部 <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {isLoading ? (
        Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
        ))
      ) : members.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          暂无成员
        </div>
      ) : (
        members.slice(0, 5).map((member) => (
          <div key={`${member.groupId}-${member.userId}`} className="flex items-center space-x-3">
            {/* 在实际应用中，这里应该根据userId获取用户信息 */}
            <Avatar>
              <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
              <AvatarFallback>用户</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">用户名</div>
              <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// 活动列表组件
const ActivitiesList = ({ groupId }: { groupId: number }) => {
  const { data: activities = [], isLoading } = useGroupActivities(groupId);
  const joinActivity = useJoinGroupActivity();
  
  const handleJoinActivity = (activityId: number) => {
    joinActivity.mutate({ activityId, groupId });
  };
  
  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">活动 ({activities.length})</h3>
        <Button variant="ghost" size="sm">
          查看全部 <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {isLoading ? (
        Array(2).fill(0).map((_, i) => (
          <Card key={i} className="w-full mb-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32 mt-1" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))
      ) : activities.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          暂无活动
        </div>
      ) : (
        activities.map((activity) => (
          <Card key={activity.id} className="w-full mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{activity.title}</CardTitle>
              <CardDescription className="flex items-center text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(activity.activityDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center mb-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{new Date(activity.activityDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <MapPin className="h-3 w-3 ml-2 mr-1" />
                <span>{activity.location || "未指定地点"}</span>
              </div>
              <p className="text-sm line-clamp-2">{activity.description}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3 inline mr-1" />
                {activity.currentParticipants} / {activity.participantLimit || "不限"} 人参与
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant={activity.currentParticipants >= (activity.participantLimit || Infinity) ? "outline" : "default"}
                className="w-full"
                disabled={activity.currentParticipants >= (activity.participantLimit || Infinity)}
                onClick={() => handleJoinActivity(activity.id)}
              >
                {activity.currentParticipants >= (activity.participantLimit || Infinity) ? "已满员" : "参与活动"}
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

// 小圈子详情页
export default function GroupDetail() {
  const [, params] = useRoute("/groups/:id");
  const [, navigate] = useLocation();
  const { currentUser } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  
  const groupId = params?.id ? parseInt(params.id) : null;
  const { data: group, isLoading, error } = useIdentityGroup(groupId);
  const joinGroup = useJoinGroup();
  
  useEffect(() => {
    if (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive",
      });
      navigate("/groups");
    }
  }, [error, navigate, toast]);
  
  const handleJoinGroup = () => {
    if (!currentUser?.id || !groupId) return;
    joinGroup.mutate({ groupId, userId: currentUser.id });
  };
  
  if (isLoading) {
    return (
      <div className="container p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/groups")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-6 w-40 ml-2" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <Skeleton className="h-10 w-full mb-6" />
      </div>
    );
  }
  
  if (!group) {
    return (
      <div className="container p-4 text-center py-10">
        <div className="text-muted-foreground">小圈子不存在或已被删除</div>
        <Button className="mt-4" onClick={() => navigate("/groups")}>
          返回小圈子列表
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container p-4 pb-20">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-2">小圈子详情</h1>
      </div>
      
      <div className="space-y-4">
        {/* 头部信息 */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 rounded-lg">
          <div className="flex items-center">
            {group.avatarUrl ? (
              <img 
                src={group.avatarUrl} 
                alt={group.name} 
                className="h-16 w-16 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/30 flex items-center justify-center border-2 border-white">
                <Users className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="ml-4">
              <div className="flex items-center">
                <h2 className="text-xl font-bold">{group.name}</h2>
                {group.isVerified && (
                  <Badge variant="secondary" className="ml-2">
                    已认证
                  </Badge>
                )}
              </div>
              <div className="text-sm font-medium">#{group.identityTag}</div>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span className="mr-3">{group.memberCount}位成员</span>
                <Award className="h-4 w-4 mr-1" />
                <span>{group.points}积分</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 加入按钮 */}
        <Button 
          className="w-full"
          onClick={handleJoinGroup}
          disabled={joinGroup.isPending}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          加入小圈子
        </Button>
        
        {/* 内容标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="info">简介</TabsTrigger>
            <TabsTrigger value="members">成员</TabsTrigger>
            <TabsTrigger value="activities">活动</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">小圈子介绍</h3>
                <p className="text-sm">{group.description}</p>
              </div>
              
              {/* 积分系统卡片 */}
              <div>
                <h3 className="text-lg font-medium mb-2">积分系统</h3>
                <GroupPointsCard group={group} />
              </div>
              
              {/* 小圈子顾问 */}
              {group.consultantId ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">专业顾问</h3>
                  <ConsultantCard 
                    consultant={{
                      id: group.consultantId,
                      displayName: "张医生",
                      consultantTitle: "ADHD专业心理咨询师",
                      consultantVerified: true,
                      consultantBio: "专注于帮助ADHD患者改善生活质量和工作效率。拥有多年临床经验，善于为患者提供个性化的应对策略和支持。",
                      profileImage: "https://randomuser.me/api/portraits/women/28.jpg",
                      // 以下是必需的字段，但在组件中不会使用
                      username: "",
                      password: "",
                      email: "",
                      joinedDate: new Date(),
                      isConsultant: true,
                      points: 0,
                      adhd_profile: null,
                      identityTags: null
                    }} 
                    isGroupConsultant={true}
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">专业顾问</h3>
                    <Badge variant="outline" className="text-muted-foreground">
                      未聘请
                    </Badge>
                  </div>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6 pb-6 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        本小圈子暂未聘请专业顾问，可以通过积分系统聘请专业顾问为小圈子提供专业指导
                      </p>
                      <Button
                        variant="outline"
                        className="text-primary"
                        onClick={() => setActiveTab("info")}
                      >
                        使用积分聘请顾问
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {group.rules && (
                <div>
                  <h3 className="text-lg font-medium mb-2">小圈子规则</h3>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {group.rules}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="members">
            {groupId && <MembersList groupId={groupId} />}
          </TabsContent>
          
          <TabsContent value="activities">
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">小圈子活动</h3>
                <Dialog open={isCreatingActivity} onOpenChange={setIsCreatingActivity}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      创建活动
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>创建小圈子活动</DialogTitle>
                      <DialogDescription>
                        发起活动可以增进成员互动，让ADHD患者找到共同的支持和理解
                      </DialogDescription>
                    </DialogHeader>
                    {groupId && (
                      <CreateGroupActivityForm 
                        groupId={groupId} 
                        onSuccess={() => setIsCreatingActivity(false)}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              
              {groupId && <ActivitiesList groupId={groupId} />}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}