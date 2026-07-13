import { createServer, type Server } from "node:http";

/**
 * A tiny local HTTP server serving fixture pages, matching quickstart.md's
 * "resolves to a real or locally-served fixture page" testing approach —
 * no live third-party network calls in the automated suite.
 */
export interface FixtureServer {
  url: string;
  close: () => Promise<void>;
}

const PAGES: Record<string, { status: number; body: string }> = {
  "/complete": {
    status: 200,
    body: `<html><body>
      <h1>Sam's Bakery</h1>
      <p>We are a family-owned bakery serving fresh sourdough bread since 1998.
      Our customers love our cinnamon rolls and our weekend farmers market stand.</p>
      <h2>FAQ</h2>
      <p>Do you take custom orders? Yes, we take custom cake orders with two weeks notice.</p>
      <p>Are you open on Sundays? Yes, from 8am to 2pm.</p>
    </body></html>`,
  },
  "/insufficient": {
    status: 200,
    body: `<html><body><p>Hi.</p></body></html>`,
  },
  "/robots-disallow": {
    status: 200,
    body: `<html><body><h1>Blocked site</h1><p>This should never be scraped because robots.txt disallows it entirely for this fixture.</p></body></html>`,
  },
};

export async function startFixtureServer(): Promise<FixtureServer> {
  const server: Server = createServer((req, res) => {
    const url = req.url ?? "/";
    if (url === "/robots.txt") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("User-agent: *\nDisallow: /robots-disallow\n");
      return;
    }
    const page = PAGES[url];
    if (!page) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    res.writeHead(page.status, { "content-type": "text/html" });
    res.end(page.body);
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;

  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
