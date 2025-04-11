#!/bin/bash

db_path="./dist/hot100.sqlite3"
csv_url="https://raw.githubusercontent.com/utdata/rwd-billboard-data/main/data-out/hot-100-current.csv"
csv_file="$(mktemp)"

curl "$csv_url" -o "$csv_file" --create-dirs
mkdir -p "$(dirname "$db_path")"
rm -f "$db_path"
sqlite-utils insert "$db_path" hot100 "$csv_file" --csv --detect-types
sqlite-utils transform "$db_path" hot100 --pk id

sqlite3 dist/hot100.sqlte3 .dump > dist/dump.sql
npx wrangler d1 execute hot100-db --remote --file=dist/dump.sql
npx wrangler d1 execute hot100-db --remote --file=./create_db.sql
