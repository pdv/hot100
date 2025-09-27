import { AutoRouter } from "itty-router";

export default AutoRouter({
    catch: (e) => console.error(e),
})
    .get("/api/search", async (req, env) => {
        const { results } = await env.DB.prepare(
            `
            SELECT performer, title, peak
            FROM hot100_peaks
            WHERE hot100_peaks MATCH ?
            ORDER BY peak
            LIMIT 100
        `.trim(),
        )
            .bind(req.query["q"])
            .all();
        return results;
    })
    .get("/api/charts/:week", async ({ week }, env) => {
        const { results } = await env.DB.prepare(
            `
            SELECT current_week as position, performer, title
            FROM hot100
            WHERE chart_week = ?
        `.trim(),
        )
            .bind(week)
            .all();
        return results;
    })
    .get("/api/tracks/:performer/:title", async ({ performer, title }, env) => {
        const { results } = await env.DB.prepare(
            `
            SELECT chart_week as week, current_week as position
            FROM hot100
            WHERE performer = ?1 AND title = ?2
        `.trim(),
        )
            .bind(decodeURIComponent(performer), decodeURIComponent(title))
            .all();
        return results;
    })
    .get("*", (req, env) => env.ASSETS.fetch(req));
