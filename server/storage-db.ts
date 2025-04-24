import { db } from './db';
import { eq, and, desc, isNull, exists, sql } from 'drizzle-orm';
import {
  users,
  tasks,
  knowledgeContent,
  communityPosts,
  comments,
  events,
  focusSessions,
  identityGroups,
  groupMembers,
  groupActivities,
  userKnowledgeContent,
  behaviorPatterns,
  behaviorRecords,
  interventionStrategies,
  userInterests,
  taskRecommendations,
  type User,
  type Task,
  type KnowledgeContent,
  type CommunityPost,
  type Comment,
  type Event,
  type FocusSession,
  type IdentityGroup,
  type GroupMember,
  type GroupActivity,
  type UserKnowledgeContent,
  type BehaviorPattern,
  type BehaviorRecord,
  type InterventionStrategy,
  type UserInterest,
  type TaskRecommendation,
  type InsertUser,
  type InsertTask,
  type InsertKnowledgeContent,
  type InsertCommunityPost,
  type InsertComment,
  type InsertEvent,
  type InsertFocusSession,
  type InsertIdentityGroup,
  type InsertGroupMember,
  type InsertGroupActivity,
  type InsertUserKnowledgeContent,
  type InsertBehaviorPattern,
  type InsertBehaviorRecord,
  type InsertInterventionStrategy,
  type InsertUserInterest,
  type InsertTaskRecommendation
} from '@shared/schema';
import { IStorage } from './storage';
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from 'pg';

// 创建一个连接池
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 创建会话存储
const PostgresSessionStore = connectPg(session);

