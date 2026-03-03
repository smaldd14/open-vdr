import { Hono } from "hono";
import { cors } from "hono/cors";
import { documents } from "./routes/documents";
import { invitations } from "./routes/invitations";
import { members } from "./routes/members";
import { invite } from "./routes/invite";
import { branding } from "./routes/branding";

const app = new Hono<{ Bindings: Env }>();

// Parse CORS origins from environment variable (comma-separated)
function getCorsOrigins(env: Env): string[] | string {
  const origins = env.CORS_ALLOWED_ORIGINS;
  if (!origins) {
    // Default to localhost for development
    return ["http://localhost:5173", "http://localhost:8787"];
  }
  return origins.split(",").map((o: string) => o.trim()).filter(Boolean);
}

app.use("/api/*", (c, next) => {
  const corsMiddleware = cors({
    origin: getCorsOrigins(c.env),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"]
  });
  return corsMiddleware(c, next);
});

// Health check
app.get("/api/", (c) => c.json({ name: "Open VDR API", status: "healthy" }));

app.route('/api/rooms/:roomId/documents', documents);
app.route('/api/rooms/:roomId/invitations', invitations);
app.route('/api/rooms/:roomId/members', members);
app.route('/api/rooms/:roomId/branding', branding);
app.route('/api/invite', invite);

export default {
  fetch: app.fetch,
};
