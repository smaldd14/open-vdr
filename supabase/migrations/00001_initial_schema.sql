-- ============================================================
-- Open VDR: Initial Schema
-- ============================================================

-- Enums
create type user_role as enum ('admin', 'viewer');
create type invitation_status as enum ('pending', 'accepted', 'expired');

-- updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- Tables
-- ============================================================

-- Public users table synced from auth.users
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create table data_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_url text,
  primary_color text,
  company_name text,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table data_room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references data_rooms(id) on delete cascade,
  user_id uuid not null references users(id),
  role user_role not null,
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create table folders (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references data_rooms(id) on delete cascade,
  parent_id uuid references folders(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references data_rooms(id) on delete cascade,
  folder_id uuid references folders(id) on delete cascade,
  name text not null,
  file_size bigint not null,
  content_type text not null,
  r2_key text not null,
  uploaded_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references data_rooms(id) on delete cascade,
  email text not null,
  role user_role not null,
  invited_by uuid not null references users(id),
  status invitation_status not null default 'pending',
  token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (room_id, email)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references data_rooms(id) on delete cascade,
  user_id uuid not null references users(id),
  action text not null,
  target_id uuid,
  target_name text,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Helper functions for RLS (after tables exist)
-- ============================================================

create or replace function is_room_member(rid uuid)
returns boolean as $$
  select exists (
    select 1 from data_room_members
    where room_id = rid and user_id = auth.uid()
  );
$$ language sql security definer stable;

create or replace function is_room_admin(rid uuid)
returns boolean as $$
  select exists (
    select 1 from data_room_members
    where room_id = rid and user_id = auth.uid() and role = 'admin'::user_role
  );
$$ language sql security definer stable;

-- ============================================================
-- Sync auth.users to public.users on signup
-- ============================================================

create or replace function sync_user_on_signup()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function sync_user_on_signup();

-- ============================================================
-- Indexes
-- ============================================================

create index idx_audit_logs_room_created on audit_logs (room_id, created_at desc);
create index idx_data_room_members_user on data_room_members (user_id);
create index idx_folders_room on folders (room_id);
create index idx_documents_room on documents (room_id);
create index idx_documents_folder on documents (folder_id);
create index idx_invitations_token on invitations (token);

-- ============================================================
-- updated_at triggers
-- ============================================================

create trigger set_data_rooms_updated_at
  before update on data_rooms
  for each row execute function update_updated_at();

create trigger set_folders_updated_at
  before update on folders
  for each row execute function update_updated_at();

create trigger set_documents_updated_at
  before update on documents
  for each row execute function update_updated_at();

-- ============================================================
-- Auto-create admin member when a room is created
-- ============================================================

create or replace function create_room_admin_member()
returns trigger as $$
begin
  -- Use SECURITY DEFINER to bypass RLS on data_room_members
  insert into data_room_members (room_id, user_id, role)
  values (new.id, new.created_by, 'admin'::user_role);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_room_created
  after insert on data_rooms
  for each row execute function create_room_admin_member();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table users enable row level security;
alter table data_rooms enable row level security;
alter table data_room_members enable row level security;
alter table folders enable row level security;
alter table documents enable row level security;
alter table invitations enable row level security;
alter table audit_logs enable row level security;

-- users policies
create policy "Users can view other users"
  on users for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on users for update
  using (id = auth.uid());

-- data_rooms policies
create policy "Members can view rooms"
  on data_rooms for select
  using (is_room_member(id));

create policy "Authenticated users can create rooms"
  on data_rooms for insert
  to authenticated
  with check (true);

create policy "Admins can update rooms"
  on data_rooms for update
  using (is_room_admin(id));

create policy "Admins can delete rooms"
  on data_rooms for delete
  using (is_room_admin(id));

-- data_room_members policies
create policy "Members can view room members"
  on data_room_members for select
  using (is_room_member(room_id));

create policy "Admins can add members"
  on data_room_members for insert
  with check (is_room_admin(room_id));

create policy "Admins can remove members"
  on data_room_members for delete
  using (is_room_admin(room_id));

-- folders policies
create policy "Members can view folders"
  on folders for select
  using (is_room_member(room_id));

create policy "Admins can create folders"
  on folders for insert
  with check (is_room_admin(room_id));

create policy "Admins can update folders"
  on folders for update
  using (is_room_admin(room_id));

create policy "Admins can delete folders"
  on folders for delete
  using (is_room_admin(room_id));

-- documents policies
create policy "Members can view documents"
  on documents for select
  using (is_room_member(room_id));

create policy "Admins can upload documents"
  on documents for insert
  with check (is_room_admin(room_id));

create policy "Admins can update documents"
  on documents for update
  using (is_room_admin(room_id));

create policy "Admins can delete documents"
  on documents for delete
  using (is_room_admin(room_id));

-- invitations policies
create policy "Admins can view invitations"
  on invitations for select
  using (is_room_admin(room_id));

create policy "Admins can create invitations"
  on invitations for insert
  with check (is_room_admin(room_id));

create policy "Admins can delete invitations"
  on invitations for delete
  using (is_room_admin(room_id));

-- audit_logs policies
create policy "Members can view audit logs"
  on audit_logs for select
  using (is_room_admin(room_id));
-- No insert policy for audit_logs - service role only
