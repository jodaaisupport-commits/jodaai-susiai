-- Projects bound to the signed-in user. Keys and tokens stay in the browser.
-- user_id is text: Better Auth ids, and the preview fallback "dev-user".

create table if not exists studio_project (
  id text not null,
  user_id text not null,
  name text not null,
  updated_at bigint not null,
  payload jsonb not null,
  primary key (user_id, id)
);

create index if not exists studio_project_user_updated_idx
  on studio_project (user_id, updated_at desc);
