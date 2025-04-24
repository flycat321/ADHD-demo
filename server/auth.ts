import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored || !stored.includes('.')) {
    // 如果密码为空或格式不正确，返回false
    return false;
  }
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
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
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
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
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    console.log(">>> Received /api/auth/register request");
    try {
      const { username, password, email, displayName } = req.body;
      console.log(">>> Request body:", { username, email, displayName });

      if (!username || !password || !email || !displayName) {
        console.log(">>> Missing required fields");
        return res.status(400).json({ message: "所有字段都是必填的" });
      }
      
      console.log(`>>> Checking if username exists: ${username}`);
      const existingUser = await storage.getUserByUsername(username);
      console.log(">>> Existing user check result:", existingUser);
      if (existingUser) {
        console.log(">>> Username already exists");
        return res.status(409).json({ message: "用户名已被占用" });
      }
      
      console.log(">>> Creating new user...");
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        email,
        displayName,
        profileImage: null,
        adhd_profile: null,
        identityTags: [],
        isConsultant: false,
        consultantTitle: null,
        consultantBio: null,
        consultantVerified: false,
        points: 0
      });
      console.log(">>> User created:", user);

      req.login(user, (err) => {
        if (err) {
          console.error(">>> req.login error:", err);
          return next(err);
        }
        // Don't send password back to client
        const { password: _, ...userWithoutPassword } = user;
        console.log(">>> Sending success response after req.login");
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error(">>> Registration Error Caught:", err);
      res.status(500).json({ message: "注册过程中出错" });
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