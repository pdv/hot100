import { AutoRouter } from "itty-router";
import makeServer from "./mcp";
import { McpAgent } from "agents/mcp";
import { getChart, getTrack, search } from "./db";

export class MCP extends McpAgent<Env> {
    server = makeServer(this.env.DB);
    async init() {
    }
}

export default AutoRouter({
    catch: (e) => console.error(e),
})
    .get("/api/search", async (req, env) => {
        return await search(env.DB, req.query["q"]);
    })
    .get("/api/charts/:week", async ({ week }, env) => {
        return await getChart(env.DB, week);
    })
    .get("/api/tracks/:performer/:title", async ({ performer, title }, env) => {
        return await getTrack(env.DB, performer, title);
    })
    .post("/mcp", async (req, env, ctx) => {
        return MCP.serve("/mcp").fetch(req, env, ctx)
    })
    .get("*", (req, env) => env.ASSETS.fetch(req));
