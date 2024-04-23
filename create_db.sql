
pragma page_size = 4096;

create table hot100_search as select * from hot100 order by performer;
create index hot100_search_performer on hot100_search(performer);

vacuum;