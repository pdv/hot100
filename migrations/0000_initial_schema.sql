CREATE TABLE hot100 (
    id TEXT PRIMARY KEY,
    chart_week TEXT,
    current_week INTEGER,
    title TEXT,
    performer TEXT,
    last_week INTEGER,
    peak_position INTEGER,
    weeks_on_chart INTEGER
);

CREATE VIRTUAL TABLE hot100_peaks USING fts5(performer, title, peak);

CREATE VIEW hot100_tracks AS
    SELECT performer, title, chart_week AS week, current_week AS position
    FROM hot100
    ORDER BY 1, 2, 3;

CREATE VIEW hot100_weeks AS
    SELECT chart_week AS week, current_week AS position, performer, title
    FROM hot100
    ORDER BY 1, 2;
