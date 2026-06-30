import { AutoRouter, IRequest, html } from 'itty-router';

const router = AutoRouter();

function getChartWeek(week: string): string {
    const date = new Date(week);
    date.setUTCHours(6);
    if (date.getUTCDay() !== 6) {
        date.setUTCDate(date.getUTCDate() - date.getUTCDay() - 1);
    }
    return date.toISOString().slice(0, 10);
}

function getSurroundingWeeks(week: string): [string, string] {
    const date = new Date(week);
    date.setUTCHours(6);
    date.setUTCDate(date.getUTCDate() - 7);
    const lastWeek = date.toISOString().slice(0, 10);
    date.setUTCDate(date.getUTCDate() + 14);
    const nextWeek = date.toISOString().slice(0, 10);
    return [lastWeek, nextWeek];
}

function page(body: string): Response {
    return html(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>hot100</title></head><body>${body}</body></html>`,
        { headers: { "Cache-Control": "public, max-age=604800" }}
    );
}

router.get('/charts/:week', async ({ params, url }: IRequest, env: Env) => {
    const week = params.week;
    const chartWeek = getChartWeek(week);
    if (week !== chartWeek) {
        return Response.redirect(new URL(`/charts/${chartWeek}`, url).toString(), 302);
    }
    const { results } = await env.DB.prepare(
        "SELECT current_week as position, performer, title FROM hot100 WHERE chart_week = ?",
    )
        .bind(week)
        .all<{ position: number; performer: string; title: string }>();
    const [lastWeek, nextWeek] = getSurroundingWeeks(week);
    return page(`
        <nav>
            <a href="/charts/${lastWeek}">${lastWeek}</a>
            |
            <a href="/">Home</a>
            |
            <a href="/charts/${nextWeek}">${nextWeek}</a>
        </nav>
        <h3>${week}</h3>
        <ol>
            ${results.map(r => `
                <li><a href="/tracks/${encodeURIComponent(r.performer)}/${encodeURIComponent(r.title)}">${r.performer} - ${r.title}</a></li>
            `.trim()).join("")}
        </ol>
    `);
});

router.get('/tracks/:performer/:title', async ({ params }: IRequest, env: Env) => {
    const performer = decodeURIComponent(params.performer);
    const title = decodeURIComponent(params.title);
    const { results } = await env.DB.prepare(
        "SELECT chart_week as week, current_week as position FROM hot100 WHERE performer = ?1 AND title = ?2",
    )
        .bind(performer, title)
        .all<{ week: string; position: number }>();
    return page(`
        <nav>
            <a href="/">Home</a> - <a href="/?q=${encodeURIComponent(performer)}">Artist</a>
        </nav>
        <h3>${performer} - ${title}</h3>
        <ol>
            ${results.map(r => `
                <li><a href="/charts/${r.week}">${r.week} - ${r.position}</a></li>
            `.trim()).join("")}
        </ol>
    `);
});

router.get('/', async ({ query }: IRequest, env: Env) => {
    const q = (query.q as string) ?? "";
    let results;
    if (q) {
        const res = await env.DB.prepare(
            "SELECT performer, title, peak FROM hot100_peaks WHERE hot100_peaks MATCH ? ORDER BY peak LIMIT 100",
        )
            .bind(q)
            .all<{ performer: string; title: string; peak: number }>();
        results = res.results
    }
    return page(`
        <form method="get">
            <input name="q" value="${q}">
            <button type="submit">Search</button
        </form>
        <ol>
            ${results?.map(r => `
                <li><a href="/tracks/${encodeURIComponent(r.performer)}/${encodeURIComponent(r.title)}">${r.performer} — ${r.title} (${r.peak})</a></li>
            `.trim()).join("") ?? ""}
        </ol>
    `);
});

export default router;
