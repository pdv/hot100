
export async function search(db: D1Database, q: string) {
    const { results } = await db.prepare(
        `
        SELECT performer, title, peak
        FROM hot100_peaks
        WHERE hot100_peaks MATCH ?
        ORDER BY peak
        LIMIT 100
    `.trim(),
    )
        .bind(q)
        .all();
    return results;
}

export async function getChart(db: D1Database, week: string) {
    const { results } = await db.prepare(
        `
        SELECT current_week as position, performer, title
        FROM hot100
        WHERE chart_week = ?
    `.trim(),
    )
        .bind(week)
        .all();
    return results;
}

export async function getTrack(db: D1Database, performer: string, title: string) {
    const { results } = await db.prepare(
        `
        SELECT chart_week as week, current_week as position
        FROM hot100
        WHERE performer = ?1 AND title = ?2
    `.trim(),
    )
        .bind(decodeURIComponent(performer), decodeURIComponent(title))
        .all();
    return results;
}
