#!/bin/bash

db_path=./dist/hot100.sqlite3
csv_file=$(mktemp)

rm ${db_path}

curl https://raw.githubusercontent.com/utdata/rwd-billboard-data/main/data-out/hot-100-current.csv -o ${csv_file}

sqlite-utils insert ${db_path} hot100 "${csv_file}" --csv --detect-types
sqlite-utils transform ${db_path} hot100 --pk id

sqlite3 ${db_path} < create_db.sql

