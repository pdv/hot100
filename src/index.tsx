import { queryEntries, queryChart, queryPeaks, loadDb } from "./db";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createHashRouter, redirect, RouterProvider } from "react-router-dom";
import { ChartPage, SearchPage, TrackPage } from "./ui";
import { getChartWeek } from "./utils";

const router = createHashRouter([
    {
        path: "/charts/:week",
        element: <ChartPage />,
        loader: async ({ params }) => {
            const week = params.week ?? "1988-03-12";
            const chartWeek = getChartWeek(week);
            if (week !== chartWeek) {
                return redirect(`/charts/${chartWeek}`);
            }
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
                await loadDb();
                return [];
            }
        },
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
