import * as Comlink from "comlink";
import {LazyHttpDatabase} from "sql.js-httpvfs/dist/sqlite.worker";
import {createDbWorker} from "sql.js-httpvfs";

const workerUrl = new URL(
    "sql.js-httpvfs/dist/sqlite.worker.js",
    import.meta.url
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

let database: Comlink.Remote<LazyHttpDatabase>;

async function getDb(): Promise<Comlink.Remote<LazyHttpDatabase>> {
    if (database) {
        return database
    }
    const worker = await createDbWorker(
        [
            {
                from: "inline",
                config: {
                    serverMode: "full",
                    url: "hot100.sqlite3",
                    requestChunkSize: 4096,
                },
            },
        ],
        workerUrl.toString(),
        wasmUrl.toString()
    );
    database = worker.db
    return database
}

interface Track {
    title: string
    peak: string
}

const performerQuery = `
select title, min(current_week) as peak
from hot100_search
where performer = ?
group by 1
order by 2
`.trim();

export async function queryPerformer(performer: string): Promise<string[]> {
    const db = await getDb();
    const result = await db.query(performerQuery, [performer]);
    console.log(result);
    const cast = result as Track[];
    return cast.map(t => `${t.title} ${t.peak}`);
}