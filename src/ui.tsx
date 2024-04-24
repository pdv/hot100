import * as React from "react";
import { Form, Link, useLoaderData, useParams, useSearchParams } from "react-router-dom";
import { Entry, Track } from "./db";

export function ChartPage() {
    const { week } = useParams();
    const chart = useLoaderData() as Track[];
    return (
        <div>
            <Link to="/">Home</Link>
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
            <Link to={`/?q=${performer}`}>Home</Link>
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
