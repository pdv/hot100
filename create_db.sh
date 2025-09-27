#!/bin/bash

set -e

dump_file="dist/dump.sql"
csv_url="https://raw.githubusercontent.com/utdata/rwd-billboard-data/main/data-out/hot-100-current.csv"
csv_file="$(mktemp)"

echo "Downloading data from $csv_url..."
curl "$csv_url" -o "$csv_file" --create-dirs

echo "Creating sql dump file..."
mkdir -p "$(dirname "$dump_file")"
cat ./create_db.sql > "$dump_file"

echo "Converting CSV to SQL..."
sqlite-utils memory "$csv_file" --csv --table hot100 | sqlite-utils dump --table hot100 - | sed 's/INSERT INTO/INSERT OR IGNORE INTO/g' >> "$dump_file"

echo "Executing SQL on remote database..."
npx wrangler d1 execute hot100-db --remote --file="$dump_file"

echo "Database creation finished successfully."
