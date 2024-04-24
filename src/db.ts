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

const peaksQuery = `
select performer, title, peak
from hot100_peaks
where performer in (
    select name from performers_search
    where name match ?1
    limit 50
) or title in (
    select title from tracks_search
    where title match ?1
    limit 50
)
order by peak
limit 100
`.trim();

export async function queryPeaks(searchQuery: String): Promise<Track[]> {
    const db = await getDb();
    const result = await db.query(peaksQuery, [searchQuery]);
    return result as Track[];
}

export interface Entry {
    week: string;
    position: string;
}

const entriesQuery = `
select week, position
from hot100_tracks
where performer = ?1 and title = ?2
`.trim();

export async function queryEntries(performer: String, title: String): Promise<Entry[]> {
    const db = await getDb();
    const result = await db.query(entriesQuery, [performer, title]);
    return result as Entry[];
}

const chartQuery = `
select position, performer, title
from hot100_weeks
where week = ?
`.trim();

export async function queryChart(week: String): Promise<Track[]> {
    const db = await getDb();
    const result = await db.query(chartQuery, [week]);
    return result as Track[];
}
