import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { User as SelectUser, InsertUser } from "@shared/schema";
import MemoryStore from "memorystore";
import { userDataStore } from './file-data-store';
import bcrypt from 'bcrypt';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const MemoryStoreSession = MemoryStore(session);
  
  const sessionSettings: session.SessionOptions = {
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // 24小时
    }),
    secret: process.env.SESSION_SECRET || 'focus-life-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  };

  // app.set(\"trust proxy\", 1); // 保持注释
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = userDataStore.findUserByUsernameOrEmail(username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: '用户名或密码错误' });
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = userDataStore.findUserById(id);
      done(null, user || undefined);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    console.log("[Register Route] >>> Received /api/auth/register request");
    try {
      const { username, password, email, displayName, profileImage, adhd_profile, identityTags, isConsultant, consultantTitle, consultantBio, consultantVerified, points } = req.body;
      console.log("[Register Route] >>> Request body:", { username, email, displayName });

      if (!username || !password || !email || !displayName) {
        console.log("[Register Route] >>> Missing required fields");
        return res.status(400).json({ message: "用户名, 密码, 邮箱, 显示名称是必填的" });
      }
      
      const userDataForStore: Omit<InsertUser, 'password'> & { passwordPlainText: string } = {
        username,
        passwordPlainText: password,
        email,
        displayName,
        profileImage: profileImage ?? null,
        adhd_profile: adhd_profile ?? null,
        identityTags: identityTags ?? null,
        isConsultant: isConsultant ?? false,
        consultantTitle: consultantTitle ?? null,
        consultantBio: consultantBio ?? null,
        consultantVerified: consultantVerified ?? false,
        points: points ?? 0
      };
      console.log("[Register Route] >>> Prepared user data for saving:", userDataForStore);

      console.log("[Register Route] >>> Calling userDataStore.addUser...");
      // *** 确保调用的是 userDataStore.addUser ***
      const user = await userDataStore.addUser(userDataForStore); 
      console.log("[Register Route] >>> User created via userDataStore (before req.login):", user);

      req.login(user, (err) => {
        if (err) {
          console.error("[Register Route] >>> req.login error:", err);
          return next(err);
        }
        const { password: _, ...userWithoutPassword } = user;
        console.log("[Register Route] >>> Sending success response after req.login");
        res.status(201).json(userWithoutPassword);
      });
    } catch (err: any) {
      console.error("[Register Route] >>> Registration Error Caught:", err);
      console.error("[Register Route] >>> Error Stack:", err.stack);
      
      if (err.message === 'Username or email already exists.') {
        console.log("[Register Route] >>> Responding with 409 - Conflict");
        return res.status(409).json({ message: "用户名或邮箱已被占用" });
      } 
      else if (err.message?.startsWith('Failed to write users file:')) {
         console.log("[Register Route] >>> Responding with 500 - File Write Error");
         return res.status(500).json({ message: "服务器无法保存用户信息，请稍后重试或联系管理员" });
      }
      
      console.log("[Register Route] >>> Responding with 500 - Generic Server Error");
      res.status(500).json({ message: err.message || "注册过程中发生未知错误" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    console.log(">>> Received /api/auth/login request");
    // @ts-ignore - 忽略类型检查
    passport.authenticate('local', (err, user, info) => {
      console.log(">>> Passport authenticate callback", { err, user, info });
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "用户名或密码错误" });

      req.login(user, (err) => {
        console.log(">>> Login req.login callback", { err });
        if (err) return next(err);
        
        // Don't send password back to client
        const { password: _, ...userWithoutPassword } = user;
        console.log(">>> Login successful, sending user data");
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "已成功退出登录" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "未登录" });
    }
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}