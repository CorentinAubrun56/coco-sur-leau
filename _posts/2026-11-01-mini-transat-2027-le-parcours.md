---
epingle: 2
ref: parcours-mini-transat
title: "Mini Transat 2027 : le parcours"
date: 2026-11-01 00:30:00 +0100
excerpt: "La Rochelle, Las Palmas, Salvador de Bahia : le parcours de la course qui me fait rêver, et le compte à rebours qui va avec."
header:
  teaser: /assets/images/posts/mini-transat-2027/parcours-mini-transat-2027.jpg
tags: [mini-transat]
---
{%- assign d = site.data.courses | where: "ref", "mini-transat-2027" | first -%}

Le 12 septembre 2027, la Mini Transat s'élance de La Rochelle. Si je suis qualifié, j'y serai avec Big Bounce ! Voilà à quoi ressemble le parcours.

{% include countdown.html cible=d.depart titre="Avant le départ de la Mini Transat" %}

{% include course-map.html points=d.parcours %}

## Étape 1 : La Rochelle → Las Palmas de Gran Canaria 🇫🇷 → 🇮🇨

Départ de La Rochelle, traversée du golfe de Gascogne, puis descente le long des côtes espagnoles et portugaises jusqu'aux Canaries. Une escale à Las Palmas pour réparer, dormir et se préparer à la suite.

## Étape 2 : Las Palmas → Salvador de Bahia 🇮🇨 → 🇧🇷

La grande traversée de l'Atlantique, l'équateur et le Pot-au-Noir, jusqu'à Salvador de Bahia au Brésil. En solitaire et sans aucun moyen de communication avec la terre.

Toutes les infos (fiche de course, règles, suivi en direct le jour J) sont sur la [page de la course]({{ '/courses/mini-transat-2027/' | relative_url }}).
