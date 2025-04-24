import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";

const app = express();

// CORS 配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up authentication
setupAuth(app);

// // 自定义日志中间件
// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;
// 
//   const originalResJson = res.json;
//   res.json = function (bodyJson, ...args) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };
// 
//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }
// 
//       if (logLine.length > 80) {
//         logLine = logLine.slice(0, 79) + "…";
//       }
// 
//       log(logLine);
//     }
//   });
// 
//   next();
// });

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to use port from environment variable first, then fallback to default ports
  const preferredPort = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const fallbackPorts = [8080, 8000, 5001];
  
  // Function to attempt to start server on a given port
  const startServer = (port: number) => {
    try {
      server.listen({
        port,
        host: "127.0.0.1",
      }, () => {
        log(`serving on port ${port}`);
      });
    } catch (error: any) {
      if (error.code === 'ENOTSUP' || error.code === 'EADDRINUSE') {
        const nextPort = fallbackPorts.shift();
        if (nextPort) {
          log(`Failed to bind to port ${port}, trying ${nextPort}...`);
          startServer(nextPort);
        } else {
          log(`Failed to bind to any port. Please check your network configuration.`);
          process.exit(1);
        }
      } else {
        log(`Server error: ${error.message}`);
        throw error;
      }
    }
  };

  // Add error handler to the server
  server.on('error', (error: any) => {
    if (error.code === 'ENOTSUP' || error.code === 'EADDRINUSE') {
      const nextPort = fallbackPorts.shift();
      if (nextPort) {
        log(`Failed to bind to port ${preferredPort}, trying ${nextPort}...`);
        startServer(nextPort);
      } else {
        log(`Failed to bind to any port. Please check your network configuration.`);
        process.exit(1);
      }
    } else {
      log(`Server error: ${error.message}`);
      throw error;
    }
  });

  // Start the server with the preferred port
  startServer(preferredPort);
})();
