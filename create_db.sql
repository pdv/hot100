pragma page_size = 4096;

create table hot100_performers as select * from hot100 order by performer;
create index hot100_performers_performer on hot100_performers(performer);

create table hot100_weeks as select * from hot100 order by chart_week;
create index hot100_weeks_chart_week on hot100_weeks(chart_week);

vacuum;