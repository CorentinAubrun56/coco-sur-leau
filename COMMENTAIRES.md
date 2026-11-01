# Activer les « J'aime » et les commentaires

Le site est statique (GitHub Pages) : pour que les j'aime et les commentaires soient enregistrés
et visibles par tout le monde, il faut une petite base de données. On utilise **Supabase**
(offre gratuite largement suffisante). Les visiteurs n'ont pas besoin de compte.

Sans configuration, le bloc j'aime et commentaires n'est pas affiché.

## 1. Créer le projet

1. Créer un compte sur <https://supabase.com> puis un nouveau projet (région Europe).
2. Menu **SQL Editor** → coller et exécuter :

```sql
create table public.comments (
  id bigint generated always as identity primary key,
  post_id text not null,
  name text not null check (char_length(name) between 1 and 60),
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index on public.comments (post_id);

create table public.likes (
  post_id text primary key,
  count integer not null default 0 check (count >= 0)
);

alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- Tout le monde peut lire et commenter (pas de modification ni de suppression publique)
create policy "lecture commentaires" on public.comments for select using (true);
create policy "ajout commentaire" on public.comments for insert with check (true);
create policy "lecture likes" on public.likes for select using (true);

-- Les likes passent uniquement par ces deux fonctions
create function public.add_like(p_post text) returns integer
language sql security definer set search_path = public as $$
  insert into likes (post_id, count) values (p_post, 1)
  on conflict (post_id) do update set count = likes.count + 1
  returning count;
$$;

create function public.remove_like(p_post text) returns integer
language sql security definer set search_path = public as $$
  update likes set count = greatest(count - 1, 0) where post_id = p_post
  returning count;
$$;

grant execute on function public.add_like(text), public.remove_like(text) to anon;
```

## 2. Brancher le site

Dans Supabase : **Project Settings → API**, copier l'URL du projet et la clé publique
(`anon` / « publishable »). Puis dans `_config.yml` :

```yaml
commentaires:
  supabase_url: "https://xxxxxxxx.supabase.co"
  supabase_key: "la-cle-publique"
```

Cette clé est faite pour être publique : les règles ci-dessus limitent ce qu'elle permet.

## 3. Modérer

Pour supprimer un commentaire indésirable : Supabase → **Table Editor → comments** → supprimer la ligne.
