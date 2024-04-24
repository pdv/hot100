import { queryChart, queryPerformer } from "./db";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { SearchPage, TrackPage } from "./ui";

const router = createHashRouter([
    {
        path: "/tracks/:performer/:title",
        element: <TrackPage />,
        loader: async ({ params }) => {
            const performer = params.performer ?? "Rick Astley";
            const title = params.title ?? "Never Gonna Give You Up";
            return queryChart(performer, title);
        },
    },
    {
        path: "/",
        element: <SearchPage />,
        loader: async ({ request }) => {
            const performer = new URL(request.url).searchParams.get("performer");
            if (performer) {
                return queryPerformer(performer);
            } else {
                return [];
            }
        },
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    //     <React.StrictMode>
    <RouterProvider router={router} />,
    //    </React.StrictMode>
);
