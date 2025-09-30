import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import path from "path";
import authRoute from "./routes/auth.route.ts";
import profileRoute from "./routes/profile.route.ts";

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// --- Serve static files from client/public ---
app.use(express.static(path.resolve(__dirname, "../../client/public")));

// --- Default route ---
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, "../../client/index.html"));
});

// --- Other routes ---
app.use("/auth", authRoute);
app.use("/u", profileRoute);

// --- Custom 404 page ---
const clientPages = path.resolve(process.cwd(), "apps/client/public/pages");
app.get("/404", (_req: Request, res: Response) => {
  res.sendFile(path.join(clientPages, "error.404.html"), (err?: Error) => {
    if (err) {
      console.error("Error serving 404 page:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

// --- Catch-all 404 handler for unmatched routes ---
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .sendFile(path.join(clientPages, "error.404.html"), (err?: Error) => {
      if (err) {
        console.error("Error serving 404 page:", err);
        res.status(404).json({ error: "Route not found" });
      }
    });
});

// --- Global error handler ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Global Error Handler:", err.stack ?? err);
  res.status(500).json({ error: "Something went wrong" });
});

// --- Start server ---
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
