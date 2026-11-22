begin;

create table public."showers and supplies" (
    id uuid primary key default gen_random_uuid(),
    player_name text not null
        check (player_name = btrim(player_name) and char_length(player_name) between 1 and 20),
    score integer not null check (score > 0),
    created_at timestamptz not null default now()
);

create index showers_and_supplies_rank_idx
    on public."showers and supplies" (score desc, created_at asc, id asc);

alter table public."showers and supplies" enable row level security;

revoke all on table public."showers and supplies" from public, anon, authenticated;
grant select on table public."showers and supplies" to anon;
grant insert (id, player_name, score) on table public."showers and supplies" to anon;

create policy "Anyone can read the leaderboard"
    on public."showers and supplies" for select to anon using (true);

create policy "Anyone can submit a score"
    on public."showers and supplies" for insert to anon with check (true);

commit;
