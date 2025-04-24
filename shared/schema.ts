import { pgTable, text, serial, integer, boolean, timestamp, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  profileImage: text("profile_image"),
  joinedDate: timestamp("joined_date").defaultNow().notNull(),
  adhd_profile: json("adhd_profile"),
  // 新增属性
  identityTags: text("identity_tags").array(), // 身份标签: ['学生', '画家', '作家', ...]
  isConsultant: boolean("is_consultant").default(false).notNull(), // 是否是顾问专家
  consultantTitle: text("consultant_title"), // 顾问职称，如有
  consultantBio: text("consultant_bio"), // 顾问简介，如有
  consultantVerified: boolean("consultant_verified").default(false).notNull(), // 顾问认证状态
  points: integer("points").default(0).notNull(), // 用户积分
});

// Task Step type
export const taskStepSchema = z.object({
  description: z.string(),
  estimatedDuration: z.number().optional(),
  isCompleted: z.boolean().default(false)
});
export type TaskStep = z.infer<typeof taskStepSchema>;

// Task model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  dueDate: timestamp("due_date"),
  scheduledTime: text("scheduled_time"),
  priority: text("priority").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  adhd_data: json("adhd_data"), // 向后兼容的JSON字段
  // 任务步骤和分解相关属性
  steps: json("steps").$type<TaskStep[]>(), // 任务步骤
  estimatedDuration: integer("estimated_duration"), // 预计总时长(分钟)
  totalPoints: integer("total_points"), // 完成任务可获得的总积分
});

// Knowledge Content model
export const knowledgeContent = pgTable("knowledge_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'article', 'video', 'research'
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  author: text("author"),
  authorTitle: text("author_title"),
  publishedDate: timestamp("published_date").defaultNow().notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  duration: text("duration"), // For videos - e.g. "12:45"
  tags: text("tags").array(),
  isFeatured: boolean("is_featured").default(false).notNull(),
});

// Community Posts model
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  likes: integer("likes").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
});

// Comments model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community Events model
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location"),
  isVirtual: boolean("is_virtual").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull(),
});

// Focus Sessions model
export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  duration: integer("duration").notNull(), // in minutes
  taskId: integer("task_id"),
  technique: text("technique"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  completed: boolean("completed").default(false).notNull(),
});

// 小圈子(身份群组)模型
export const identityGroups = pgTable("identity_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  identityTag: text("identity_tag").notNull(), // 对应的身份标签
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull(), // 创建者ID
  avatarUrl: text("avatar_url"), // 群组头像
  memberCount: integer("member_count").default(0).notNull(), // 成员数量
  isVerified: boolean("is_verified").default(false).notNull(), // 是否为认证小圈子
  consultantId: integer("consultant_id"), // 指定顾问ID，如果有的话
  hasConsultant: boolean("has_consultant").default(false).notNull(), // 是否有顾问
  points: integer("points").default(0).notNull(), // 小圈子积分
  rules: text("rules"), // 小圈子规则
});

// 小圈子成员关系模型
export const groupMembers = pgTable(
  "group_members", 
  {
    groupId: integer("group_id").notNull(),
    userId: integer("user_id").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    role: text("role").default("member").notNull(), // member, admin, consultant
  },
  (table) => {
    return {
      pk: primaryKey(table.groupId, table.userId),
    };
  }
);

// 小圈子活动模型
export const groupActivities = pgTable("group_activities", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  activityDate: timestamp("activity_date").notNull(),
  location: text("location"),
  isVirtual: boolean("is_virtual").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull(),
  participantLimit: integer("participant_limit").default(0).notNull(),
  currentParticipants: integer("current_participants").default(0).notNull(),
});

// 用户上传的知识内容模型
export const userKnowledgeContent = pgTable("user_knowledge_content", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'article', 'video', 'research'
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  sourceUrl: text("source_url"), // 来源链接
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(), // 是否已审核通过
  tags: text("tags").array(),
  pointsEarned: integer("points_earned").default(0).notNull(), // 获得的积分
});

// 行为模式类型
export const behaviorPatternTypes = {
  TASK_POSTPONEMENT: 'task_postponement', // the user frequently postpones tasks
  DISTRACTION: 'distraction', // the user gets easily distracted during focus sessions
  TIME_UNDERESTIMATION: 'time_underestimation', // the user consistently underestimates task duration
  HYPERFOCUS: 'hyperfocus', // the user gets into hyperfocus states
  PROCRASTINATION: 'procrastination', // the user procrastinates on starting tasks
  INCOMPLETE_TASKS: 'incomplete_tasks', // the user has many incomplete tasks
  INCONSISTENT_ROUTINE: 'inconsistent_routine', // the user has inconsistent daily routines
  EMOTIONAL_REGULATION: 'emotional_regulation', // the user shows signs of emotional dysregulation
} as const;

// 行为模式模型
export const behaviorPatterns = pgTable("behavior_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  patternType: text("pattern_type").notNull(), // 使用 behaviorPatternTypes 中的值
  confidence: integer("confidence").notNull(), // 置信度：0-100
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
  frequency: integer("frequency").default(0).notNull(), // 行为频率
  severity: integer("severity").default(1).notNull(), // 严重程度：1-5
  isActive: boolean("is_active").default(true).notNull(), // 该行为模式是否当前活跃
  metadata: json("metadata"), // 额外的模式信息
});

// 行为记录模型（具体的行为实例）
export const behaviorRecords = pgTable("behavior_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  patternId: integer("pattern_id").notNull(), // 关联的行为模式
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  context: text("context").notNull(), // 行为发生的上下文，如 "focus_session", "task_management"
  details: json("details"), // 详细信息
  taskId: integer("task_id"), // 可能与任务相关
  focusSessionId: integer("focus_session_id"), // 可能与专注会话相关
});

