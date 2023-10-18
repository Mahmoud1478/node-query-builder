create table if not exists categories (
    id bigserial not null PRIMARY KEY,
    "name" varchar(255) unique not null ,
    parent_id bigint default null,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE set null
);

insert into categories (name,parent_id) values ('living room',null),('kitchen',null),('ovens', 2);
