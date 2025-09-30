import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import path from "path";
import authRoute from "./routes/auth.route.ts";
import profileRoute from "./routes/profile.route.ts";
import adminRoutes from "./routes/admin.route.ts";

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// --- Paths ---
const clientRoot = path.resolve(__dirname, "../../client"); // contains server.html
const publicPath = path.resolve(__dirname, "../../client/public"); // contains js/, css/, pages/

// --- Serve static files ---
app.use(express.static(publicPath));

// --- Routes ---
// Home route
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(clientRoot, "server.html"), (err?: Error) => {
    if (err) {
      console.error("Error serving server.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

// API routes
app.use("/auth", authRoute);
app.use("/u", profileRoute);
app.use("/admin", adminRoutes);

// Explicit 404 route
app.get("/404", (_req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, "pages/error.404.html"), (err?: Error) => {
    if (err) {
      console.error("Error serving 404 page:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

// Catch-all 404 handler for unmatched routes (SPA safe)
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .sendFile(path.join(publicPath, "pages/error.404.html"), (err?: Error) => {
      if (err) {
        console.error("Error serving 404 page:", err);
        res.status(500).send("Internal Server Error");
      }
    });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Global Error Handler:", err.stack ?? err);
  res.status(500).json({ error: "Something went wrong" });
});

// Start server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
