# coco-sur-leau
Suivi de mes aventures en Mini 6,50, voilier de course au large de 6,50 metres de long.

## Lancer en local

Avec Docker (aucune installation de Ruby nécessaire) :

```sh
docker run --rm -e BUNDLE_PATH=vendor/bundle -p 4000:4000 -v "$PWD":/srv -w /srv \
  mcr.microsoft.com/devcontainers/jekyll:latest \
  bash -lc 'bundle install && bundle exec jekyll serve --host 0.0.0.0 --drafts --force_polling'
```

Puis ouvrir <http://localhost:4000/coco-sur-leau/>. `--drafts` affiche aussi les brouillons de `_drafts/`.

## Où écrire quoi

| Quoi | Où |
| --- | --- |
| Un article du journal | `_posts/AAAA-MM-JJ-titre.md` (photos dans `assets/images/posts/…`) |
| Une brève (petite news sans article) | `_data/news.yml` |
| Une course (fiche, carte, compte à rebours, règles, lien du suivi en direct) | `_courses/nom-de-la-course.md` (modèle : `mini-transat-2027.md`) |
| Le classement Classe Mini et la qualification | `_data/classement.yml` |
| Les bases d'entraînement (carte) | `_data/entrainements.yml` |
| J'aime & commentaires | voir `COMMENTAIRES.md` |
