pragma page_size = 4096;

create table hot100_performers as select * from hot100 order by performer;
create index hot100_performers_performer on hot100_performers(performer);

create table hot100_weeks as select * from hot100 order by chart_week;
create index hot100_weeks_chart_week on hot100_weeks(chart_week);

create table performers(
    id integer primary key autoincrement,
    name text not null unique
);
insert into performers(name) select performer from hot100_performers group by 1;
create virtual table performers_search using fts5(name, content=performers, content_rowid=id);
insert into performers_search(rowid, name) select id, name from performers;

vacuum;