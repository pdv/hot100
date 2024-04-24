pragma page_size = 4096;

create virtual table hot100_peaks using fts5(performer, title, peak);
insert into hot100_peaks
    select performer, title, min(current_week) as peak
    from hot100
    group by 1, 2
    order by 1;

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

vacuum;