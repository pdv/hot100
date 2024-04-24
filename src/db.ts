import * as Comlink from "comlink";
import { LazyHttpDatabase } from "sql.js-httpvfs/dist/sqlite.worker";
import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = new URL("sql.js-httpvfs/dist/sqlite.worker.js", import.meta.url);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

let database: Comlink.Remote<LazyHttpDatabase>;

async function getDb(): Promise<Comlink.Remote<LazyHttpDatabase>> {
    if (database) {
        return database;
    }
    const worker = await createDbWorker(
        [
            {
                from: "inline",
                config: {
                    serverMode: "full",
                    url: "./hot100.sqlite3",
                    requestChunkSize: 4096,
                },
            },
        ],
        workerUrl.toString(),
        wasmUrl.toString(),
    );
    database = worker.db;
    return database;
}

export interface Track {
    performer: string;
    title: string;
    peak: string;
}

const performerQuery = `
select performer, title, min(current_week) as peak
from hot100_performers
where performer = ?
group by 1, 2
order by 3
`.trim();

export async function queryPerformer(performer: string): Promise<Track[]> {
    const db = await getDb();
    const result = await db.query(performerQuery, [performer]);
    return result as Track[];
}

export interface Entry {
    week: string;
    position: string;
}

const entriesQuery = `
select chart_week as week, current_week as position
from hot100_performers
where performer = ?1 and title = ?2
order by 1
`.trim();

export async function queryEntries(performer: String, title: String): Promise<Entry[]> {
    const db = await getDb();
    const result = await db.query(entriesQuery, [performer, title]);
    return result as Entry[];
}

const chartQuery = `
select current_week as peak, performer, title
from hot100_weeks
where chart_week = ?
`.trim();

export async function queryChart(week: String): Promise<Track[]> {
    const db = await getDb();
    const result = await db.query(chartQuery, [week]);
    return result as Track[];
}
