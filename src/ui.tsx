import * as React from "react";
import { Form, Link, useLoaderData, useParams } from "react-router-dom";
import { Entry, Track } from "./db";
import { getSurroundingWeeks } from "./utils";

export function ChartPage() {
    const { week } = useParams();
    const chart = useLoaderData() as Track[];
    const [lastWeek, nextWeek] = getSurroundingWeeks(week ?? "1988-03-12");
    return (
        <div>
            <nav>
                <Link to={`/charts/${lastWeek}`}>{lastWeek}</Link>
                {" < "}
                <Link to="/">Home</Link>
                {" > "}
                <Link to={`/charts/${nextWeek}`}>{nextWeek}</Link>
            </nav>
            <h3>{week}</h3>
            <ol>
                {chart.map((track) => (
                    <li key={track.peak}>
                        <Link to={`/tracks/${track.performer}/${track.title}`}>
                            {track.performer} - {track.title}
                        </Link>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function TrackPage() {
    const { performer, title } = useParams();
    const entries = useLoaderData() as Entry[];
    return (
        <div>
            <nav>
                <Link to="/">Home</Link>
                {" - "}
                <Link to={`/?q=${performer}`}>Artist</Link>
            </nav>
            <h3>
                {performer} - {title}
            </h3>
            <ol>
                {entries.map((entry) => (
                    <li key={entry.week}>
                        <Link to={`/charts/${entry.week}`}>
                            {entry.week} - {entry.position}
                        </Link>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function SearchPage() {
    const searchResults = useLoaderData() as Track[];
    return (
        <>
            <Form role="search">
                <input name="q" aria-label="search query" />
                <button type="submit">Search</button>
            </Form>
            <ol>
                {searchResults.map((track) => (
                    <li key={track.title}>
                        <Link to={`/tracks/${track.performer}/${track.title}`}>
                            {track.performer} - {track.title} ({track.peak})
                        </Link>
                    </li>
                ))}
            </ol>
        </>
    );
}
