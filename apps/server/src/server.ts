import express from "express";
import { type Request, type Response, type NextFunction } from "express";
import authRoute from "./routes/auth.route.ts";
import cors from "cors";
const app = express();

// middlewares setup
app.use(cors());
app.use(express.json());

// Basic root route for testing
app.get("/", (req: Request, res: Response) => {
  console.log("req received");

  // If ?msg=hello is provided, return it; otherwise return default
  const message = typeof req.query.msg === "string" ? req.query.msg : "ok";

  return res.status(200).json({ status: message });
});

const routes = {
  auth: authRoute,
  // Add more routes here as your app grows
  // user: userRoute,
  // posts: postRoute,
};

// Using routes with API prefix for better organization
app.use("/auth", routes.auth);

app.use((req: Request, res: Response, next: NextFunction) => {
  return res
    .status(404)
    .json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler:", err.stack ?? err);
  return res.status(500).json({ error: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
