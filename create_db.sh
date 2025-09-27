#!/bin/bash

set -e

dump_file="dist/dump.sql"
csv_url="https://raw.githubusercontent.com/utdata/rwd-billboard-data/main/data-out/hot-100-current.csv"
csv_file="$(mktemp)"

echo "Downloading data from $csv_url..."
curl "$csv_url" -o "$csv_file" --create-dirs

echo "Converting CSV to SQL..."
mkdir -p "$(dirname "$dump_file")"
db_file=$(mktemp)
sqlite-utils insert "$db_file" hot100 "$csv_file" --csv \
  --convert '
    row["id"] = f"""{row["chart_week"]}-{row["current_week"]}"""
    row["peak_position"] = row.pop("peak_pos")
    row["weeks_on_chart"] = row.pop("wks_on_chart")
    return row
'

# Create the dump file
{
  echo "DROP TABLE IF EXISTS hot100;"
  echo "DROP TABLE IF EXISTS hot100_peaks;"
  echo "DROP VIEW IF EXISTS hot100_tracks;"
  echo "DROP VIEW IF EXISTS hot100_weeks;"
  sqlite-utils dump "$db_file" | grep -v "^BEGIN TRANSACTION;" | grep -v "^COMMIT;"
  echo "CREATE VIRTUAL TABLE hot100_peaks USING fts5(performer, title, peak);"
  echo "INSERT INTO hot100_peaks (performer, title, peak) SELECT performer, title, MIN(current_week) AS peak FROM hot100 GROUP BY 1, 2 ORDER BY 1;"
  echo "CREATE VIEW hot100_tracks AS SELECT performer, title, chart_week AS week, current_week AS position FROM hot100 ORDER BY 1, 2, 3;"
  echo "CREATE VIEW hot100_weeks AS SELECT chart_week AS week, current_week AS position, performer, title FROM hot100 ORDER BY 1, 2;"
} > "$dump_file"

rm "$db_file"

echo "Inserting to remote DB..."
npx wrangler d1 execute hot100-db --remote --file="$dump_file"
