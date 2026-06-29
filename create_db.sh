#!/bin/bash

set -e

for dep in sqlite3 sqlite-utils npm; do
    if ! command -v "$dep" &> /dev/null; then
        echo "Error: Missing required dependency '$dep'." >&2
        exit 1
    fi
done

csv_url="https://raw.githubusercontent.com/utdata/rwd-billboard-data/main/data-out/hot-100-current.csv"
csv_file="$(mktemp)"
db_file="$(mktemp)"
dump_file="$(mktemp)"

echo "Downloading data from $csv_url..."
curl --fail --silent --show-error --location "$csv_url" --output "$csv_file"

echo "Converting CSV to SQL..."
sqlite-utils insert "$db_file" hot100 "$csv_file" --csv --detect-types

echo "Creating SQL dump file..."
{
cat <<-SQL
  DROP TABLE IF EXISTS hot100;
  DROP TABLE IF EXISTS hot100_peaks;
SQL

sqlite3 "$db_file" .dump | grep -v '^BEGIN TRANSACTION;' | grep -v '^COMMIT;'

cat <<-SQL
	CREATE INDEX hot100_performer_title_chart_week_idx ON hot100 (performer, title, chart_week);
	CREATE INDEX hot100_chart_week_current_week_idx ON hot100 (chart_week, current_week);
	CREATE VIRTUAL TABLE hot100_peaks USING fts5(performer, title, peak);
	INSERT INTO hot100_peaks (performer, title, peak) SELECT performer, title, MIN(current_week) AS peak FROM hot100 GROUP BY 1, 2 ORDER BY 1;

SQL
} > "$dump_file"

echo "Uploading to remote DB..."
npx wrangler d1 execute hot100-db --remote --file="$dump_file"

echo "Done."
