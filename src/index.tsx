import { queryPerformer } from "./db";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    Form,
    RouterProvider,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState("");
    useEffect(() => {
        console.log("useEffect");
        const performer = searchParams.get("performer");
        if (performer) {
            queryPerformer(performer)
                .then((r) => r.join("\n"))
                .then(setSearchResults);
        }
    }, [searchParams]);
    return (
        <div>
            <Form role="search">
                <label>
                    <input name="performer" />
                </label>
                <button type="submit">Search</button>
            </Form>
            {searchResults !== "" ? <p>{searchResults}</p> : <p>Loading...</p>}
        </div>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <SearchPage />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    //     <React.StrictMode>
    <RouterProvider router={router} />,
    //    </React.StrictMode>
);
