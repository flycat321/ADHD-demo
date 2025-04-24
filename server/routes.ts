import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertTaskSchema, 
  insertKnowledgeContentSchema, 
  insertCommunityPostSchema, 
  insertCommentSchema, 
  insertEventSchema, 
  insertFocusSessionSchema,
  insertIdentityGroupSchema,
  insertGroupMemberSchema,
  insertGroupActivitySchema,
  insertUserKnowledgeContentSchema,
  insertBehaviorPatternSchema,
  insertBehaviorRecordSchema,
  insertInterventionStrategySchema,
  insertUserInterestSchema,
  insertTaskRecommendationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication routes are handled in server/auth.ts

  // Get all users (for community features)
  app.get('/api/users', async (req, res) => {
    try {
      // For simplicity, we'll just return user 1 for now
      const user = await storage.getUser(1);
      res.json([user]);
    } catch (err) {
      res.status(500).json({ message: "获取用户列表失败" });
    }
  });

  // User routes
  app.get('/api/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  // Task routes
  app.get('/api/tasks', async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      // Return empty array instead of error when no userId provided
      return res.json([]);
    }
    
    const tasks = await storage.getTasksByUserId(userId);
    res.json(tasks);
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error });
    }
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const updates = req.body;
    try {
      const updatedTask = await storage.updateTask(taskId, updates);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data", error });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const result = await storage.deleteTask(taskId);
    if (!result) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(204).send();
  });

  // Knowledge content routes
  app.get('/api/knowledge', async (req, res) => {
    const type = req.query.type as string | undefined;
    const featured = req.query.featured === 'true';
    
    if (type) {
      const content = await storage.getKnowledgeContentByType(type);
      return res.json(content);
    }
    
    if (featured) {
      const content = await storage.getFeaturedKnowledgeContent();
      return res.json(content);
    }
    
    const content = await storage.getAllKnowledgeContent();
    res.json(content);
  });

  app.get('/api/knowledge/:id', async (req, res) => {
    const contentId = parseInt(req.params.id);
    const content = await storage.getKnowledgeContent(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.json(content);
  });

  app.post('/api/knowledge', async (req, res) => {
    try {
      const contentData = insertKnowledgeContentSchema.parse(req.body);
      const newContent = await storage.createKnowledgeContent(contentData);
      res.status(201).json(newContent);
    } catch (error) {
      res.status(400).json({ message: "Invalid content data", error });
    }
  });

  // Community posts routes
  app.get('/api/posts', async (req, res) => {
    const posts = await storage.getAllCommunityPosts();
    res.json(posts);
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const postData = insertCommunityPostSchema.parse(req.body);
      const newPost = await storage.createCommunityPost(postData);
      res.status(201).json(newPost);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data", error });
    }
  });

  app.post('/api/posts/:id/like', async (req, res) => {
    const postId = parseInt(req.params.id);
    const post = await storage.likePost(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  });

  // Comments routes
  app.get('/api/posts/:postId/comments', async (req, res) => {
    const postId = parseInt(req.params.postId);
    const comments = await storage.getCommentsByPostId(postId);
    res.json(comments);
  });

  app.post('/api/comments', async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const newComment = await storage.createComment(commentData);
      res.status(201).json(newComment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data", error });
    }
  });

  // Events routes
  app.get('/api/events', async (req, res) => {
    const events = await storage.getAllEvents();
    res.json(events);
  });

  app.post('/api/events', async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data", error });
    }
  });

  // Focus sessions routes
  app.get('/api/focus-sessions', async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      // Return empty array instead of error when no userId provided
      return res.json([]);
    }
    
    const sessions = await storage.getFocusSessionsByUserId(userId);
    res.json(sessions);
  });

  app.post('/api/focus-sessions', async (req, res) => {
    try {
      const sessionData = insertFocusSessionSchema.parse(req.body);
      const newSession = await storage.createFocusSession(sessionData);
      res.status(201).json(newSession);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data", error });
    }
  });

  app.patch('/api/focus-sessions/:id', async (req, res) => {
    const sessionId = parseInt(req.params.id);
    const updates = req.body;
    try {
      const updatedSession = await storage.updateFocusSession(sessionId, updates);
      if (!updatedSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(updatedSession);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data", error });
    }
  });

  // 身份标签相关的接口
  app.get('/api/users/identity-tags/:tag', async (req, res) => {
    try {
      const tag = req.params.tag;
      const users = await storage.getUsersByIdentityTag(tag);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users by identity tag", error });
    }
  });

  app.patch('/api/users/:id/identity-tags', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { identityTags } = req.body;
      
      if (!Array.isArray(identityTags)) {
        return res.status(400).json({ message: "身份标签必须是数组" });
      }
      
      const user = await storage.updateUser(userId, { identityTags });
      if (!user) {
        return res.status(404).json({ message: "用户不存在" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "更新身份标签失败", error });
    }
  });

  // 咨询师相关的接口
  app.get('/api/consultants', async (req, res) => {
    try {
      const consultants = await storage.getConsultants();
      res.json(consultants);
    } catch (error) {
      res.status(500).json({ message: "获取咨询师列表失败", error });
    }
  });

  // 小圈子相关接口
  app.get('/api/identity-groups', async (req, res) => {
    try {
      const tag = req.query.tag as string | undefined;
      
      if (tag) {
        const groups = await storage.getIdentityGroupsByIdentityTag(tag);
        return res.json(groups);
      }
      
      const groups = await storage.getAllIdentityGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "获取小圈子列表失败", error });
    }
  });

  app.get('/api/identity-groups/:id', async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getIdentityGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "小圈子不存在" });
      }
      
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "获取小圈子详情失败", error });
    }
  });

  app.post('/api/identity-groups', async (req, res) => {
    try {
      const groupData = insertIdentityGroupSchema.parse(req.body);
      const newGroup = await storage.createIdentityGroup(groupData);
      res.status(201).json(newGroup);
    } catch (error) {
      res.status(400).json({ message: "Invalid group data", error });
    }
  });

  app.patch('/api/identity-groups/:id', async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedGroup = await storage.updateIdentityGroup(groupId, updates);
      if (!updatedGroup) {
        return res.status(404).json({ message: "小圈子不存在" });
      }
      
      res.json(updatedGroup);
    } catch (error) {
      res.status(500).json({ message: "更新小圈子失败", error });
    }
  });

  app.post('/api/identity-groups/:id/points', async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { points } = req.body;
      
      if (typeof points !== 'number' || points <= 0) {
        return res.status(400).json({ message: "积分必须是正数" });
      }
      
      const group = await storage.addGroupPoints(groupId, points);
      if (!group) {
        return res.status(404).json({ message: "小圈子不存在" });
      }
      
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "添加小圈子积分失败", error });
    }
  });

  app.post('/api/identity-groups/:id/consultant', async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { consultantId } = req.body;
      
      if (!consultantId) {
        return res.status(400).json({ message: "咨询师ID不能为空" });
      }
      
      const group = await storage.assignConsultantToGroup(groupId, consultantId);
      if (!group) {
        return res.status(404).json({ message: "小圈子不存在或咨询师不可用" });
      }
      
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "分配咨询师失败", error });
    }
  });

  // 小圈子成员接口
  app.get('/api/identity-groups/:id/members', async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "获取小圈子成员失败", error });
    }
  });

  app.post('/api/identity-groups/:id/members', async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { userId, role = 'member' } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "用户ID不能为空" });
      }
      
      const memberData = {
        groupId,
        userId,
        role
      };
      
      const newMember = await storage.addGroupMember(memberData);
      res.status(201).json(newMember);
    } catch (error) {
      res.status(400).json({ message: "添加成员失败", error });
    }
  });

  app.patch('/api/identity-groups/:groupId/members/:userId/role', async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = parseInt(req.params.userId);
      const { role } = req.body;
      
      if (!role) {
        return res.status(400).json({ message: "角色不能为空" });
      }
      
      const member = await storage.updateGroupMemberRole(groupId, userId, role);
      if (!member) {
        return res.status(404).json({ message: "成员不存在" });
      }
      
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "更新成员角色失败", error });
    }
  });

  app.delete('/api/identity-groups/:groupId/members/:userId', async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = parseInt(req.params.userId);
      
      const result = await storage.removeGroupMember(groupId, userId);
      if (!result) {
        return res.status(404).json({ message: "成员不存在" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "移除成员失败", error });
    }
  });

  // 小圈子活动接口
  app.get('/api/identity-groups/:id/activities', async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const activities = await storage.getGroupActivitiesByGroupId(groupId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "获取小圈子活动失败", error });
    }
  });

  app.post('/api/identity-groups/:id/activities', async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const activityData = {
        ...req.body,
        groupId
      };
      
      const parsedData = insertGroupActivitySchema.parse(activityData);
      const newActivity = await storage.createGroupActivity(parsedData);
      res.status(201).json(newActivity);
    } catch (error) {
      res.status(400).json({ message: "创建活动失败", error });
    }
  });

  app.post('/api/group-activities/:id/join', async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const activity = await storage.joinGroupActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "活动不存在或已达到人数上限" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "加入活动失败", error });
    }
  });

  // 用户上传的知识内容接口
  app.get('/api/user-knowledge', async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const approved = req.query.approved === 'true' ? true : 
                       req.query.approved === 'false' ? false : undefined;
      
      if (userId) {
        const content = await storage.getUserKnowledgeContentByUserId(userId);
        return res.json(content);
      }
      
      const content = await storage.getAllUserKnowledgeContent(approved);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "获取用户知识内容失败", error });
    }
  });

  app.post('/api/user-knowledge', async (req, res) => {
    try {
      const contentData = insertUserKnowledgeContentSchema.parse(req.body);
      const newContent = await storage.createUserKnowledgeContent(contentData);
      res.status(201).json(newContent);
    } catch (error) {
      res.status(400).json({ message: "上传内容失败", error });
    }
  });

  app.post('/api/user-knowledge/:id/approve', async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const { pointsAwarded } = req.body;
      
      if (typeof pointsAwarded !== 'number' || pointsAwarded < 0) {
        return res.status(400).json({ message: "奖励积分必须是非负数" });
      }
      
      const content = await storage.approveUserKnowledgeContent(contentId, pointsAwarded);
      if (!content) {
        return res.status(404).json({ message: "内容不存在" });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "审核内容失败", error });
    }
  });

  app.post('/api/user-knowledge/:id/like', async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.likeUserKnowledgeContent(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "内容不存在" });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "点赞失败", error });
    }
  });

  // 用户积分接口
  app.post('/api/users/:id/points', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { points } = req.body;
      
      if (typeof points !== 'number') {
        return res.status(400).json({ message: "积分必须是数字" });
      }
      
      const user = await storage.addUserPoints(userId, points);
      if (!user) {
        return res.status(404).json({ message: "用户不存在" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "添加积分失败", error });
    }
  });

  // 任务分解API
  app.get('/api/tasks/breakdown', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.json([]);
      }
      
      // 获取任务列表
      const tasks = await storage.getTasksByUserId(userId);
      // 过滤并转换任务数据
      const breakdownTasks = tasks
        .filter(task => task.category === '分解任务')
        .map(task => {
          // 处理旧版格式数据
          if (task.adhd_data) {
            try {
              const adhd_data = JSON.parse(task.adhd_data as string);
              return {
                ...task,
                steps: adhd_data.steps || [],
                estimatedDuration: adhd_data.estimatedDuration,
                totalPoints: adhd_data.totalPoints
              };
            } catch (e) {
              console.error('解析adhd_data失败:', e);
              return {...task, steps: []};
            }
          } 
          // 使用新版格式数据
          return task;
        });
      
      res.json(breakdownTasks);
    } catch (error) {
      res.status(500).json({ message: "无法获取分解任务列表", error });
    }
  });
  
  app.post('/api/tasks/breakdown', async (req, res) => {
    try {
      const { userId, title, description, priority, steps, estimatedDuration, totalPoints } = req.body;
      
      if (!userId || !title || !steps || !Array.isArray(steps)) {
        return res.status(400).json({ message: "缺少必要的参数" });
      }
      
      // 创建基本任务
      const taskData = {
        userId, 
        title, 
        description: description || null,
        priority,
        completed: false,
        category: "分解任务",
        dueDate: null,
        scheduledTime: null,
        // 直接保存steps和其他属性，不再使用adhd_data
        steps: steps,
        estimatedDuration: estimatedDuration,
        totalPoints: totalPoints
      };
      
      // 通过扩展storage.createTask方法来处理新属性
      // @ts-ignore - 忽略类型检查，因为schema中可能还没有定义这些字段
      const newTask = await storage.createTask(taskData);
      
      res.status(201).json(newTask);
    } catch (error) {
      console.error("创建分解任务失败:", error);
      res.status(500).json({ message: "创建分解任务失败", error });
    }
  });
  
  app.post('/api/tasks/breakdown/:taskId/step/:stepIndex', async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const stepIndex = parseInt(req.params.stepIndex);
      const { isCompleted, userId, onTime } = req.body;
      
      if (typeof isCompleted !== 'boolean' || !userId) {
        return res.status(400).json({ message: "参数错误" });
      }
      
      // 获取任务
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "任务不存在" });
      }
      
      // 确保任务有steps字段
      if (!task.steps || !Array.isArray(task.steps) || stepIndex >= task.steps.length) {
        return res.status(400).json({ message: "无效的步骤索引" });
      }
      
      // 更新步骤状态
      const updatedSteps = [...task.steps];
      updatedSteps[stepIndex] = { 
        ...updatedSteps[stepIndex], 
        isCompleted 
      };
      
      // 更新任务
      const updatedTask = await storage.updateTask(taskId, { 
        steps: updatedSteps 
      });
      
      // 检查是否所有步骤都已完成
      const allStepsCompleted = updatedSteps.every(step => step.isCompleted);
      
      // 计算步骤奖励积分
      let pointsAwarded = 0;
      let bonusPoints = 0;
      
      if (isCompleted) {
        // 计算单个步骤的积分
        if (task.totalPoints) {
          // 如果任务有总积分，则计算单个步骤的积分比例
          const baseStepPoints = Math.round(task.totalPoints / task.steps.length);
          
          // 如果提供了是否准时完成的信息
          if (onTime === false) {
            // 延迟完成，减少30%积分
            pointsAwarded = Math.round(baseStepPoints * 0.7);
          } else {
            // 准时完成，获得全额积分
            pointsAwarded = baseStepPoints;
          }
        } else {
          // 没有总积分，使用默认值
          pointsAwarded = onTime === false ? 3 : 5;
        }
        
        // 更新用户积分
        const user = await storage.getUser(userId);
        if (user) {
          await storage.addUserPoints(userId, pointsAwarded);
        }
      }
      
      // 如果所有步骤都已完成且这是最后一个完成的步骤，奖励额外积分
      if (allStepsCompleted && isCompleted) {
        // 所有步骤都完成了，给额外20%的奖励
        bonusPoints = Math.round((task.totalPoints || updatedSteps.length * 5) * 0.2);
        await storage.addUserPoints(userId, bonusPoints);
      }
      
      // 返回更新后的任务和积分信息
      res.json({ 
        ...updatedTask, 
        steps: updatedSteps,
        allStepsCompleted, 
        pointsAwarded,
        bonusPoints,
        totalPointsAwarded: pointsAwarded + bonusPoints
      });
    } catch (error) {
      console.error('更新任务步骤失败:', error);
      res.status(500).json({ message: "服务器错误" });
    }
  });
  
  app.delete('/api/tasks/breakdown/:id', async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      
      // 直接使用现有的deleteTask方法
      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "任务不存在" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "删除任务失败", error });
    }
  });
  
  // 行为模式相关接口
  app.get('/api/behavior-patterns', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const patternType = req.query.type as string;
      const activeOnly = req.query.active === 'true';
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "用户ID为必填项" });
      }
      
      if (patternType) {
        const patterns = await storage.getBehaviorPatternsByType(userId, patternType);
        return res.json(patterns);
      }
      
      if (activeOnly) {
        const patterns = await storage.getActiveBehaviorPatterns(userId);
        return res.json(patterns);
      }
      
      const patterns = await storage.getBehaviorPatternsByUserId(userId);
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "获取行为模式失败", error });
    }
  });
  
  app.get('/api/behavior-patterns/:id', async (req, res) => {
    try {
      const patternId = parseInt(req.params.id);
      const pattern = await storage.getBehaviorPattern(patternId);
      
      if (!pattern) {
        return res.status(404).json({ message: "行为模式不存在" });
      }
      
      res.json(pattern);
    } catch (error) {
      res.status(500).json({ message: "获取行为模式详情失败", error });
    }
  });
  
  app.post('/api/behavior-patterns', async (req, res) => {
    try {
      const patternData = insertBehaviorPatternSchema.parse(req.body);
      const newPattern = await storage.createBehaviorPattern(patternData);
      res.status(201).json(newPattern);
    } catch (error) {
      res.status(400).json({ message: "Invalid pattern data", error });
    }
  });
  
  app.patch('/api/behavior-patterns/:id', async (req, res) => {
    try {
      const patternId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedPattern = await storage.updateBehaviorPattern(patternId, updates);
      if (!updatedPattern) {
        return res.status(404).json({ message: "行为模式不存在" });
      }
      
      res.json(updatedPattern);
    } catch (error) {
      res.status(500).json({ message: "更新行为模式失败", error });
    }
  });
  
  // 行为记录相关接口
  app.get('/api/behavior-records', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const patternId = parseInt(req.query.patternId as string);
      
      if (!isNaN(patternId)) {
        const records = await storage.getBehaviorRecordsByPatternId(patternId);
        return res.json(records);
      }
      
      if (!isNaN(userId)) {
        const records = await storage.getBehaviorRecordsByUserId(userId);
        return res.json(records);
      }
      
      return res.status(400).json({ message: "用户ID或模式ID为必填项" });
    } catch (error) {
      res.status(500).json({ message: "获取行为记录失败", error });
    }
  });
  
  app.get('/api/behavior-records/:id', async (req, res) => {
    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getBehaviorRecord(recordId);
      
      if (!record) {
        return res.status(404).json({ message: "行为记录不存在" });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "获取行为记录详情失败", error });
    }
  });
  
  app.post('/api/behavior-records', async (req, res) => {
    try {
      const recordData = insertBehaviorRecordSchema.parse(req.body);
      const newRecord = await storage.createBehaviorRecord(recordData);
      res.status(201).json(newRecord);
    } catch (error) {
      res.status(400).json({ message: "Invalid record data", error });
    }
  });
  
  // 干预策略相关接口
  app.get('/api/intervention-strategies', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const patternId = parseInt(req.query.patternId as string);
      const activeOnly = req.query.active === 'true';
      
      if (!isNaN(patternId)) {
        const strategies = await storage.getInterventionStrategiesByPatternId(patternId);
        return res.json(strategies);
      }
      
      if (!isNaN(userId)) {
        if (activeOnly) {
          const strategies = await storage.getActiveInterventionStrategies(userId);
          return res.json(strategies);
        }
        
        const strategies = await storage.getInterventionStrategiesByUserId(userId);
        return res.json(strategies);
      }
      
      return res.status(400).json({ message: "用户ID或模式ID为必填项" });
    } catch (error) {
      res.status(500).json({ message: "获取干预策略失败", error });
    }
  });
  
  app.get('/api/intervention-strategies/:id', async (req, res) => {
    try {
      const strategyId = parseInt(req.params.id);
      const strategy = await storage.getInterventionStrategy(strategyId);
      
      if (!strategy) {
        return res.status(404).json({ message: "干预策略不存在" });
      }
      
      res.json(strategy);
    } catch (error) {
      res.status(500).json({ message: "获取干预策略详情失败", error });
    }
  });
  
  app.post('/api/intervention-strategies', async (req, res) => {
    try {
      const strategyData = insertInterventionStrategySchema.parse(req.body);
      const newStrategy = await storage.createInterventionStrategy(strategyData);
      res.status(201).json(newStrategy);
    } catch (error) {
      res.status(400).json({ message: "Invalid strategy data", error });
    }
  });
  
  app.patch('/api/intervention-strategies/:id', async (req, res) => {
    try {
      const strategyId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedStrategy = await storage.updateInterventionStrategy(strategyId, updates);
      if (!updatedStrategy) {
        return res.status(404).json({ message: "干预策略不存在" });
      }
      
      res.json(updatedStrategy);
    } catch (error) {
      res.status(500).json({ message: "更新干预策略失败", error });
    }
  });
  
  app.post('/api/intervention-strategies/:id/rate', async (req, res) => {
    try {
      const strategyId = parseInt(req.params.id);
      const { effectiveness } = req.body;
      
      if (typeof effectiveness !== 'number' || effectiveness < 1 || effectiveness > 5) {
        return res.status(400).json({ message: "有效性评分必须在1-5之间" });
      }
      
      const strategy = await storage.rateInterventionEffectiveness(strategyId, effectiveness);
      if (!strategy) {
        return res.status(404).json({ message: "干预策略不存在" });
      }
      
      res.json(strategy);
    } catch (error) {
      res.status(500).json({ message: "评价干预策略失败", error });
    }
  });
  
  // 个性化推荐引擎接口
  app.get('/api/user-interests/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "用户ID格式错误" });
      }
      
      const interests = await storage.getUserInterests(userId);
      res.json(interests);
    } catch (error) {
      res.status(500).json({ message: "获取用户兴趣失败", error });
    }
  });
  
  app.post('/api/user-interests', async (req, res) => {
    try {
      const interestData = insertUserInterestSchema.parse(req.body);
      const newInterest = await storage.addUserInterest(interestData);
      res.status(201).json(newInterest);
    } catch (error) {
      res.status(400).json({ message: "无效的兴趣数据", error });
    }
  });
  
  app.patch('/api/user-interests/:id/weight', async (req, res) => {
    try {
      const interestId = parseInt(req.params.id);
      const { weight } = req.body;
      
      if (typeof weight !== 'number' || weight < 0 || weight > 10) {
        return res.status(400).json({ message: "权重必须是0-10之间的数字" });
      }
      
      const updatedInterest = await storage.updateUserInterestWeight(interestId, weight);
      if (!updatedInterest) {
        return res.status(404).json({ message: "兴趣不存在" });
      }
      
      res.json(updatedInterest);
    } catch (error) {
      res.status(500).json({ message: "更新兴趣权重失败", error });
    }
  });
  
  app.delete('/api/user-interests/:id', async (req, res) => {
    try {
      const interestId = parseInt(req.params.id);
      const result = await storage.removeUserInterest(interestId);
      
      if (!result) {
        return res.status(404).json({ message: "兴趣不存在" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "删除兴趣失败", error });
    }
  });
  
  app.get('/api/task-recommendations/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "用户ID格式错误" });
      }
      
      const recommendations = await storage.getTaskRecommendations(userId, limit);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "获取任务推荐失败", error });
    }
  });
  
  app.post('/api/task-recommendations', async (req, res) => {
    try {
      const recommendationData = insertTaskRecommendationSchema.parse(req.body);
      const newRecommendation = await storage.createTaskRecommendation(recommendationData);
      res.status(201).json(newRecommendation);
    } catch (error) {
      res.status(400).json({ message: "无效的推荐数据", error });
    }
  });
  
  app.post('/api/task-recommendations/:id/accept', async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      const acceptedRecommendation = await storage.acceptTaskRecommendation(recommendationId);
      
      if (!acceptedRecommendation) {
        return res.status(404).json({ message: "推荐不存在" });
      }
      
      res.json(acceptedRecommendation);
    } catch (error) {
      res.status(500).json({ message: "接受推荐失败", error });
    }
  });
  
  app.post('/api/task-recommendations/:id/reject', async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      const result = await storage.rejectTaskRecommendation(recommendationId);
      
      if (!result) {
        return res.status(404).json({ message: "推荐不存在" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "拒绝推荐失败", error });
    }
  });
  
  app.post('/api/task-recommendations/generate/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "用户ID格式错误" });
      }
      
      const recommendations = await storage.generateTaskRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "生成推荐失败", error });
    }
  });
  
  // 行为分析接口
  app.get('/api/behavior-analysis/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "用户ID格式错误" });
      }
      
      const analysis = await storage.analyzeUserBehavior(userId);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "分析用户行为失败", error });
    }
  });

  return httpServer;
}
