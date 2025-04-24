import { useQuery, useMutation } from "@tanstack/react-query";
import { IdentityGroup, InsertIdentityGroup, GroupMember, GroupActivity } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";

// 获取所有身份小圈子
export const useIdentityGroups = (identityTag?: string) => {
  return useQuery<IdentityGroup[]>({
    queryKey: identityTag 
      ? ['/api/identity-groups', 'byTag', identityTag] 
      : ['/api/identity-groups'],
    queryFn: async () => {
      const url = identityTag
        ? `/api/identity-groups?tag=${encodeURIComponent(identityTag)}`
        : '/api/identity-groups';
      const res = await fetch(url);
      if (!res.ok) throw new Error("获取小圈子列表失败");
      return res.json();
    }
  });
};

// 获取单个身份小圈子详情
export const useIdentityGroup = (id: number | null) => {
  return useQuery<IdentityGroup>({
    queryKey: ['/api/identity-groups', id],
    queryFn: async () => {
      if (!id) throw new Error("小圈子ID无效");
      const res = await fetch(`/api/identity-groups/${id}`);
      if (!res.ok) throw new Error("获取小圈子详情失败");
      return res.json();
    },
    enabled: !!id,
  });
};

// 创建新的身份小圈子
export const useCreateIdentityGroup = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertIdentityGroup) => {
      const res = await apiRequest('POST', '/api/identity-groups', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/identity-groups'] });
      toast({
        title: "创建成功",
        description: "新的身份小圈子已创建",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// 获取小圈子成员
export const useGroupMembers = (groupId: number | null) => {
  return useQuery<GroupMember[]>({
    queryKey: ['/api/identity-groups', groupId, 'members'],
    queryFn: async () => {
      if (!groupId) throw new Error("小圈子ID无效");
      const res = await fetch(`/api/identity-groups/${groupId}/members`);
      if (!res.ok) throw new Error("获取成员列表失败");
      return res.json();
    },
    enabled: !!groupId,
  });
};

// 加入小圈子
export const useJoinGroup = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: number; userId: number }) => {
      const res = await apiRequest('POST', `/api/identity-groups/${groupId}/members`, { userId });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/identity-groups', variables.groupId, 'members'] });
      toast({
        title: "加入成功",
        description: "你已成功加入该小圈子",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "加入失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// 获取小圈子活动
export const useGroupActivities = (groupId: number | null) => {
  return useQuery<GroupActivity[]>({
    queryKey: ['/api/identity-groups', groupId, 'activities'],
    queryFn: async () => {
      if (!groupId) throw new Error("小圈子ID无效");
      const res = await fetch(`/api/identity-groups/${groupId}/activities`);
      if (!res.ok) throw new Error("获取活动列表失败");
      return res.json();
    },
    enabled: !!groupId,
  });
};

// 创建小圈子活动
export const useCreateGroupActivity = (groupId: number | null) => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: Omit<GroupActivity, 'id' | 'createdAt' | 'currentParticipants'>) => {
      if (!groupId) throw new Error("小圈子ID无效");
      const res = await apiRequest('POST', `/api/identity-groups/${groupId}/activities`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/identity-groups', groupId, 'activities'] });
      toast({
        title: "创建成功",
        description: "活动已创建",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// 参加小圈子活动
export const useJoinGroupActivity = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ activityId, groupId }: { activityId: number; groupId: number }) => {
      const res = await apiRequest('POST', `/api/group-activities/${activityId}/join`, {});
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/identity-groups', variables.groupId, 'activities'] });
      toast({
        title: "参加成功",
        description: "你已成功参加该活动",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "参加失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};