// 干预策略类型
export const interventionTypes = {
  REMINDER: 'reminder', // 提醒
  SUGGESTION: 'suggestion', // 建议
  ENCOURAGEMENT: 'encouragement', // 鼓励
  REDIRECTION: 'redirection', // 重定向注意力
  BREAK_REMINDER: 'break_reminder', // 提醒休息
  TECHNIQUE_SUGGESTION: 'technique_suggestion', // 建议使用特定技巧
  GOAL_ADJUSTMENT: 'goal_adjustment', // 调整目标
  ENVIRONMENT_CHANGE: 'environment_change', // 改变环境
} as const;

// 干预策略模型
export const interventionStrategies = pgTable("intervention_strategies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  patternId: integer("pattern_id").notNull(), // 针对的行为模式
  interventionType: text("intervention_type").notNull(), // 使用 interventionTypes 中的值
  title: text("title").notNull(), // 干预标题
  content: text("content").notNull(), // 干预内容
  trigger: text("trigger").notNull(), // 触发条件，如 "on_pattern_detection", "before_task", "during_focus"
  frequency: text("frequency").notNull(), // 频率，如 "once", "daily", "every_occurrence"
  isEnabled: boolean("is_enabled").default(true).notNull(), // 是否启用
  effectiveness: integer("effectiveness"), // 有效性评分：1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"), // 上次触发时间
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  joinedDate: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeContentSchema = createInsertSchema(knowledgeContent).omit({
  id: true,
  publishedDate: true,
  viewCount: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  createdAt: true,
  likes: true,
  commentCount: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({
  id: true,
});

// 新增模型的Insert Schema
export const insertIdentityGroupSchema = createInsertSchema(identityGroups).omit({
  id: true,
  createdAt: true,
  memberCount: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  joinedAt: true,
});

export const insertGroupActivitySchema = createInsertSchema(groupActivities).omit({
  id: true,
  createdAt: true,
  currentParticipants: true,
});

export const insertUserKnowledgeContentSchema = createInsertSchema(userKnowledgeContent).omit({
  id: true,
  uploadedAt: true,
  viewCount: true,
  likes: true,
  isApproved: true,
  pointsEarned: true,
});

// 行为分析相关的Insert Schema
export const insertBehaviorPatternSchema = createInsertSchema(behaviorPatterns).omit({
  id: true,
  detectedAt: true,
  lastUpdatedAt: true,
});

export const insertBehaviorRecordSchema = createInsertSchema(behaviorRecords).omit({
  id: true,
  recordedAt: true,
});

export const insertInterventionStrategySchema = createInsertSchema(interventionStrategies).omit({
  id: true,
  createdAt: true,
  lastTriggeredAt: true,
});

// Types for insert
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertKnowledgeContent = z.infer<typeof insertKnowledgeContentSchema>;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type InsertIdentityGroup = z.infer<typeof insertIdentityGroupSchema>;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type InsertGroupActivity = z.infer<typeof insertGroupActivitySchema>;
export type InsertUserKnowledgeContent = z.infer<typeof insertUserKnowledgeContentSchema>;
export type InsertBehaviorPattern = z.infer<typeof insertBehaviorPatternSchema>;
export type InsertBehaviorRecord = z.infer<typeof insertBehaviorRecordSchema>;
export type InsertInterventionStrategy = z.infer<typeof insertInterventionStrategySchema>;

// Types for select
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type KnowledgeContent = typeof knowledgeContent.$inferSelect;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Event = typeof events.$inferSelect;
export type FocusSession = typeof focusSessions.$inferSelect;
export type IdentityGroup = typeof identityGroups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type GroupActivity = typeof groupActivities.$inferSelect;
export type UserKnowledgeContent = typeof userKnowledgeContent.$inferSelect;
export type BehaviorPattern = typeof behaviorPatterns.$inferSelect;
export type BehaviorRecord = typeof behaviorRecords.$inferSelect;
export type InterventionStrategy = typeof interventionStrategies.$inferSelect;

// 用户兴趣模型
export const userInterests = pgTable("user_interests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  interest: text("interest").notNull(),
  weight: integer("weight").notNull().default(5), // 1-10的权重值
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// 任务推荐模型
export const taskRecommendations = pgTable("task_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  priority: text("priority").notNull().default("Medium"),
  estimatedDuration: integer("estimated_duration"), // 预计完成时间（分钟）
  reason: text("reason").notNull(), // 推荐理由
  sourceType: text("source_type").notNull(), // interest（兴趣）, pattern（行为模式）, trend（趋势）
  sourceId: integer("source_id"), // 关联的兴趣ID或行为模式ID
  score: integer("score").notNull().default(0), // 匹配分数，用于排序
  isAccepted: boolean("is_accepted").notNull().default(false), // 用户是否接受该推荐
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at") // 推荐过期时间
});

// 插入模式
export const insertUserInterestSchema = createInsertSchema(userInterests).omit({
  id: true,
  createdAt: true,
});

export const insertTaskRecommendationSchema = createInsertSchema(taskRecommendations).omit({
  id: true,
  createdAt: true,
  isAccepted: true,
});

// 类型定义
export type InsertUserInterest = z.infer<typeof insertUserInterestSchema>;
export type InsertTaskRecommendation = z.infer<typeof insertTaskRecommendationSchema>;
export type UserInterest = typeof userInterests.$inferSelect;
export type TaskRecommendation = typeof taskRecommendations.$inferSelect;
