import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server-factory.ts";
import { GetHnTrendingStoriesModule } from "./tools/get-hn-trending-stories.ts";

if (import.meta.main) {
  const server = createServer({
    serverName: "local",
    version: "0.1.0",
    modules: [
      GetHnTrendingStoriesModule,
    ],
  });

  // シグナルハンドリング
  Deno.addSignalListener("SIGINT", async () => {
    console.warn("SIGINT received");
    await server.close();
    Deno.exit(0);
  });

  await server.connect(new StdioServerTransport());
  console.warn("Server is running");
}
