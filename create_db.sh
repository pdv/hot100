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
  --rename peak_pos:peak_position \
  --rename wks_on_chart:weeks_on_chart \
  --convert 'id: f"{r["chart_week"]}-{r["performer"]}-{r["title"]}"'

# Get the INSERT statements for hot100
sqlite-utils dump "$db_file" | grep "^INSERT INTO hot100" | sed 's/INSERT INTO/INSERT OR IGNORE INTO/g' > "$dump_file"
rm "$db_file"

# Append the statement to populate the peaks table
echo "INSERT OR REPLACE INTO hot100_peaks SELECT performer, title, MIN(current_week) AS peak FROM hot100 GROUP BY 1, 2 ORDER BY 1;" >> "$dump_file"

echo "Inserting to remote DB..."
npx wrangler d1 execute hot100-db --remote --file="$dump_file"
