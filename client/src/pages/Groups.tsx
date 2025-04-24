import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/store";
import { useIdentityGroups } from "@/hooks/useIdentityGroups";
import { PlusCircle, Users, Calendar, Award, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// 小圈子卡片组件
const GroupCard = ({ group }: { group: any }) => {
  const [, navigate] = useLocation();
  
  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {group.avatarUrl ? (
              <img 
                src={group.avatarUrl} 
                alt={group.name} 
                className="h-10 w-10 rounded-full mr-3 object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg flex items-center">
                {group.name}
                {group.hasConsultant && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                    专家顾问
                  </Badge>
                )}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {group.identityTag}
              </div>
            </div>
          </div>
          {group.isVerified && (
            <Badge variant="secondary" className="ml-auto">
              已认证
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm line-clamp-2">{group.description}</p>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span className="mr-4">{group.memberCount}位成员</span>
          <Award className="h-4 w-4 mr-1" />
          <span>{group.points}积分</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="mr-2 flex-1"
          onClick={() => navigate(`/groups/${group.id}`)}
        >
          查看详情
        </Button>
        <Button className="flex-1">
          加入小圈子
        </Button>
      </CardFooter>
    </Card>
  );
};

// 身份小圈子主页
export default function Groups() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // 获取所有小圈子
  const { data: groups = [], isLoading } = useIdentityGroups();
  // 过滤我的小圈子 (简单实现，实际应该使用API)
  const myGroups = currentUser?.identityTags?.length 
    ? groups.filter(g => currentUser.identityTags?.includes(g.identityTag))
    : [];
  
  // 根据搜索词过滤
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.identityTag.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const createNewGroup = () => {
    navigate("/groups/create");
  };
  
  return (
    <div className="container px-4 py-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">身份小圈子</h1>
        <Button onClick={createNewGroup} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          创建小圈子
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="搜索小圈子..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="all">全部小圈子</TabsTrigger>
          <TabsTrigger value="mine">我的小圈子</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            // 加载骨架屏
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="w-full mb-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div>
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-20 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchTerm ? "没有找到匹配的小圈子" : "暂时没有小圈子，创建一个吧！"}
            </div>
          ) : (
            filteredGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="mine" className="mt-4">
          {isLoading ? (
            <Card className="w-full mb-4">
              <CardContent className="py-8">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ) : myGroups.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              你还没有加入任何身份小圈子
            </div>
          ) : (
            myGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}