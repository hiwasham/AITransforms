import { errorResponse } from "@/api/lib/errors.js";

export interface App {
  handle(req: Request): Promise<Response>;
}

export type RouteHandler = (
  req: Request,
  ctx: { params: Record<string, string> },
) => Promise<Response>;

export interface Route {
  method: string;
  segments: string[];
  handler: RouteHandler;
}

function matchParams(
  segments: string[],
  path: string[],
): Record<string, string> | null {
  if (segments.length !== path.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
    if (segment.startsWith(":")) {
      try {
        params[segment.slice(1)] = decodeURIComponent(path[i]!);
      } catch {
        return null;
      }
    } else if (segment !== path[i]) {
      return null;
    }
  }
  return params;
}

export function createRouter(routes: Route[]): App {
  return {
    async handle(req: Request): Promise<Response> {
      const path = new URL(req.url).pathname.split("/").filter(Boolean);
      for (const route of routes) {
        if (route.method !== req.method) continue;
        const params = matchParams(route.segments, path);
        if (params) return route.handler(req, { params });
      }
      return errorResponse("not_found", "No such endpoint", 404);
    },
  };
}
