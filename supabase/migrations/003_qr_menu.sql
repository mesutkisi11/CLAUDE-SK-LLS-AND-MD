-- QR Menu System

create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  restaurant_name text not null,
  description text,
  theme_color text default '#f59e0b',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid references menus(id) on delete cascade not null,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references menu_categories(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  is_available boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- RLS
alter table menus enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;

-- Owner policies
create policy "owner_menus" on menus for all using (auth.uid() = user_id);

create policy "owner_categories" on menu_categories for all using (
  exists (select 1 from menus where menus.id = menu_categories.menu_id and menus.user_id = auth.uid())
);

create policy "owner_items" on menu_items for all using (
  exists (
    select 1 from menu_categories mc
    join menus m on m.id = mc.menu_id
    where mc.id = menu_items.category_id and m.user_id = auth.uid()
  )
);

-- Public read policies
create policy "public_read_menus" on menus for select using (is_active = true);

create policy "public_read_categories" on menu_categories for select using (
  exists (select 1 from menus where menus.id = menu_categories.menu_id and menus.is_active = true)
);

create policy "public_read_items" on menu_items for select using (
  exists (
    select 1 from menu_categories mc
    join menus m on m.id = mc.menu_id
    where mc.id = menu_items.category_id and m.is_active = true
  )
);
