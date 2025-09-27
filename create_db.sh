#!/bin/bash

set -e

db_path="./dist/hot100.sqlite3"
csv_url="https://raw.githubusercontent.com/utdata/rwd-billboard-data/main/data-out/hot-100-current.csv"
csv_file="$(mktemp)"

echo "Downloading data from $csv_url..."
curl "$csv_url" -o "$csv_file" --create-dirs

echo "Creating database at $db_path..."
mkdir -p "$(dirname "$db_path")"
rm -f "$db_path"

echo "Inserting data into the database..."
sqlite-utils insert "$db_path" hot100 "$csv_file" --csv --detect-types

echo "Transforming data..."
sqlite-utils transform "$db_path" hot100 --pk id

echo "Dumping database to SQL file..."
sqlite3 dist/hot100.sqlte3 .dump > dist/dump.sql

echo "Executing SQL dump on remote database..."
npx wrangler d1 execute hot100-db --remote --file=dist/dump.sql

echo "Executing additional SQL..."
npx wrangler d1 execute hot100-db --remote --file=./create_db.sql

echo "Database creation finished successfully."