import {
  User,
  InsertUser,
  Task,
  InsertTask,
  KnowledgeContent,
  InsertKnowledgeContent,
  CommunityPost,
  InsertCommunityPost,
  Comment,
  InsertComment,
  Event,
  InsertEvent,
  FocusSession,
  InsertFocusSession,
  // 新增类型
  IdentityGroup,
  InsertIdentityGroup,
  GroupMember,
  InsertGroupMember,
  GroupActivity,
  InsertGroupActivity,
  UserKnowledgeContent,
  InsertUserKnowledgeContent,
  // 行为分析相关
  BehaviorPattern,
  InsertBehaviorPattern,
  BehaviorRecord,
  InsertBehaviorRecord,
  InterventionStrategy,
  InsertInterventionStrategy,
  // 个性化推荐引擎相关
  UserInterest,
  InsertUserInterest,
  TaskRecommendation,
  InsertTaskRecommendation,
  behaviorPatternTypes,
  interventionTypes
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  addUserPoints(userId: number, points: number): Promise<User | undefined>;
  getConsultants(): Promise<User[]>; // 获取所有咨询师
  getUsersByIdentityTag(tag: string): Promise<User[]>; // 根据身份标签获取用户
  
  // 个性化推荐引擎
  getUserInterests(userId: number): Promise<UserInterest[]>;
  addUserInterest(interest: InsertUserInterest): Promise<UserInterest>;
  updateUserInterestWeight(id: number, weight: number): Promise<UserInterest | undefined>;
  removeUserInterest(id: number): Promise<boolean>;
  getTaskRecommendations(userId: number, limit?: number): Promise<TaskRecommendation[]>;
  createTaskRecommendation(recommendation: InsertTaskRecommendation): Promise<TaskRecommendation>;
  acceptTaskRecommendation(id: number): Promise<TaskRecommendation | undefined>;
  rejectTaskRecommendation(id: number): Promise<boolean>;
  generateTaskRecommendations(userId: number): Promise<TaskRecommendation[]>;
  
  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Knowledge Content
  getKnowledgeContent(id: number): Promise<KnowledgeContent | undefined>;
  getAllKnowledgeContent(): Promise<KnowledgeContent[]>;
  getKnowledgeContentByType(type: string): Promise<KnowledgeContent[]>;
  getFeaturedKnowledgeContent(): Promise<KnowledgeContent[]>;
  createKnowledgeContent(content: InsertKnowledgeContent): Promise<KnowledgeContent>;
  
  // User Knowledge Content
  getUserKnowledgeContent(id: number): Promise<UserKnowledgeContent | undefined>;
  getUserKnowledgeContentByUserId(userId: number): Promise<UserKnowledgeContent[]>;
  getAllUserKnowledgeContent(approved?: boolean): Promise<UserKnowledgeContent[]>;
  createUserKnowledgeContent(content: InsertUserKnowledgeContent): Promise<UserKnowledgeContent>;
  approveUserKnowledgeContent(id: number, pointsAwarded: number): Promise<UserKnowledgeContent | undefined>;
  likeUserKnowledgeContent(id: number): Promise<UserKnowledgeContent | undefined>;
  
  // Community Posts
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  getAllCommunityPosts(): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likePost(id: number): Promise<CommunityPost | undefined>;
  
  // Comments
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Events
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Focus Sessions
  getFocusSession(id: number): Promise<FocusSession | undefined>;
  getFocusSessionsByUserId(userId: number): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: number, session: Partial<FocusSession>): Promise<FocusSession | undefined>;
  
  // Identity Groups (小圈子)
  getIdentityGroup(id: number): Promise<IdentityGroup | undefined>;
  getIdentityGroupsByIdentityTag(tag: string): Promise<IdentityGroup[]>;
  getAllIdentityGroups(): Promise<IdentityGroup[]>;
  createIdentityGroup(group: InsertIdentityGroup): Promise<IdentityGroup>;
  updateIdentityGroup(id: number, updates: Partial<IdentityGroup>): Promise<IdentityGroup | undefined>;
  addGroupPoints(groupId: number, points: number): Promise<IdentityGroup | undefined>;
  assignConsultantToGroup(groupId: number, consultantId: number): Promise<IdentityGroup | undefined>;
  
  // Group Members
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  updateGroupMemberRole(groupId: number, userId: number, role: string): Promise<GroupMember | undefined>;
  removeGroupMember(groupId: number, userId: number): Promise<boolean>;
  
  // Group Activities
  getGroupActivity(id: number): Promise<GroupActivity | undefined>;
  getGroupActivitiesByGroupId(groupId: number): Promise<GroupActivity[]>;
  createGroupActivity(activity: InsertGroupActivity): Promise<GroupActivity>;
  joinGroupActivity(activityId: number): Promise<GroupActivity | undefined>;
  
  // 行为分析相关方法
  // 行为模式
  getBehaviorPattern(id: number): Promise<BehaviorPattern | undefined>;
  getBehaviorPatternsByUserId(userId: number): Promise<BehaviorPattern[]>;
  getBehaviorPatternsByType(userId: number, patternType: string): Promise<BehaviorPattern[]>;
  getActiveBehaviorPatterns(userId: number): Promise<BehaviorPattern[]>;
  createBehaviorPattern(pattern: InsertBehaviorPattern): Promise<BehaviorPattern>;
  updateBehaviorPattern(id: number, updates: Partial<BehaviorPattern>): Promise<BehaviorPattern | undefined>;
  
  // 行为记录
  getBehaviorRecord(id: number): Promise<BehaviorRecord | undefined>;
  getBehaviorRecordsByPatternId(patternId: number): Promise<BehaviorRecord[]>;
  getBehaviorRecordsByUserId(userId: number): Promise<BehaviorRecord[]>;
  createBehaviorRecord(record: InsertBehaviorRecord): Promise<BehaviorRecord>;
  
  // 干预策略
  getInterventionStrategy(id: number): Promise<InterventionStrategy | undefined>;
  getInterventionStrategiesByPatternId(patternId: number): Promise<InterventionStrategy[]>;
  getInterventionStrategiesByUserId(userId: number): Promise<InterventionStrategy[]>;
  getActiveInterventionStrategies(userId: number): Promise<InterventionStrategy[]>;
  createInterventionStrategy(strategy: InsertInterventionStrategy): Promise<InterventionStrategy>;
  updateInterventionStrategy(id: number, updates: Partial<InterventionStrategy>): Promise<InterventionStrategy | undefined>;
  rateInterventionEffectiveness(id: number, effectiveness: number): Promise<InterventionStrategy | undefined>;
  
  // 行为分析
  analyzeUserBehavior(userId: number): Promise<{ 
    patterns: BehaviorPattern[],
    recommendations: InterventionStrategy[] 
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private knowledgeContents: Map<number, KnowledgeContent>;
  private communityPosts: Map<number, CommunityPost>;
  private comments: Map<number, Comment>;
  private events: Map<number, Event>;
  private focusSessions: Map<number, FocusSession>;
  
  // 新增实体的Map
  private identityGroups: Map<number, IdentityGroup>;
  private groupMembers: Map<string, GroupMember>; // 使用 'groupId-userId' 作为键
  private groupActivities: Map<number, GroupActivity>;
  private userKnowledgeContents: Map<number, UserKnowledgeContent>;
  
  // 行为分析相关
  private behaviorPatterns: Map<number, BehaviorPattern>;
  private behaviorRecords: Map<number, BehaviorRecord>;
  private interventionStrategies: Map<number, InterventionStrategy>;
  
  // 个性化推荐引擎相关
  private userInterests: Map<number, UserInterest>;
  private taskRecommendations: Map<number, TaskRecommendation>;
  
  private userId: number;
  private taskId: number;
  private contentId: number;
  private postId: number;
  private commentId: number;
  private eventId: number;
  private sessionId: number;
  
  // 新增ID计数器
  private groupId: number;
  private groupActivityId: number;
  private userContentId: number;
  
  // 行为分析相关ID计数器
  private patternId: number;
  private recordId: number;
  private strategyId: number;
  
  // 个性化推荐引擎相关ID计数器
  private interestId: number;
  private recommendationId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.knowledgeContents = new Map();
    this.communityPosts = new Map();
    this.comments = new Map();
    this.events = new Map();
    this.focusSessions = new Map();
    
    // 初始化新实体的Map
    this.identityGroups = new Map();
    this.groupMembers = new Map();
    this.groupActivities = new Map();
    this.userKnowledgeContents = new Map();
    
    // 初始化行为分析相关Map
    this.behaviorPatterns = new Map();
    this.behaviorRecords = new Map();
    this.interventionStrategies = new Map();
    
    // 初始化个性化推荐引擎相关Map
    this.userInterests = new Map();
    this.taskRecommendations = new Map();
    
    this.userId = 1;
    this.taskId = 1;
    this.contentId = 1;
    this.postId = 1;
    this.commentId = 1;
    this.eventId = 1;
    this.sessionId = 1;
    
    // 初始化新ID计数器
    this.groupId = 1;
    this.groupActivityId = 1;
    this.userContentId = 1;
    
    // 初始化行为分析相关ID计数器
    this.patternId = 1;
    this.recordId = 1;
    this.strategyId = 1;
    
    // 初始化个性化推荐引擎相关ID计数器
    this.interestId = 1;
    this.recommendationId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Create a demo user for easy testing
    const demoUser: User = {
      id: this.userId++,
      username: 'demo',
      password: 'password', // In a real app, this would be hashed
      displayName: '演示用户',
      email: 'demo@example.com',
      profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
      joinedDate: new Date('2023-05-01'),
      adhd_profile: {
        attentionRegulation: 70, // percentage
        executiveFunction: 60,
        hyperactivity: 75
      },
      // 新增字段
      identityTags: ['学生', 'ADHD爱好者'],
      isConsultant: false,
      consultantTitle: null,
      consultantBio: null,
      consultantVerified: false,
      points: 120
    };
    
    // 添加示例行为模式和干预策略
    // 初始化行为模式和记录数据
    const procrastinationPattern: BehaviorPattern = {
      id: this.patternId++,
      userId: 1, // demoUser
      patternType: behaviorPatternTypes.PROCRASTINATION,
      confidence: 85,
      detectedAt: new Date('2023-06-15'),
      lastUpdatedAt: new Date('2023-06-20'),
      frequency: 12,
      severity: 4,
      isActive: true,
      metadata: { observed: 'task_postponement', postponedTasks: 7 }
    };
    
    const distractionPattern: BehaviorPattern = {
      id: this.patternId++,
      userId: 1, // demoUser
      patternType: behaviorPatternTypes.DISTRACTION,
      confidence: 75,
      detectedAt: new Date('2023-07-01'),
      lastUpdatedAt: new Date('2023-07-05'),
      frequency: 8,
      severity: 3,
      isActive: true,
      metadata: { commonDistractors: ['社交媒体', '手机通知'] }
    };
    
    // 初始化行为记录数据
    const procrastinationRecord: BehaviorRecord = {
      id: this.recordId++,
      userId: 1, // demoUser
      patternId: procrastinationPattern.id,
      recordedAt: new Date('2023-06-20'),
      context: 'task_management',
      details: { taskId: 1, postponedTimes: 3, postponedMinutes: 120 },
      taskId: 1,
      focusSessionId: null
    };
    
    const distractionRecord: BehaviorRecord = {
      id: this.recordId++,
      userId: 1, // demoUser
      patternId: distractionPattern.id,
      recordedAt: new Date('2023-07-05'),
      context: 'focus_session',
      details: { distractionSource: '手机通知', duration: 15 },
      taskId: null,
      focusSessionId: 1
    };
    
    // 初始化干预策略数据
    const procrastinationStrategy: InterventionStrategy = {
      id: this.strategyId++,
      userId: 1, // demoUser
      patternId: procrastinationPattern.id,
      interventionType: interventionTypes.TECHNIQUE_SUGGESTION,
      title: '番茄工作法',
      content: '尝试番茄工作法：专注工作25分钟，然后休息5分钟。这种方法可以帮助克服拖延，增强专注力。',
      trigger: 'before_task',
      frequency: 'daily',
      isEnabled: true,
      effectiveness: 4,
      createdAt: new Date('2023-06-16'),
      lastTriggeredAt: new Date('2023-06-20')
    };
    
    const distractionStrategy: InterventionStrategy = {
      id: this.strategyId++,
      userId: 1, // demoUser
      patternId: distractionPattern.id,
      interventionType: interventionTypes.ENVIRONMENT_CHANGE,
      title: '减少干扰环境设置',
      content: '在工作前，将手机设为勿扰模式，关闭社交媒体通知，创建一个专注的工作环境。',
      trigger: 'before_focus',
      frequency: 'every_occurrence',
      isEnabled: true,
      effectiveness: 3,
      createdAt: new Date('2023-07-02'),
      lastTriggeredAt: new Date('2023-07-05')
    };
    
    // 存储示例数据
    this.behaviorPatterns.set(procrastinationPattern.id, procrastinationPattern);
    this.behaviorPatterns.set(distractionPattern.id, distractionPattern);
    this.behaviorRecords.set(procrastinationRecord.id, procrastinationRecord);
    this.behaviorRecords.set(distractionRecord.id, distractionRecord);
    this.interventionStrategies.set(procrastinationStrategy.id, procrastinationStrategy);
    this.interventionStrategies.set(distractionStrategy.id, distractionStrategy);
    this.users.set(demoUser.id, demoUser);
    
    // 添加示例用户兴趣数据
    const demoUserInterests: UserInterest[] = [
      {
        id: this.interestId++,
        userId: demoUser.id,
        interest: '阅读',
        weight: 8,
        createdAt: new Date('2023-05-15')
      },
      {
        id: this.interestId++,
        userId: demoUser.id,
        interest: '绘画',
        weight: 7,
        createdAt: new Date('2023-05-20')
      },
      {
        id: this.interestId++,
        userId: demoUser.id,
        interest: '音乐',
        weight: 9,
        createdAt: new Date('2023-05-18')
      }
    ];
    
    demoUserInterests.forEach(interest => this.userInterests.set(interest.id, interest));
    
    // 添加示例任务推荐数据
    const demoTaskRecommendations: TaskRecommendation[] = [
      {
        id: this.recommendationId++,
        userId: demoUser.id,
        title: '每日阅读30分钟',
        description: '根据您对阅读的兴趣，我们推荐您每天安排30分钟的阅读时间',
        category: '自我发展',
        priority: 'Medium',
        estimatedDuration: 30,
        reason: '基于您的阅读兴趣推荐，适合ADHD的短时间专注活动',
        sourceType: 'interest',
        sourceId: demoUserInterests[0].id,
        score: 85,
        isAccepted: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 一周后过期
      },
      {
        id: this.recommendationId++,
        userId: demoUser.id,
        title: '音乐辅助专注工作',
        description: '尝试使用背景音乐来提高工作专注度，选择不含歌词的轻音乐',
        category: '工作效率',
        priority: 'High',
        estimatedDuration: 120,
        reason: '根据您的音乐兴趣和注意力调节需求定制的推荐',
        sourceType: 'pattern',
        sourceId: distractionPattern.id,
        score: 92,
        isAccepted: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 三天后过期
      },
      {
        id: this.recommendationId++,
        userId: demoUser.id,
        title: '创建绘画时间表',
        description: '为您的绘画爱好制定一个每周固定时间表，减少决策疲劳',
        category: '组织计划',
        priority: 'Medium',
        estimatedDuration: 45,
        reason: '基于您的绘画兴趣，同时有助于改善时间管理能力',
        sourceType: 'interest',
        sourceId: demoUserInterests[1].id,
        score: 78,
        isAccepted: true, // 已接受的推荐
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 两天前创建
        expiresAt: null
      }
    ];
    
    demoTaskRecommendations.forEach(recommendation => this.taskRecommendations.set(recommendation.id, recommendation));
    
    // Create a sample user
    const sampleUser: User = {
      id: this.userId++,
      username: 'alex_user',
      password: 'password123', // In a real app, this would be hashed
      displayName: 'Alex Johnson',
      email: 'alex@example.com',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      joinedDate: new Date('2023-03-15'),
      adhd_profile: {
        attentionRegulation: 60, // percentage
        executiveFunction: 80,
        hyperactivity: 40
      },
      // 新增字段
      identityTags: ['画家', '作家'],
      isConsultant: false,
      consultantTitle: null,
      consultantBio: null,
      consultantVerified: false,
      points: 85
    };
    
    // 创建示例咨询师
    const consultantUser: User = {
      id: this.userId++,
      username: 'dr_zhang',
      password: 'consultant123',
      displayName: '张医生',
      email: 'dr.zhang@example.com',
      profileImage: 'https://randomuser.me/api/portraits/women/28.jpg',
      joinedDate: new Date('2023-01-10'),
      adhd_profile: null,
      identityTags: ['心理咨询师', 'ADHD专家'],
      isConsultant: true,
      consultantTitle: 'ADHD专业心理咨询师',
      consultantBio: '拥有10年ADHD治疗经验，专注于成人ADHD的诊断和治疗方案制定',
      consultantVerified: true,
      points: 450
    };
    
    this.users.set(sampleUser.id, sampleUser);
    this.users.set(consultantUser.id, consultantUser);
    
    // 创建示例身份小圈子
    const artGroup: IdentityGroup = {
      id: this.groupId++,
      name: 'ADHD艺术家联盟',
      description: '为ADHD艺术家提供交流和支持的平台，分享创作经验和应对策略',
      identityTag: '艺术家',
      createdBy: sampleUser.id,
      createdAt: new Date('2023-02-15'),
      memberCount: 1,
      consultantId: consultantUser.id,
      points: 250,
      rules: '尊重每位成员，积极参与活动，定期分享作品',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      isVerified: true,
      hasConsultant: true
    };
    
    const studentGroup: IdentityGroup = {
      id: this.groupId++,
      name: 'ADHD学生互助小组',
      description: '为在校ADHD学生提供学习方法和考试技巧交流，共同应对学业挑战',
      identityTag: '学生',
      createdBy: demoUser.id,
      createdAt: new Date('2023-03-20'),
      memberCount: 1,
      consultantId: null,
      points: 180,
      rules: '鼓励分享学习经验，禁止剽窃和作弊行为，尊重他人隐私',
      avatarUrl: null,
      isVerified: false,
      hasConsultant: false
    };
    
    this.identityGroups.set(artGroup.id, artGroup);
    this.identityGroups.set(studentGroup.id, studentGroup);
    
    // 添加小圈子成员
    const artGroupMember: GroupMember = {
      groupId: artGroup.id,
      userId: sampleUser.id,
      joinedAt: new Date('2023-02-15'),
      role: 'admin'
    };
    
    const studentGroupMember: GroupMember = {
      groupId: studentGroup.id,
      userId: demoUser.id,
      joinedAt: new Date('2023-03-20'),
      role: 'admin'
    };
    
    this.groupMembers.set(`${artGroup.id}-${sampleUser.id}`, artGroupMember);
    this.groupMembers.set(`${studentGroup.id}-${demoUser.id}`, studentGroupMember);
    
    // 添加小圈子活动
    const artGroupActivity: GroupActivity = {
      id: this.groupActivityId++,
      groupId: artGroup.id,
      title: '情绪与创作工作坊',
      description: '探索ADHD情绪波动如何影响和促进艺术创作，由张医生主持',
      activityDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一周后
      location: '线上Zoom会议',
      isVirtual: true,
      createdAt: new Date(),
      createdBy: consultantUser.id,
      participantLimit: 15,
      currentParticipants: 5
    };
    
    const studentGroupActivity: GroupActivity = {
      id: this.groupActivityId++,
      groupId: studentGroup.id,
      title: '期末复习策略分享会',
      description: '交流适合ADHD学生的高效复习方法和应对考试焦虑的技巧',
      activityDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 三天后
      location: '校图书馆研讨室',
      isVirtual: false,
      createdAt: new Date(),
      createdBy: demoUser.id,
      participantLimit: 10,
      currentParticipants: 3
    };
    
    this.groupActivities.set(artGroupActivity.id, artGroupActivity);
    this.groupActivities.set(studentGroupActivity.id, studentGroupActivity);
    
    // 添加用户上传的知识内容
    const userContent: UserKnowledgeContent = {
      id: this.userContentId++,
      userId: sampleUser.id,
      title: '我的ADHD创作历程',
      type: 'article',
      summary: '分享作为一名ADHD艺术家的创作体验和应对方法',
      content: '作为一个ADHD患者，创作过程总是伴随着挑战和机遇...(完整内容)',
      imageUrl: 'https://images.unsplash.com/photo-1536782376847-5c9d14d97cc0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      videoUrl: null,
      sourceUrl: null,
      uploadedAt: new Date('2023-04-10'),
      viewCount: 86,
      likes: 12,
      isApproved: true,
      tags: ['艺术', '创作', '经验分享'],
      pointsEarned: 25
    };
    
    this.userKnowledgeContents.set(userContent.id, userContent);
    this.users.set(sampleUser.id, sampleUser);
    
    // Create sample tasks
    const sampleTasks = [
      {
        id: this.taskId++,
        userId: sampleUser.id,
        title: 'Complete daily medication',
        description: 'Take prescribed ADHD medication',
        completed: false,
        dueDate: new Date(),
        scheduledTime: '9:00 AM',
        priority: 'High',
        category: 'Health',
        createdAt: new Date()
      },
      {
        id: this.taskId++,
        userId: sampleUser.id,
        title: 'Review project notes',
        description: 'Go through the project documentation',
        completed: false,
        dueDate: new Date(),
        scheduledTime: '11:30 AM',
        priority: 'Medium',
        category: 'Work',
        createdAt: new Date()
      },
      {
        id: this.taskId++,
        userId: sampleUser.id,
        title: 'Morning exercise',
        description: '30 minutes of cardio',
        completed: true,
        dueDate: new Date(),
        scheduledTime: '7:30 AM',
        priority: 'Low',
        category: 'Health',
        createdAt: new Date()
      }
    ];
    
    sampleTasks.forEach(task => this.tasks.set(task.id, task));
    
    // Create sample knowledge content
    const sampleContent = [
      {
        id: this.contentId++,
        title: 'Understanding ADHD Neurobiology',
        type: 'Article',
        summary: 'Recent research on how ADHD affects brain structure and neurotransmitter function, with implications for treatment approaches.',
        content: 'Full article content here...',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        videoUrl: null,
        publishedDate: new Date('2023-02-15'),
        author: 'Dr. Sarah Johnson',
        authorTitle: 'Neuropsychologist',
        viewCount: 1200,
        duration: null,
        tags: ['neuroscience', 'research', 'brain function'],
        isFeatured: false
      },
      {
        id: this.contentId++,
        title: '5 Effective Time Management Techniques',
        type: 'Video',
        summary: 'Learn practical time management strategies specifically designed for people with ADHD to improve productivity.',
        content: 'Video transcript here...',
        imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        videoUrl: 'https://example.com/videos/time-management',
        publishedDate: new Date('2023-03-03'),
        author: 'Dr. Michael Chen',
        authorTitle: 'ADHD Specialist',
        viewCount: 5600,
        duration: '12:45',
        tags: ['time management', 'productivity', 'strategies'],
        isFeatured: false
      },
      {
        id: this.contentId++,
        title: 'ADHD Explained: Science and Symptoms',
        type: 'Article',
        summary: 'A comprehensive overview of ADHD, including neurobiology, symptoms, and diagnostic criteria based on the latest scientific research.',
        content: 'Full article content here...',
        imageUrl: 'https://images.unsplash.com/photo-1573511860302-28c524319d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        videoUrl: null,
        publishedDate: new Date('2023-01-20'),
        author: 'Dr. Sarah Johnson',
        authorTitle: 'Neuropsychologist',
        viewCount: 8400,
        duration: null,
        tags: ['symptoms', 'diagnosis', 'overview'],
        isFeatured: true
      }
    ];
    
    sampleContent.forEach(content => this.knowledgeContents.set(content.id, content));
    
    // Create sample community posts
    const samplePosts = [
      {
        id: this.postId++,
        userId: sampleUser.id,
        content: "Just discovered a great technique for managing my task list when feeling overwhelmed. I break everything down into 10-minute increments and focus on just one small task at a time. It's been a game changer for my productivity! Anyone else try something similar?",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        likes: 32,
        commentCount: 15,
        imageUrl: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        videoUrl: null
      },
      {
        id: this.postId++,
        userId: sampleUser.id,
        content: "Is anyone attending the virtual support group meeting next Tuesday? I've been struggling with work organization lately and could use some advice from others who understand.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        likes: 18,
        commentCount: 8,
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        videoUrl: null
      }
    ];
    
    samplePosts.forEach(post => this.communityPosts.set(post.id, post));
    
    // Create sample events
    const sampleEvents = [
      {
        id: this.eventId++,
        title: 'Virtual Support Group Meeting',
        description: 'Share experiences and strategies with fellow ADHD community members in our monthly virtual meetup.',
        eventDate: new Date('2023-04-18'),
        startTime: '7:00 PM',
        endTime: '8:30 PM',
        isVirtual: true,
        location: 'Zoom',
        createdAt: new Date(),
        createdBy: sampleUser.id
      },
      {
        id: this.eventId++,
        title: 'ADHD & Work: Organization Strategies',
        description: 'Learn effective strategies for staying organized at work with ADHD.',
        eventDate: new Date('2023-04-21'),
        startTime: '7:00 PM',
        endTime: '8:30 PM',
        isVirtual: true,
        location: 'Zoom',
        createdAt: new Date(),
        createdBy: sampleUser.id
      }
    ];
    
    sampleEvents.forEach(event => this.events.set(event.id, event));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // 设置默认值
    const newUser: User = { 
      ...insertUser, 
      id, 
      joinedDate: new Date(),
      identityTags: insertUser.identityTags || [],
      isConsultant: insertUser.isConsultant || false,
      consultantTitle: insertUser.consultantTitle || null,
      consultantBio: insertUser.consultantBio || null,
      consultantVerified: false,
      points: 0
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async addUserPoints(userId: number, points: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      points: (user.points || 0) + points 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getConsultants(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.isConsultant === true
    );
  }
  
  async getUsersByIdentityTag(tag: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.identityTags && user.identityTags.includes(tag)
    );
  }
  
  // 个性化推荐引擎方法
  async getUserInterests(userId: number): Promise<UserInterest[]> {
    return Array.from(this.userInterests.values()).filter(
      (interest) => interest.userId === userId
    );
  }
  
  async addUserInterest(interest: InsertUserInterest): Promise<UserInterest> {
    const id = this.interestId++;
    const newInterest: UserInterest = {
      ...interest,
      id,
      createdAt: new Date()
    };
    this.userInterests.set(id, newInterest);
    return newInterest;
  }
  
  async updateUserInterestWeight(id: number, weight: number): Promise<UserInterest | undefined> {
    const interest = this.userInterests.get(id);
    if (!interest) return undefined;
    
    const updatedInterest = { ...interest, weight };
    this.userInterests.set(id, updatedInterest);
    return updatedInterest;
  }
  
  async removeUserInterest(id: number): Promise<boolean> {
    return this.userInterests.delete(id);
  }
  
  async getTaskRecommendations(userId: number, limit?: number): Promise<TaskRecommendation[]> {
    const recommendations = Array.from(this.taskRecommendations.values())
      .filter((rec) => rec.userId === userId)
      .sort((a, b) => b.score - a.score);
    
    return limit ? recommendations.slice(0, limit) : recommendations;
  }
  
  async createTaskRecommendation(recommendation: InsertTaskRecommendation): Promise<TaskRecommendation> {
    const id = this.recommendationId++;
    const newRecommendation: TaskRecommendation = {
      ...recommendation,
      id,
      isAccepted: false,
      createdAt: new Date()
    };
    this.taskRecommendations.set(id, newRecommendation);
    return newRecommendation;
  }
  
  async acceptTaskRecommendation(id: number): Promise<TaskRecommendation | undefined> {
    const recommendation = this.taskRecommendations.get(id);
    if (!recommendation) return undefined;
    
    const acceptedRecommendation = { ...recommendation, isAccepted: true };
    this.taskRecommendations.set(id, acceptedRecommendation);
    
    // 根据推荐创建一个新任务
    const newTask: InsertTask = {
      userId: recommendation.userId,
      title: recommendation.title,
      description: recommendation.description || null,
      category: recommendation.category || null,
      priority: recommendation.priority,
      estimatedDuration: recommendation.estimatedDuration || null,
      completed: false,
      dueDate: null,
      scheduledTime: null,
      steps: [],
      adhd_data: null,
      totalPoints: null
    };
    
    await this.createTask(newTask);
    
    return acceptedRecommendation;
  }
  
  async rejectTaskRecommendation(id: number): Promise<boolean> {
    const recommendation = this.taskRecommendations.get(id);
    if (!recommendation) return false;
    
    this.taskRecommendations.delete(id);
    return true;
  }
  
  async generateTaskRecommendations(userId: number): Promise<TaskRecommendation[]> {
    // 获取用户兴趣
    const userInterests = await this.getUserInterests(userId);
    if (userInterests.length === 0) return [];
    
    // 获取用户行为模式
    const behaviorPatterns = await this.getBehaviorPatternsByUserId(userId);
    
    const newRecommendations: TaskRecommendation[] = [];
    
    // 根据兴趣生成推荐
    for (const interest of userInterests) {
      if (interest.weight >= 7) { // 只针对权重较高的兴趣生成推荐
        const recommendation: InsertTaskRecommendation = {
          userId,
          title: `探索${interest.interest}相关活动`,
          description: `根据您对${interest.interest}的兴趣，我们推荐您尝试一些相关活动`,
          category: '兴趣发展',
          priority: 'Medium',
          estimatedDuration: 60,
          reason: `这是基于您的${interest.interest}兴趣生成的推荐，有助于发展您的爱好`,
          sourceType: 'interest',
          sourceId: interest.id,
          score: interest.weight * 10,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 两周后过期
        };
        
        const newRecommendation = await this.createTaskRecommendation(recommendation);
        newRecommendations.push(newRecommendation);
      }
    }
    
    // 根据行为模式生成推荐
    for (const pattern of behaviorPatterns) {
      if (pattern.isActive && pattern.patternType === behaviorPatternTypes.PROCRASTINATION) {
        const recommendation: InsertTaskRecommendation = {
          userId,
          title: '分解任务训练',
          description: '将一个大任务分解成多个10-15分钟的小步骤，并在完成每个步骤后给自己小奖励',
          category: '执行力提升',
          priority: 'High',
          estimatedDuration: 30,
          reason: '您存在任务拖延的行为模式，这个训练可以帮助您克服拖延习惯',
          sourceType: 'pattern',
          sourceId: pattern.id,
          score: 90,
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 三天后过期
        };
        
        const newRecommendation = await this.createTaskRecommendation(recommendation);
        newRecommendations.push(newRecommendation);
      } else if (pattern.isActive && pattern.patternType === behaviorPatternTypes.DISTRACTION) {
        const recommendation: InsertTaskRecommendation = {
          userId,
          title: '专注环境优化',
          description: '整理工作环境，清除视觉干扰，准备专注工作所需的一切工具',
          category: '专注力训练',
          priority: 'High',
          estimatedDuration: 20,
          reason: '您容易受到环境干扰，这个活动可以帮助您创建一个更有利于专注的环境',
          sourceType: 'pattern',
          sourceId: pattern.id,
          score: 88,
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 五天后过期
        };
        
        const newRecommendation = await this.createTaskRecommendation(recommendation);
        newRecommendations.push(newRecommendation);
      }
    }
    
    return newRecommendations;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const newTask: Task = { ...insertTask, id, createdAt: new Date() };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskUpdates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Knowledge Content methods
  async getKnowledgeContent(id: number): Promise<KnowledgeContent | undefined> {
    return this.knowledgeContents.get(id);
  }

  async getAllKnowledgeContent(): Promise<KnowledgeContent[]> {
    return Array.from(this.knowledgeContents.values());
  }

  async getKnowledgeContentByType(type: string): Promise<KnowledgeContent[]> {
    return Array.from(this.knowledgeContents.values()).filter(
      (content) => content.type.toLowerCase() === type.toLowerCase()
    );
  }

  async getFeaturedKnowledgeContent(): Promise<KnowledgeContent[]> {
    return Array.from(this.knowledgeContents.values()).filter(
      (content) => content.isFeatured
    );
  }

  async createKnowledgeContent(insertContent: InsertKnowledgeContent): Promise<KnowledgeContent> {
    const id = this.contentId++;
    const newContent: KnowledgeContent = { 
      ...insertContent, 
      id, 
      publishedDate: new Date(), 
      viewCount: 0 
    };
    this.knowledgeContents.set(id, newContent);
    return newContent;
  }
  
  // 用户知识内容方法
  async getUserKnowledgeContent(id: number): Promise<UserKnowledgeContent | undefined> {
    return this.userKnowledgeContents.get(id);
  }
  
  async getUserKnowledgeContentByUserId(userId: number): Promise<UserKnowledgeContent[]> {
    return Array.from(this.userKnowledgeContents.values()).filter(
      (content) => content.userId === userId
    );
  }
  
  async getAllUserKnowledgeContent(approved?: boolean): Promise<UserKnowledgeContent[]> {
    if (approved !== undefined) {
      return Array.from(this.userKnowledgeContents.values()).filter(
        (content) => content.isApproved === approved
      );
    }
    return Array.from(this.userKnowledgeContents.values());
  }
  
  async createUserKnowledgeContent(insertContent: InsertUserKnowledgeContent): Promise<UserKnowledgeContent> {
    const id = this.userContentId++;
    const newContent: UserKnowledgeContent = { 
      ...insertContent, 
      id, 
      uploadedAt: new Date(), 
      viewCount: 0,
      likes: 0,
      isApproved: false,
      pointsEarned: 0
    };
    this.userKnowledgeContents.set(id, newContent);
    return newContent;
  }
  
  async approveUserKnowledgeContent(id: number, pointsAwarded: number): Promise<UserKnowledgeContent | undefined> {
    const content = this.userKnowledgeContents.get(id);
    if (!content) return undefined;
    
    const updatedContent = { 
      ...content, 
      isApproved: true,
      pointsEarned: pointsAwarded
    };
    this.userKnowledgeContents.set(id, updatedContent);
    
    // 给用户添加积分
    await this.addUserPoints(content.userId, pointsAwarded);
    
    return updatedContent;
  }
  
  async likeUserKnowledgeContent(id: number): Promise<UserKnowledgeContent | undefined> {
    const content = this.userKnowledgeContents.get(id);
    if (!content) return undefined;
    
    const updatedContent = { ...content, likes: content.likes + 1 };
    this.userKnowledgeContents.set(id, updatedContent);
    return updatedContent;
  }

  // Community Post methods
  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.postId++;
    const newPost: CommunityPost = { 
      ...insertPost, 
      id, 
      createdAt: new Date(), 
      likes: 0, 
      commentCount: 0 
    };
    this.communityPosts.set(id, newPost);
    return newPost;
  }

  async likePost(id: number): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, likes: post.likes + 1 };
    this.communityPosts.set(id, updatedPost);
    return updatedPost;
  }

  // Comment methods
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.postId === postId
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const newComment: Comment = { ...insertComment, id, createdAt: new Date() };
    this.comments.set(id, newComment);
    
    // Update comment count on the post
    const post = this.communityPosts.get(insertComment.postId);
    if (post) {
      this.communityPosts.set(post.id, { 
        ...post, 
        commentCount: post.commentCount + 1 
      });
    }
    
    return newComment;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const newEvent: Event = { ...insertEvent, id, createdAt: new Date() };
    this.events.set(id, newEvent);
    return newEvent;
  }

  // Focus Session methods
  async getFocusSession(id: number): Promise<FocusSession | undefined> {
    return this.focusSessions.get(id);
  }

  async getFocusSessionsByUserId(userId: number): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async createFocusSession(insertSession: InsertFocusSession): Promise<FocusSession> {
    const id = this.sessionId++;
    const newSession: FocusSession = { ...insertSession, id };
    this.focusSessions.set(id, newSession);
    return newSession;
  }

  async updateFocusSession(id: number, sessionUpdates: Partial<FocusSession>): Promise<FocusSession | undefined> {
    const session = this.focusSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionUpdates };
    this.focusSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // 身份小圈子 (Identity Groups) 方法
  async getIdentityGroup(id: number): Promise<IdentityGroup | undefined> {
    return this.identityGroups.get(id);
  }
  
  async getIdentityGroupsByIdentityTag(tag: string): Promise<IdentityGroup[]> {
    return Array.from(this.identityGroups.values()).filter(
      (group) => group.identityTag === tag
    );
  }
  
  async getAllIdentityGroups(): Promise<IdentityGroup[]> {
    return Array.from(this.identityGroups.values());
  }
  
  async createIdentityGroup(group: InsertIdentityGroup): Promise<IdentityGroup> {
    const id = this.groupId++;
    const newGroup: IdentityGroup = { 
      ...group, 
      id, 
      createdAt: new Date(), 
      memberCount: 0,
      points: 0
    };
    this.identityGroups.set(id, newGroup);
    return newGroup;
  }
  
  async updateIdentityGroup(id: number, updates: Partial<IdentityGroup>): Promise<IdentityGroup | undefined> {
    const group = this.identityGroups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.identityGroups.set(id, updatedGroup);
    return updatedGroup;
  }
  
  async addGroupPoints(groupId: number, points: number): Promise<IdentityGroup | undefined> {
    const group = this.identityGroups.get(groupId);
    if (!group) return undefined;
    
    const updatedGroup = { 
      ...group, 
      points: (group.points || 0) + points 
    };
    this.identityGroups.set(groupId, updatedGroup);
    return updatedGroup;
  }
  
  async assignConsultantToGroup(groupId: number, consultantId: number): Promise<IdentityGroup | undefined> {
    const group = this.identityGroups.get(groupId);
    const consultant = this.users.get(consultantId);
    
    if (!group || !consultant || !consultant.isConsultant) return undefined;
    
    const updatedGroup = { 
      ...group, 
      consultantId
    };
    this.identityGroups.set(groupId, updatedGroup);
    return updatedGroup;
  }
  
  // 小圈子成员 (Group Members) 方法
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values()).filter(
      (member) => member.groupId === groupId
    );
  }
  
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const key = `${member.groupId}-${member.userId}`;
    const newMember: GroupMember = { 
      ...member, 
      joinedAt: new Date()
    };
    this.groupMembers.set(key, newMember);
    
    // 更新小圈子成员数量
    const group = this.identityGroups.get(member.groupId);
    if (group) {
      this.identityGroups.set(group.id, {
        ...group,
        memberCount: group.memberCount + 1
      });
    }
    
    return newMember;
  }
  
  async updateGroupMemberRole(groupId: number, userId: number, role: string): Promise<GroupMember | undefined> {
    const key = `${groupId}-${userId}`;
    const member = this.groupMembers.get(key);
    if (!member) return undefined;
    
    const updatedMember = { ...member, role };
    this.groupMembers.set(key, updatedMember);
    return updatedMember;
  }
  
  async removeGroupMember(groupId: number, userId: number): Promise<boolean> {
    const key = `${groupId}-${userId}`;
    const success = this.groupMembers.delete(key);
    
    if (success) {
      // 更新小圈子成员数量
      const group = this.identityGroups.get(groupId);
      if (group) {
        this.identityGroups.set(group.id, {
          ...group,
          memberCount: Math.max(0, group.memberCount - 1)
        });
      }
    }
    
    return success;
  }
  
  // 小圈子活动 (Group Activities) 方法
  async getGroupActivity(id: number): Promise<GroupActivity | undefined> {
    return this.groupActivities.get(id);
  }
  
  async getGroupActivitiesByGroupId(groupId: number): Promise<GroupActivity[]> {
    return Array.from(this.groupActivities.values()).filter(
      (activity) => activity.groupId === groupId
    );
  }
  
  async createGroupActivity(activity: InsertGroupActivity): Promise<GroupActivity> {
    const id = this.groupActivityId++;
    const newActivity: GroupActivity = { 
      ...activity, 
      id, 
      createdAt: new Date(), 
      currentParticipants: 0
    };
    this.groupActivities.set(id, newActivity);
    return newActivity;
  }
  
  async joinGroupActivity(activityId: number): Promise<GroupActivity | undefined> {
    const activity = this.groupActivities.get(activityId);
    if (!activity) return undefined;
    
    // 如果限制参与人数且已达到限制，返回undefined
    if (activity.participantLimit > 0 && activity.currentParticipants >= activity.participantLimit) {
      return undefined;
    }
    
    const updatedActivity = { 
      ...activity, 
      currentParticipants: activity.currentParticipants + 1 
    };
    this.groupActivities.set(activityId, updatedActivity);
    return updatedActivity;
  }

  // 行为模式相关方法
  async getBehaviorPattern(id: number): Promise<BehaviorPattern | undefined> {
    return this.behaviorPatterns.get(id);
  }

  async getBehaviorPatternsByUserId(userId: number): Promise<BehaviorPattern[]> {
    return Array.from(this.behaviorPatterns.values()).filter(
      (pattern) => pattern.userId === userId
    );
  }

  async getBehaviorPatternsByType(userId: number, patternType: string): Promise<BehaviorPattern[]> {
    return Array.from(this.behaviorPatterns.values()).filter(
      (pattern) => pattern.userId === userId && pattern.patternType === patternType
    );
  }

  async getActiveBehaviorPatterns(userId: number): Promise<BehaviorPattern[]> {
    return Array.from(this.behaviorPatterns.values()).filter(
      (pattern) => pattern.userId === userId && pattern.isActive
    );
  }

  async createBehaviorPattern(pattern: InsertBehaviorPattern): Promise<BehaviorPattern> {
    const id = this.patternId++;
    const now = new Date();
    const newPattern: BehaviorPattern = {
      ...pattern,
      id,
      detectedAt: now,
      lastUpdatedAt: now,
      isActive: true,
    };
    this.behaviorPatterns.set(id, newPattern);
    return newPattern;
  }

  async updateBehaviorPattern(id: number, updates: Partial<BehaviorPattern>): Promise<BehaviorPattern | undefined> {
    const pattern = this.behaviorPatterns.get(id);
    if (!pattern) return undefined;

    const updatedPattern = { 
      ...pattern, 
      ...updates, 
      lastUpdatedAt: new Date() 
    };
    this.behaviorPatterns.set(id, updatedPattern);
    return updatedPattern;
  }

  // 行为记录相关方法
  async getBehaviorRecord(id: number): Promise<BehaviorRecord | undefined> {
    return this.behaviorRecords.get(id);
  }

  async getBehaviorRecordsByPatternId(patternId: number): Promise<BehaviorRecord[]> {
    return Array.from(this.behaviorRecords.values()).filter(
      (record) => record.patternId === patternId
    );
  }

  async getBehaviorRecordsByUserId(userId: number): Promise<BehaviorRecord[]> {
    return Array.from(this.behaviorRecords.values()).filter(
      (record) => record.userId === userId
    );
  }

  async createBehaviorRecord(record: InsertBehaviorRecord): Promise<BehaviorRecord> {
    const id = this.recordId++;
    const newRecord: BehaviorRecord = {
      ...record,
      id,
      recordedAt: new Date()
    };
    this.behaviorRecords.set(id, newRecord);
    
    // 更新相关行为模式的最后更新时间和频率
    const pattern = this.behaviorPatterns.get(record.patternId);
    if (pattern) {
      const updatedPattern = {
        ...pattern,
        lastUpdatedAt: new Date(),
        frequency: pattern.frequency + 1
      };
      this.behaviorPatterns.set(pattern.id, updatedPattern);
    }
    
    return newRecord;
  }

  // 干预策略相关方法
  async getInterventionStrategy(id: number): Promise<InterventionStrategy | undefined> {
    return this.interventionStrategies.get(id);
  }

  async getInterventionStrategiesByPatternId(patternId: number): Promise<InterventionStrategy[]> {
    return Array.from(this.interventionStrategies.values()).filter(
      (strategy) => strategy.patternId === patternId
    );
  }

  async getInterventionStrategiesByUserId(userId: number): Promise<InterventionStrategy[]> {
    return Array.from(this.interventionStrategies.values()).filter(
      (strategy) => strategy.userId === userId
    );
  }

  async getActiveInterventionStrategies(userId: number): Promise<InterventionStrategy[]> {
    return Array.from(this.interventionStrategies.values()).filter(
      (strategy) => strategy.userId === userId && strategy.isEnabled
    );
  }

  async createInterventionStrategy(strategy: InsertInterventionStrategy): Promise<InterventionStrategy> {
    const id = this.strategyId++;
    const newStrategy: InterventionStrategy = {
      ...strategy,
      id,
      createdAt: new Date(),
      lastTriggeredAt: null
    };
    this.interventionStrategies.set(id, newStrategy);
    return newStrategy;
  }

  async updateInterventionStrategy(id: number, updates: Partial<InterventionStrategy>): Promise<InterventionStrategy | undefined> {
    const strategy = this.interventionStrategies.get(id);
    if (!strategy) return undefined;

    const updatedStrategy = { ...strategy, ...updates };
    this.interventionStrategies.set(id, updatedStrategy);
    return updatedStrategy;
  }

  async rateInterventionEffectiveness(id: number, effectiveness: number): Promise<InterventionStrategy | undefined> {
    const strategy = this.interventionStrategies.get(id);
    if (!strategy) return undefined;

    const updatedStrategy = { 
      ...strategy, 
      effectiveness: Math.max(1, Math.min(5, effectiveness)) // 保证在1-5范围内
    };
    this.interventionStrategies.set(id, updatedStrategy);
    return updatedStrategy;
  }

  // 行为分析方法
  async analyzeUserBehavior(userId: number): Promise<{ 
    patterns: BehaviorPattern[],
    recommendations: InterventionStrategy[] 
  }> {
    // 获取用户的任务、专注会话等数据
    const userTasks = await this.getTasksByUserId(userId);
    const userFocusSessions = await this.getFocusSessionsByUserId(userId);
    
    // 检测行为模式
    const detectedPatterns: BehaviorPattern[] = [];
    
    // 示例：检测任务延迟完成模式
    const incompleteTasks = userTasks.filter(task => !task.completed);
    if (incompleteTasks.length > 5) {
      // 创建或更新"未完成任务过多"的行为模式
      const existingPatterns = await this.getBehaviorPatternsByType(userId, behaviorPatternTypes.INCOMPLETE_TASKS);
      
      if (existingPatterns.length > 0) {
        // 更新已有模式
        const pattern = existingPatterns[0];
        const updatedPattern = await this.updateBehaviorPattern(pattern.id, {
          frequency: pattern.frequency + 1,
          severity: Math.min(5, pattern.severity + 1),
          confidence: Math.min(100, pattern.confidence + 5)
        });
        if (updatedPattern) detectedPatterns.push(updatedPattern);
      } else {
        // 创建新模式
        const newPattern = await this.createBehaviorPattern({
          userId,
          patternType: behaviorPatternTypes.INCOMPLETE_TASKS,
          confidence: 70,
          frequency: 1,
          severity: 3,
          isActive: true,
          metadata: { taskCount: incompleteTasks.length }
        });
        detectedPatterns.push(newPattern);
      }
    }
    
    // 示例：检测经常拖延的模式
    if (userFocusSessions.length > 0) {
      const uncompletedSessions = userFocusSessions.filter(session => !session.completed);
      if (uncompletedSessions.length / userFocusSessions.length > 0.3) {
        // 30%以上的会话未完成，可能有拖延模式
        const existingPatterns = await this.getBehaviorPatternsByType(userId, behaviorPatternTypes.PROCRASTINATION);
        
        if (existingPatterns.length > 0) {
          // 更新已有模式
          const pattern = existingPatterns[0];
          const updatedPattern = await this.updateBehaviorPattern(pattern.id, {
            frequency: pattern.frequency + 1,
            confidence: Math.min(100, pattern.confidence + 5)
          });
          if (updatedPattern) detectedPatterns.push(updatedPattern);
        } else {
          // 创建新模式
          const newPattern = await this.createBehaviorPattern({
            userId,
            patternType: behaviorPatternTypes.PROCRASTINATION,
            confidence: 65,
            frequency: 1,
            severity: 2,
            isActive: true,
            metadata: { 
              uncompletedRate: uncompletedSessions.length / userFocusSessions.length 
            }
          });
          detectedPatterns.push(newPattern);
        }
      }
    }
    
    // 基于检测到的模式生成干预策略推荐
    const recommendations: InterventionStrategy[] = [];
    
    for (const pattern of detectedPatterns) {
      // 检查是否已经有针对该模式的干预策略
      const existingStrategies = await this.getInterventionStrategiesByPatternId(pattern.id);
      
      if (existingStrategies.length === 0) {
        // 没有现有策略，根据模式类型生成新的策略
        switch (pattern.patternType) {
          case behaviorPatternTypes.INCOMPLETE_TASKS:
            const taskStrategy = await this.createInterventionStrategy({
              userId,
              patternId: pattern.id,
              interventionType: interventionTypes.SUGGESTION,
              title: '任务分解练习',
              content: '尝试将较大的任务分解成15分钟左右的小步骤，这样可以降低开始任务的心理障碍。',
              trigger: 'before_task',
              frequency: 'daily',
              isEnabled: true
            });
            recommendations.push(taskStrategy);
            break;
            
          case behaviorPatternTypes.PROCRASTINATION:
            const procrastinationStrategy = await this.createInterventionStrategy({
              userId,
              patternId: pattern.id,
              interventionType: interventionTypes.ENCOURAGEMENT,
              title: '专注时间鼓励',
              content: '五分钟法则：先承诺只专注工作五分钟，之后如果想继续就继续，不想继续也可以停止。这样可以帮助克服开始任务的心理阻力。',
              trigger: 'before_focus',
              frequency: 'every_occurrence',
              isEnabled: true
            });
            recommendations.push(procrastinationStrategy);
            break;
            
          default:
            // 默认生成一个通用策略
            const generalStrategy = await this.createInterventionStrategy({
              userId,
              patternId: pattern.id,
              interventionType: interventionTypes.SUGGESTION,
              title: '行为模式改善建议',
              content: '我们发现了一个可能影响您效率的行为模式。尝试设置一个明确的日程表，并将任务分解成小步骤来改善这一情况。',
              trigger: 'on_pattern_detection',
              frequency: 'once',
              isEnabled: true
            });
            recommendations.push(generalStrategy);
        }
      } else {
        // 已有策略，添加到推荐中
        recommendations.push(...existingStrategies);
      }
    }
    
    return { patterns: detectedPatterns, recommendations };
  }
}

// 根据环境决定使用哪种存储方式
// 本地开发或测试时可以使用内存存储，生产环境使用数据库存储
export const storage = new MemStorage();
