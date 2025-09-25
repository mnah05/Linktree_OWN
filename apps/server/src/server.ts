//imports
import express from "express";
import { type Request, type Response, type NextFunction } from "express";
import authRoute from "./routes/auth.route.ts";
import cors from "cors";

const app = express();

//middlewares setup
app.use(cors());
app.use(express.json());

//testing route
app.get("/api-test", (req: Request, res: Response) => {
  return res.status(200).json({ status: "Okay", message: "API is running 🚀" });
});

//importing routes - you can organize them in a routes object if you want
const routes = {
  auth: authRoute,
  // Add more routes here as your app grows
  // user: userRoute,
  // posts: postRoute,
};

// Using routes with API prefix for better organization
app.use("/auth", routes.auth);

// 404 handler for non-existent routes
app.use((req: Request, res: Response, next: NextFunction) => {
  return res
    .status(404)
    .json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

//global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler:", err.stack);
  return res.status(500).json({ error: "Something went wrong on the server" });
});

//server listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port https://localhost:${PORT}/`);
});