/**
 * 数据库存储实现类
 */
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async addUserPoints(userId: number, points: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        points: sql`${users.points} + ${points}` 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getConsultants(): Promise<User[]> {
    const consultants = await db
      .select()
      .from(users)
      .where(eq(users.isConsultant, true));
    return consultants;
  }

  async getUsersByIdentityTag(tag: string): Promise<User[]> {
    const usersWithTag = await db
      .select()
      .from(users)
      .where(sql`${tag} = ANY(${users.identityTags})`);
    return usersWithTag;
  }

  // 用户兴趣方法
  async getUserInterests(userId: number): Promise<UserInterest[]> {
    return db
      .select()
      .from(userInterests)
      .where(eq(userInterests.userId, userId));
  }

  async addUserInterest(interest: InsertUserInterest): Promise<UserInterest> {
    const [newInterest] = await db
      .insert(userInterests)
      .values(interest)
      .returning();
    return newInterest;
  }

  async updateUserInterestWeight(id: number, weight: number): Promise<UserInterest | undefined> {
    const [updatedInterest] = await db
      .update(userInterests)
      .set({ weight })
      .where(eq(userInterests.id, id))
      .returning();
    return updatedInterest;
  }

  async removeUserInterest(id: number): Promise<boolean> {
    const result = await db
      .delete(userInterests)
      .where(eq(userInterests.id, id))
      .returning({ id: userInterests.id });
    return result.length > 0;
  }

  // 任务推荐方法
  async getTaskRecommendations(userId: number, limit?: number): Promise<TaskRecommendation[]> {
    const query = db
      .select()
      .from(taskRecommendations)
      .where(
        and(
          eq(taskRecommendations.userId, userId),
          eq(taskRecommendations.isAccepted, false)
        )
      )
      .orderBy(desc(taskRecommendations.score));

    if (limit) {
      query.limit(limit);
    }

    return await query;
  }

  async createTaskRecommendation(recommendation: InsertTaskRecommendation): Promise<TaskRecommendation> {
    const [newRecommendation] = await db
      .insert(taskRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async acceptTaskRecommendation(id: number): Promise<TaskRecommendation | undefined> {
    const [recommendation] = await db
      .update(taskRecommendations)
      .set({ isAccepted: true })
      .where(eq(taskRecommendations.id, id))
      .returning();
    
    if (!recommendation) {
      return undefined;
    }

    // 创建对应的任务
    const taskData: InsertTask = {
      userId: recommendation.userId,
      title: recommendation.title,
      description: recommendation.description,
      priority: recommendation.priority,
      category: recommendation.category,
      estimatedDuration: recommendation.estimatedDuration,
      completed: false,
      dueDate: null,
      scheduledTime: null,
      adhd_data: null,
      steps: [],
      totalPoints: null
    };

    await this.createTask(taskData);
    return recommendation;
  }

  async rejectTaskRecommendation(id: number): Promise<boolean> {
    const result = await db
      .delete(taskRecommendations)
      .where(eq(taskRecommendations.id, id))
      .returning({ id: taskRecommendations.id });
    return result.length > 0;
  }

  // 这是一个复杂的方法，需要根据用户的兴趣和行为模式生成推荐
  async generateTaskRecommendations(userId: number): Promise<TaskRecommendation[]> {
    // 获取用户兴趣
    const userInterestsList = await this.getUserInterests(userId);
    
    // 获取活跃的行为模式
    const activePatterns = await this.getActiveBehaviorPatterns(userId);
    
    const recommendations: TaskRecommendation[] = [];
    
    // 基于兴趣的推荐
    for (const interest of userInterestsList) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7天有效期
      
      const newRecommendation: InsertTaskRecommendation = {
        userId,
        title: `探索 ${interest.interest}`,
        description: `根据你的兴趣，我们推荐你花时间探索 ${interest.interest}`,
        priority: "Medium",
        category: "兴趣探索",
        estimatedDuration: 30,
        reason: `这是基于你对${interest.interest}的兴趣推荐的`,
        sourceType: "interest",
        sourceId: interest.id,
        score: interest.weight * 10,
        expiresAt: expiryDate,
      };
      
      const rec = await this.createTaskRecommendation(newRecommendation);
      recommendations.push(rec);
    }
    
    // 基于行为模式的推荐
    for (const pattern of activePatterns) {
      if (pattern.patternType === 'task_postponement' || pattern.patternType === 'procrastination') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 3); // 3天有效期
        
        const newRecommendation: InsertTaskRecommendation = {
          userId,
          title: "实践番茄工作法",
          description: "尝试使用番茄工作法来提高专注度和减少拖延",
          priority: "High",
          category: "自我提升",
          estimatedDuration: 25,
          reason: "这是基于你的拖延行为模式推荐的专注技巧",
          sourceType: "pattern",
          sourceId: pattern.id,
          score: 90,
          expiresAt: expiryDate,
        };
        
        const rec = await this.createTaskRecommendation(newRecommendation);
        recommendations.push(rec);
      }
      
      if (pattern.patternType === 'distraction') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 3); // 3天有效期
        
        const newRecommendation: InsertTaskRecommendation = {
          userId,
          title: "创建一个无干扰工作环境",
          description: "设置一个最小化干扰的环境，例如关闭通知、使用降噪耳机等",
          priority: "High",
          category: "环境优化",
          estimatedDuration: 15,
          reason: "这是基于你容易分心的行为模式推荐的",
          sourceType: "pattern",
          sourceId: pattern.id,
          score: 85,
          expiresAt: expiryDate,
        };
        
        const rec = await this.createTaskRecommendation(newRecommendation);
        recommendations.push(rec);
      }
    }
    
    return recommendations;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    // 不需要数组形式，直接传递值
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });
    return result.length > 0;
  }

  // Knowledge Content methods
  async getKnowledgeContent(id: number): Promise<KnowledgeContent | undefined> {
    const [content] = await db.select().from(knowledgeContent).where(eq(knowledgeContent.id, id));
    return content;
  }

  async getAllKnowledgeContent(): Promise<KnowledgeContent[]> {
    return db.select().from(knowledgeContent);
  }

  async getKnowledgeContentByType(type: string): Promise<KnowledgeContent[]> {
    return db.select().from(knowledgeContent).where(eq(knowledgeContent.type, type));
  }

  async getFeaturedKnowledgeContent(): Promise<KnowledgeContent[]> {
    return db.select().from(knowledgeContent).where(eq(knowledgeContent.isFeatured, true));
  }

  async createKnowledgeContent(content: InsertKnowledgeContent): Promise<KnowledgeContent> {
    const [newContent] = await db.insert(knowledgeContent).values(content).returning();
    return newContent;
  }

  // User Knowledge Content methods
  async getUserKnowledgeContent(id: number): Promise<UserKnowledgeContent | undefined> {
    const [content] = await db.select().from(userKnowledgeContent).where(eq(userKnowledgeContent.id, id));
    return content;
  }

  async getUserKnowledgeContentByUserId(userId: number): Promise<UserKnowledgeContent[]> {
    return db.select().from(userKnowledgeContent).where(eq(userKnowledgeContent.userId, userId));
  }

  async getAllUserKnowledgeContent(approved?: boolean): Promise<UserKnowledgeContent[]> {
    if (approved !== undefined) {
      return db
        .select()
        .from(userKnowledgeContent)
        .where(eq(userKnowledgeContent.isApproved, approved));
    }
    return db.select().from(userKnowledgeContent);
  }

  async createUserKnowledgeContent(content: InsertUserKnowledgeContent): Promise<UserKnowledgeContent> {
    const [newContent] = await db.insert(userKnowledgeContent).values(content).returning();
    return newContent;
  }

  async approveUserKnowledgeContent(id: number, pointsAwarded: number): Promise<UserKnowledgeContent | undefined> {
    const [content] = await db
      .update(userKnowledgeContent)
      .set({ 
        isApproved: true,
        pointsEarned: pointsAwarded 
      })
      .where(eq(userKnowledgeContent.id, id))
      .returning();

    if (content && pointsAwarded > 0) {
      await this.addUserPoints(content.userId, pointsAwarded);
    }
    
    return content;
  }

  async likeUserKnowledgeContent(id: number): Promise<UserKnowledgeContent | undefined> {
    const [content] = await db
      .update(userKnowledgeContent)
      .set({ 
        likes: sql`${userKnowledgeContent.likes} + 1` 
      })
      .where(eq(userKnowledgeContent.id, id))
      .returning();
    return content;
  }

  // Community Posts methods
  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    return post;
  }

  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db.insert(communityPosts).values(post).returning();
    return newPost;
  }

  async likePost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db
      .update(communityPosts)
      .set({ 
        likes: sql`${communityPosts.likes} + 1` 
      })
      .where(eq(communityPosts.id, id))
      .returning();
    return post;
  }

  // Comments methods
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.postId, postId));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // 更新帖子的评论计数
    await db
      .update(communityPosts)
      .set({ 
        commentCount: sql`${communityPosts.commentCount} + 1` 
      })
      .where(eq(communityPosts.id, comment.postId));
    
    return newComment;
  }

  // Events methods
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  // Focus Sessions methods
  async getFocusSession(id: number): Promise<FocusSession | undefined> {
    const [session] = await db.select().from(focusSessions).where(eq(focusSessions.id, id));
    return session;
  }

  async getFocusSessionsByUserId(userId: number): Promise<FocusSession[]> {
    return db.select().from(focusSessions).where(eq(focusSessions.userId, userId));
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const [newSession] = await db.insert(focusSessions).values(session).returning();
    return newSession;
  }

  async updateFocusSession(id: number, updates: Partial<FocusSession>): Promise<FocusSession | undefined> {
    const [updatedSession] = await db
      .update(focusSessions)
      .set(updates)
      .where(eq(focusSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Identity Groups methods
  async getIdentityGroup(id: number): Promise<IdentityGroup | undefined> {
    const [group] = await db.select().from(identityGroups).where(eq(identityGroups.id, id));
    return group;
  }

  async getIdentityGroupsByIdentityTag(tag: string): Promise<IdentityGroup[]> {
    return db.select().from(identityGroups).where(eq(identityGroups.identityTag, tag));
  }

  async getAllIdentityGroups(): Promise<IdentityGroup[]> {
    return db.select().from(identityGroups);
  }

  async createIdentityGroup(group: InsertIdentityGroup): Promise<IdentityGroup> {
    const [newGroup] = await db.insert(identityGroups).values(group).returning();
    return newGroup;
  }

  async updateIdentityGroup(id: number, updates: Partial<IdentityGroup>): Promise<IdentityGroup | undefined> {
    const [updatedGroup] = await db
      .update(identityGroups)
      .set(updates)
      .where(eq(identityGroups.id, id))
      .returning();
    return updatedGroup;
  }

  async addGroupPoints(groupId: number, points: number): Promise<IdentityGroup | undefined> {
    const [group] = await db
      .update(identityGroups)
      .set({ 
        points: sql`${identityGroups.points} + ${points}` 
      })
      .where(eq(identityGroups.id, groupId))
      .returning();
    return group;
  }

  async assignConsultantToGroup(groupId: number, consultantId: number): Promise<IdentityGroup | undefined> {
    // 首先检查顾问是否存在且是有效的顾问
    const [consultant] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, consultantId),
          eq(users.isConsultant, true)
        )
      );
    
    if (!consultant) {
      return undefined;
    }
    
    const [group] = await db
      .update(identityGroups)
      .set({ 
        consultantId,
        hasConsultant: true 
      })
      .where(eq(identityGroups.id, groupId))
      .returning();
    
    return group;
  }

  // Group Members methods
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
  }

  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [newMember] = await db.insert(groupMembers).values(member).returning();
    
    // 更新群组成员计数
    await db
      .update(identityGroups)
      .set({ 
        memberCount: sql`${identityGroups.memberCount} + 1` 
      })
      .where(eq(identityGroups.id, member.groupId));
    
    return newMember;
  }

  async updateGroupMemberRole(groupId: number, userId: number, role: string): Promise<GroupMember | undefined> {
    const [member] = await db
      .update(groupMembers)
      .set({ role })
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      )
      .returning();
    return member;
  }

  async removeGroupMember(groupId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      )
      .returning({ 
        groupId: groupMembers.groupId,
        userId: groupMembers.userId 
      });
    
    if (result.length > 0) {
      // 更新群组成员计数
      await db
        .update(identityGroups)
        .set({ 
          memberCount: sql`GREATEST(${identityGroups.memberCount} - 1, 0)` 
        })
        .where(eq(identityGroups.id, groupId));
      
      return true;
    }
    
    return false;
  }

  // Group Activities methods
  async getGroupActivity(id: number): Promise<GroupActivity | undefined> {
    const [activity] = await db.select().from(groupActivities).where(eq(groupActivities.id, id));
    return activity;
  }

  async getGroupActivitiesByGroupId(groupId: number): Promise<GroupActivity[]> {
    return db.select().from(groupActivities).where(eq(groupActivities.groupId, groupId));
  }

  async createGroupActivity(activity: InsertGroupActivity): Promise<GroupActivity> {
    const [newActivity] = await db.insert(groupActivities).values(activity).returning();
    return newActivity;
  }

  async joinGroupActivity(activityId: number): Promise<GroupActivity | undefined> {
    // 检查活动是否达到参与者上限
    const [activity] = await db
      .select()
      .from(groupActivities)
      .where(
        and(
          eq(groupActivities.id, activityId),
          sql`${groupActivities.currentParticipants} < ${groupActivities.participantLimit} OR ${groupActivities.participantLimit} = 0`
        )
      );
    
    if (!activity) {
      return undefined;
    }
    
    const [updatedActivity] = await db
      .update(groupActivities)
      .set({ 
        currentParticipants: sql`${groupActivities.currentParticipants} + 1` 
      })
      .where(eq(groupActivities.id, activityId))
      .returning();
    
    return updatedActivity;
  }

  // 行为模式方法
  async getBehaviorPattern(id: number): Promise<BehaviorPattern | undefined> {
    const [pattern] = await db.select().from(behaviorPatterns).where(eq(behaviorPatterns.id, id));
    return pattern;
  }

  async getBehaviorPatternsByUserId(userId: number): Promise<BehaviorPattern[]> {
    return db.select().from(behaviorPatterns).where(eq(behaviorPatterns.userId, userId));
  }

  async getBehaviorPatternsByType(userId: number, patternType: string): Promise<BehaviorPattern[]> {
    return db
      .select()
      .from(behaviorPatterns)
      .where(
        and(
          eq(behaviorPatterns.userId, userId),
          eq(behaviorPatterns.patternType, patternType)
        )
      );
  }

  async getActiveBehaviorPatterns(userId: number): Promise<BehaviorPattern[]> {
    return db
      .select()
      .from(behaviorPatterns)
      .where(
        and(
          eq(behaviorPatterns.userId, userId),
          eq(behaviorPatterns.isActive, true)
        )
      );
  }

  async createBehaviorPattern(pattern: InsertBehaviorPattern): Promise<BehaviorPattern> {
    const [newPattern] = await db.insert(behaviorPatterns).values(pattern).returning();
    return newPattern;
  }

  async updateBehaviorPattern(id: number, updates: Partial<BehaviorPattern>): Promise<BehaviorPattern | undefined> {
    const [updatedPattern] = await db
      .update(behaviorPatterns)
      .set({
        ...updates,
        lastUpdatedAt: new Date()  
      })
      .where(eq(behaviorPatterns.id, id))
      .returning();
    return updatedPattern;
  }

  // 行为记录方法
  async getBehaviorRecord(id: number): Promise<BehaviorRecord | undefined> {
    const [record] = await db.select().from(behaviorRecords).where(eq(behaviorRecords.id, id));
    return record;
  }

  async getBehaviorRecordsByPatternId(patternId: number): Promise<BehaviorRecord[]> {
    return db.select().from(behaviorRecords).where(eq(behaviorRecords.patternId, patternId));
  }

  async getBehaviorRecordsByUserId(userId: number): Promise<BehaviorRecord[]> {
    return db.select().from(behaviorRecords).where(eq(behaviorRecords.userId, userId));
  }

  async createBehaviorRecord(record: InsertBehaviorRecord): Promise<BehaviorRecord> {
    const [newRecord] = await db.insert(behaviorRecords).values(record).returning();
    return newRecord;
  }

  // 干预策略方法
  async getInterventionStrategy(id: number): Promise<InterventionStrategy | undefined> {
    const [strategy] = await db.select().from(interventionStrategies).where(eq(interventionStrategies.id, id));
    return strategy;
  }

  async getInterventionStrategiesByPatternId(patternId: number): Promise<InterventionStrategy[]> {
    return db
      .select()
      .from(interventionStrategies)
      .where(eq(interventionStrategies.patternId, patternId));
  }

  async getInterventionStrategiesByUserId(userId: number): Promise<InterventionStrategy[]> {
    return db
      .select()
      .from(interventionStrategies)
      .where(eq(interventionStrategies.userId, userId));
  }

  async getActiveInterventionStrategies(userId: number): Promise<InterventionStrategy[]> {
    return db
      .select()
      .from(interventionStrategies)
      .where(
        and(
          eq(interventionStrategies.userId, userId),
          eq(interventionStrategies.isEnabled, true)
        )
      );
  }

  async createInterventionStrategy(strategy: InsertInterventionStrategy): Promise<InterventionStrategy> {
    const [newStrategy] = await db.insert(interventionStrategies).values(strategy).returning();
    return newStrategy;
  }

  async updateInterventionStrategy(id: number, updates: Partial<InterventionStrategy>): Promise<InterventionStrategy | undefined> {
    const [updatedStrategy] = await db
      .update(interventionStrategies)
      .set(updates)
      .where(eq(interventionStrategies.id, id))
      .returning();
    return updatedStrategy;
  }

  async rateInterventionEffectiveness(id: number, effectiveness: number): Promise<InterventionStrategy | undefined> {
    const [strategy] = await db
      .update(interventionStrategies)
      .set({ effectiveness })
      .where(eq(interventionStrategies.id, id))
      .returning();
    return strategy;
  }

  // 行为分析方法
  async analyzeUserBehavior(userId: number): Promise<{ 
    patterns: BehaviorPattern[],
    recommendations: InterventionStrategy[] 
  }> {
    // 获取用户的活跃行为模式
    const patterns = await this.getActiveBehaviorPatterns(userId);
    
    // 为每种模式获取推荐策略
    const allRecommendations: InterventionStrategy[] = [];
    
    for (const pattern of patterns) {
      const strategies = await this.getInterventionStrategiesByPatternId(pattern.id);
      allRecommendations.push(...strategies);
    }
    
    // 按效果排序
    const sortedRecommendations = allRecommendations.sort((a, b) => {
      if (a.effectiveness === null && b.effectiveness === null) return 0;
      if (a.effectiveness === null) return 1;
      if (b.effectiveness === null) return -1;
      return b.effectiveness - a.effectiveness;
    });
    
    return {
      patterns,
      recommendations: sortedRecommendations
    };
  }
}

// 导出数据库存储实例
export const dbStorage = new DatabaseStorage();