# coco-sur-leau
Following my adventures on a Mini 6.50, a 6.5-metre offshore racing sailboat.

## Run locally

With Docker (no Ruby install needed):

```sh
docker run --rm -e BUNDLE_PATH=vendor/bundle -p 4000:4000 -v "$PWD":/srv -w /srv \
  mcr.microsoft.com/devcontainers/jekyll:latest \
  bash -lc 'bundle install && bundle exec jekyll serve --host 0.0.0.0 --drafts --force_polling'
```

Then open <http://localhost:4000/coco-sur-leau/>. `--drafts` also shows the drafts in `_drafts/`.

### Without Docker (with Ruby installed)

Once, install a recent Ruby (the one shipped with macOS, 2.6, is too old):

```sh
sudo xcodebuild -license accept      # required for Homebrew
brew install ruby
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
ruby -v                              # should print 3.x
```

Then, in the site folder:

```sh
bundle install                       # once, then after each Gemfile change
bundle exec jekyll serve --drafts --livereload
```

Open <http://localhost:4000/coco-sur-leau/> (the page reloads on every change, `Ctrl+C` to stop). Docker and Ruby both use port 4000: run only one at a time.

## Where to write what

Every piece of content exists in French and English. Both versions share the same `ref:` (that's what links the FR/EN button and the comments).

| What | Where |
| --- | --- |
| A logbook post | `_posts/YYYY-MM-DD-titre.md` (FR) and `en/_posts/YYYY-MM-DD-title.md` (EN), photos in `assets/images/posts/…`. Add `epingle: 1` to pin it or `explicatif: 1` to file it under "Explainer posts" |
| A draft | `_drafts/` and `en/_drafts/` (only visible with `--drafts`) |
| A short news item (no full post) | `_data/news.yml` (`fr` and `en` fields) |
| A race | dates, distance, map, live tracking: `_data/courses.yml`; text, places, rules: `_courses/<ref>.md` and `_courses/en/<ref>.md` (template: `mini-transat-2027`) |
| Classe Mini ranking and qualification | `_data/classement.yml` |
| Training bases (map) | `_data/entrainements.yml` |
| Interface text (menus, buttons…) | `_data/i18n.yml` and `_data/navigation.yml` |
| Likes & comments | see `COMMENTAIRES.md` (in French) |
