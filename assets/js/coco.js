/* Coco sur l'eau : comptes à rebours, mini-cartes, likes & commentaires */
(function () {
  "use strict";
  var EN = document.documentElement.lang.indexOf("en") === 0;
  var T = EN
    ? { etape: "Leg", milles: "miles", total: "Total", indicatif: "(indicative route, not the actual track)", envoi: "Sending…", merci: "Thanks! ⛵", oups: "Oops, sending failed. Please try again in a moment." }
    : { etape: "Étape", milles: "milles", total: "Total", indicatif: "(tracé indicatif, pas la route réelle)", envoi: "Envoi…", merci: "Merci ! ⛵", oups: "Oups, l'envoi a échoué. Réessaie dans un instant." };

  /* ---------- Langue : on retient le choix du visiteur ---------- */
  document.querySelectorAll(".langue").forEach(function (lien) {
    lien.addEventListener("click", function () {
      try { localStorage.setItem("coco-lang", lien.getAttribute("hreflang")); } catch (e) {}
    });
  });

  /* ---------- Liens externes : nouvel onglet ---------- */
  document.addEventListener("click", function (e) {
    var lien = e.target.closest && e.target.closest("a[href]");
    if (lien && lien.host && lien.host !== location.host) {
      lien.target = "_blank";
      lien.rel = "noopener";
    }
  });

  /* ---------- Comptes à rebours ---------- */
  document.querySelectorAll(".countdown").forEach(function (el) {
    var cible = new Date(el.dataset.cible).getTime();
    var cases = {};
    el.querySelectorAll("[data-u]").forEach(function (b) { cases[b.dataset.u] = b; });
    function tick() {
      var s = Math.max(0, Math.floor((cible - Date.now()) / 1000));
      cases.j.textContent = Math.floor(s / 86400);
      cases.h.textContent = String(Math.floor(s / 3600) % 24).padStart(2, "0");
      cases.m.textContent = String(Math.floor(s / 60) % 60).padStart(2, "0");
      cases.s.textContent = String(s % 60).padStart(2, "0");
      if (s === 0) {
        el.querySelector(".countdown__cases").hidden = true;
        el.querySelector(".countdown__fini").hidden = false;
        return;
      }
      setTimeout(tick, 1000);
    }
    tick();
  });

  /* ---------- Mini-cartes ---------- */
  function milles(a, b) {
    var r = Math.PI / 180, R = 3440.065; // rayon terrestre en milles nautiques
    var dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    var h = Math.pow(Math.sin(dLat / 2), 2) +
      Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.pow(Math.sin(dLon / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  var fmt = new Intl.NumberFormat(EN ? "en-GB" : "fr-FR", { maximumFractionDigits: 0 });
  var couleurs = { depart: "#e8412c", escale: "#f2a007", arrivee: "#0b6e4f", base: "#0b3c5d" };

  if (window.L) document.querySelectorAll(".carte__map").forEach(function (el) {
    var points = JSON.parse(el.dataset.points || "[]");
    if (!points.length) return;
    var map = L.map(el, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(map);
    if (el.dataset.seamarks) {
      L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openseamap.org">OpenSeaMap</a>'
      }).addTo(map);
    }

    var latlngs = points.map(function (p) { return [p.lat, p.lon]; });
    var trace = points.some(function (p) { return p.type === "depart"; });
    if (trace) L.polyline(latlngs, { color: "#0b3c5d", weight: 3, dashArray: "6 6" }).addTo(map);

    points.forEach(function (p) {
      if (!p.nom) return;
      L.circleMarker([p.lat, p.lon], {
        radius: 8, weight: 3, color: "#fff", fillColor: couleurs[p.type] || couleurs.base, fillOpacity: 1
      }).addTo(map).bindTooltip(p.nom, { permanent: true, direction: "right", className: "carte__etiquette" });
    });
    map.fitBounds(L.latLngBounds(latlngs).pad(0.15));

    // Distances par étape (une étape se termine à chaque escale ou à l'arrivée)
    if (!trace) return;
    var etapes = [], acc = 0, debut = points[0];
    for (var i = 1; i < points.length; i++) {
      acc += milles(points[i - 1], points[i]);
      if (points[i].type === "escale" || points[i].type === "arrivee") {
        etapes.push({ de: debut.nom, a: points[i].nom, d: acc });
        debut = points[i]; acc = 0;
      }
    }
    var total = etapes.reduce(function (t, e) { return t + e.d; }, 0);
    var legende = el.parentNode.querySelector(".carte__legende");
    if (legende) {
      legende.textContent = (etapes.length > 1 ? etapes.map(function (e, n) {
        return T.etape + " " + (n + 1) + " : " + e.de + " → " + e.a + " ≈ " + fmt.format(e.d) + " " + T.milles;
      }).join(" · ") + " · " : "") + T.total + " ≈ " + fmt.format(total) + " " + T.milles + " " + T.indicatif;
    }
    document.querySelectorAll(".js-distance").forEach(function (d) { d.textContent = "≈ " + fmt.format(total) + " " + T.milles; });
  });

  /* ---------- J'aime & commentaires ---------- */
  function stock(k, v) {
    try {
      if (v === undefined) return JSON.parse(localStorage.getItem(k));
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }

  function apiSupabase(url, key) {
    function rest(chemin, opts) {
      opts = opts || {};
      opts.headers = Object.assign({ apikey: key, "Content-Type": "application/json" }, opts.headers);
      return fetch(url.replace(/\/$/, "") + "/rest/v1/" + chemin, opts).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.status === 204 ? null : r.json();
      });
    }
    return {
      likes: function (id) {
        return rest("likes?select=count&post_id=eq." + encodeURIComponent(id))
          .then(function (r) { return r.length ? r[0].count : 0; });
      },
      like: function (id, plus) {
        return rest("rpc/" + (plus ? "add_like" : "remove_like"), { method: "POST", body: JSON.stringify({ p_post: id }) });
      },
      commentaires: function (id) {
        return rest("comments?select=name,message,created_at&order=created_at.asc&post_id=eq." + encodeURIComponent(id));
      },
      commenter: function (id, name, message) {
        return rest("comments", {
          method: "POST", headers: { Prefer: "return=representation" },
          body: JSON.stringify({ post_id: id, name: name, message: message })
        }).then(function (r) { return r[0]; });
      }
    };
  }

  document.querySelectorAll(".soutien").forEach(function (el) {
    var id = el.dataset.id;
    var api = apiSupabase(el.dataset.url, el.dataset.key);
    var bouton = el.querySelector(".soutien__like");
    var nb = el.querySelector(".soutien__nb");
    var nbCom = el.querySelector(".soutien__nbcom");
    var liste = el.querySelector(".soutien__liste");
    var form = el.querySelector(".soutien__form");
    var statut = el.querySelector(".soutien__statut");
    var cleLike = "coco-like:" + id;

    function afficherLikes(n) {
      nb.textContent = n;
      var aime = !!stock(cleLike);
      bouton.setAttribute("aria-pressed", aime);
      bouton.classList.toggle("est-aime", aime);
    }

    function ajouterCommentaire(c) {
      var li = document.createElement("li");
      var tete = document.createElement("p");
      var nom = document.createElement("b");
      nom.textContent = c.name;
      var date = document.createElement("time");
      date.textContent = new Date(c.created_at).toLocaleDateString(EN ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
      tete.append(nom, " · ", date);
      var msg = document.createElement("p");
      msg.textContent = c.message;
      li.append(tete, msg);
      liste.append(li);
      nbCom.textContent = "(" + liste.children.length + ")";
    }

    api.likes(id).then(afficherLikes).catch(function () { afficherLikes(0); });
    api.commentaires(id).then(function (cs) { cs.forEach(ajouterCommentaire); }).catch(function () {});

    bouton.addEventListener("click", function () {
      var plus = !stock(cleLike);
      bouton.disabled = true;
      api.like(id, plus).then(function (n) {
        stock(cleLike, plus);
        afficherLikes(n);
      }).catch(function () {}).then(function () { bouton.disabled = false; });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.site.value) return; // piège à robots
      var name = form.nom.value.trim(), message = form.message.value.trim();
      if (!name || !message) return;
      form.querySelector("button").disabled = true;
      statut.textContent = T.envoi;
      api.commenter(id, name, message).then(function (c) {
        ajouterCommentaire(c);
        form.message.value = "";
        stock("coco-nom", name);
        statut.textContent = T.merci;
      }).catch(function () {
        statut.textContent = T.oups;
      }).then(function () { form.querySelector("button").disabled = false; });
    });
    var nomConnu = stock("coco-nom");
    if (nomConnu) form.nom.value = nomConnu;
  });
})();
