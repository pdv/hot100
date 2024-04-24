import * as React from "react";
import { useEffect, useState } from "react";
import { Form, useLoaderData, useParams, useSearchParams } from "react-router-dom";
import { Entry, Track, queryPerformer } from "./db";

export function TrackPage() {
    const { performer, title } = useParams();
    const entries = useLoaderData() as Entry[];
    return (
        <div>
            <h3>
                {performer} - {title}
            </h3>
            <ol>
                {entries.map((entry) => (
                    <li key={entry.week}>
                        {entry.week} - {entry.position}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function SearchPage() {
    const [searchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const format = (track: Track) => `${track.performer} - ${track.title} (${track.peak})`;
    useEffect(() => {
        const performer = searchParams.get("performer");
        if (performer) {
            queryPerformer(performer)
                .then((tracks) => tracks.map(format))
                .then(setSearchResults);
        }
    }, [searchParams]);
    return (
        <>
            <Form role="search">
                <label>
                    <input name="performer" />
                </label>
                <button type="submit">Search</button>
            </Form>
            <ol>
                {searchResults.map((result) => (
                    <li key={result}>{result}</li>
                ))}
            </ol>
        </>
    );
}
