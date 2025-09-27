import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getChart, getTrack, search } from "./db";

const dateSchema = z.string().regex(/^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/);

export default function makeServer(db: D1Database) {
    const server = new McpServer({
        name: "Hot 100",
        version: "1.0.0",
    });

    server.registerTool(
        "get_chart",
        {
            title: "Get chart for week",
            description: "Get the Hot 100 chart for a given week",
            inputSchema: {
                week: dateSchema.describe("Week in YYYY-MM-DD format"),
            },
            outputSchema: {
                chart: z.array(
                    z.object({
                        position: z.number().int(),
                        performer: z.string(),
                        title: z.string(),
                    }),
                ),
            },
        },
        async ({ week }) => {
            const res = {
                content: await getChart(db, week)
            };
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(res)
                }],
                structuredContent: res,
            };
        },
    );

    server.registerTool(
        "get_track",
        {
            title: "Get chart positions for track",
            description: "Get chart positions for track",
            inputSchema: {
                artist: z.string().describe("Performer of the track"),
                title: z.string().describe("Title of the track"),
            },
            outputSchema: {
                positions: z.array(
                    z.object({
                        week: dateSchema.describe("Chart week"),
                        position: z.number().int().describe("Position on the chart this week"),
                    }),
                ),
            },
        },
        async ({ artist, title }) => {
            const res = {
                positions: await getTrack(db, artist, title)
            };
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(res),
                }],
                structuredContent: res
            };
        },
    );

    server.registerTool(
        "search_charts",
        {
            title: "Search Charts",
            description: "Search all tracks by artist or title",
            inputSchema: {
                q: z.string().describe("Search query"),
            },
            outputSchema: {
                results: z.array(
                    z.object({
                        performer: z.string().describe("Performer of the track"),
                        title: z.string().describe("Title of the track"),
                        peak: z
                            .number()
                            .int()
                            .describe("Highest chart position reached by this track"),
                    }),
                ),
            },
        },
        async ({ q }) => {
            const res = {
                results: await search(db, q)
            };
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(res)
                }],
                structuredContent: res,
            };
        },
    );

    return server.server;
}
