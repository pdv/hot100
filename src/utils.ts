export function getChartWeek(week: string): string {
    const date = new Date(week);
    date.setUTCHours(6);
    if (date.getUTCDay() != 6) {
        date.setUTCDate(date.getUTCDate() - date.getUTCDay() - 1);
    }
    return date.toISOString().slice(0, 10);
}

export function getSurroundingWeeks(week: string): [string, string] {
    const date = new Date(week);
    date.setUTCHours(6);
    date.setUTCDate(date.getUTCDate() - 7);
    const lastWeek = date.toISOString().slice(0, 10);
    date.setUTCDate(date.getUTCDate() + 14);
    const nextWeek = date.toISOString().slice(0, 10);
    return [lastWeek, nextWeek];
}
