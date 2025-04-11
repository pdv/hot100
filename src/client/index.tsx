import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom";
import { ChartPage, SearchPage, TrackPage } from "./ui";
import { getChartWeek } from "../utils";

const router = createBrowserRouter([
    {
        path: "/",
        element: <SearchPage />,
        loader: async ({ request }) => {
            const searchQuery = new URL(request.url).searchParams.get("q");
            if (searchQuery) {
                const res = await fetch(`/api/search?q=${searchQuery}`);
                return res.json();
            } else {
                return [];
            }
        },
    },
    {
        path: "/charts/:week",
        element: <ChartPage />,
        loader: async ({ params }) => {
            const week = params.week ?? "1988-03-12";
            const chartWeek = getChartWeek(week);
            if (week !== chartWeek) {
                return redirect(`/charts/${chartWeek}`);
            }
            const res = await fetch(`/api/charts/${week}`);
            return res.json();
        },
    },
    {
        path: "/tracks/:performer/:title",
        element: <TrackPage />,
        loader: async ({ params }) => {
            const performer = encodeURIComponent(params.performer ?? "Rick Astley");
            const title = encodeURIComponent(params.title ?? "Never Gonna Give You Up");
            const res = await fetch(`/api/tracks/${performer}/${title}`);
            return res.json();
        },
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
