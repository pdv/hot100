pragma page_size = 4096;

create table hot100_peaks as
    select performer, title, min(current_week) as peak
    from hot100
    group by 1, 2
    order by 1;

create index hot100_peaks_performer on hot100_peaks(performer);

create table hot100_tracks as
    select performer, title, chart_week as week, current_week as position
    from hot100
    order by 1, 2, 3;
create index hot100_tracks_performer_title on hot100_tracks(performer, title);

create table hot100_weeks as
    select chart_week as week, current_week as position, performer, title
    from hot100
    order by 1, 2;
create index hot100_weeks_chart_week on hot100_weeks(week);

create table performers(
    id integer primary key autoincrement,
    name text not null unique
);
insert into performers(name) select performer from hot100_peaks group by 1;
create virtual table performers_search using fts5(name, content=performers, content_rowid=id);
insert into performers_search(rowid, name) select id, name from performers;

vacuum;