import { queryEntries, queryChart, queryPeaks } from "./db";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { ChartPage, SearchPage, TrackPage } from "./ui";

const router = createHashRouter([
    {
        path: "/charts/:week",
        element: <ChartPage />,
        loader: async ({ params }) => {
            const week = params.week ?? "1988-03-12";
            return queryChart(week);
        },
    },
    {
        path: "/tracks/:performer/:title",
        element: <TrackPage />,
        loader: async ({ params }) => {
            const performer = params.performer ?? "Rick Astley";
            const title = params.title ?? "Never Gonna Give You Up";
            return queryEntries(performer, title);
        },
    },
    {
        path: "/",
        element: <SearchPage />,
        loader: async ({ request }) => {
            const searchQuery = new URL(request.url).searchParams.get("q");
            if (searchQuery) {
                return queryPeaks(searchQuery);
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
