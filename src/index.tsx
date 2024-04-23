import { queryPerformer } from "./db";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
    createHashRouter,
    Form,
    RouterProvider,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState<string[]>([]);
    useEffect(() => {
        const performer = searchParams.get("performer");
        if (performer) {
            queryPerformer(performer)
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
                {searchResults.map(result => (
                    <li key={result}>{result}</li>
                ))}
            </ol>
        </>
    );
}

const router = createHashRouter([
    {
        path: "/*",
        element: <SearchPage />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    //     <React.StrictMode>
    <RouterProvider router={router} />,
    //    </React.StrictMode>
);
