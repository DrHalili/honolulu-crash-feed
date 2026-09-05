(() => {
  "use strict";

  const DATA_URL = "data/crashes.json";
  const feedEl = document.getElementById("feed");
  const statusEl = document.getElementById("status");
  const searchEl = document.getElementById("search");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let crashes = [];
  let activeFilter = "all";
  let query = "";

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function severityBadge(severity) {
    const map = {
      fatal: ["badge-fatal", "Fatal"],
      serious: ["badge-serious", "Serious"],
      traffic: ["badge-traffic", "Traffic"],
    };
    const [cls, label] = map[severity] || ["badge-traffic", escapeHtml(severity || "Update")];
    return `<span class="badge ${cls}">${label}</span>`;
  }

  function renderLinks(links, className = "") {
    if (!links || !links.length) return "";
    return links
      .map((link) => {
        const note = link.note ? ` <small>(${escapeHtml(link.note)})</small>` : "";
        return `<a class="${className}" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}${note}</a>`;
      })
      .join("");
  }

  function renderSources(sources) {
    if (!sources || !sources.length) return "";
    const text = sources
      .map((s) => {
        const credit = s.credit ? ` — ${escapeHtml(s.credit)}` : "";
        return `${escapeHtml(s.name)}${credit}`;
      })
      .join(" · ");
    return `<div class="sources"><strong>Credits:</strong> ${text}</div>`;
  }

  function renderCard(crash) {
    const news = crash.newsLinks?.length
      ? `<div class="link-group"><div class="link-label">News</div><div class="links">${renderLinks(crash.newsLinks)}</div></div>`
      : "";
    const ig = crash.instagramLinks?.length
      ? `<div class="link-group"><div class="link-label">Instagram</div><div class="links">${renderLinks(crash.instagramLinks, "ig")}</div></div>`
      : "";

    return `
      <article class="card" id="${escapeHtml(crash.id)}" data-severity="${escapeHtml(crash.severity)}">
        <div class="card-top">
          ${severityBadge(crash.severity)}
          <span style="font-size:0.8rem;color:var(--ink-soft)">${escapeHtml(crash.area || "")}</span>
        </div>
        <h2>${escapeHtml(crash.title)}</h2>
        <div class="meta-row">
          <span title="Crash time (Hawaii Standard Time)">📍 ${escapeHtml(crash.location)}</span>
          <span title="Crash time">🕐 Crash: ${escapeHtml(crash.crashTimeHst || crash.crashTime)}</span>
          <span title="Published">📰 Published: ${escapeHtml(crash.publishedAtHst || crash.publishedAt)}</span>
        </div>
        <p class="card-summary">${escapeHtml(crash.summary)}</p>
        ${news}
        ${ig}
        ${renderSources(crash.sources)}
      </article>
    `;
  }

  function matchesFilter(crash) {
    if (activeFilter === "all") return true;
    return (crash.severity || "").toLowerCase() === activeFilter;
  }

  function matchesQuery(crash) {
    if (!query) return true;
    const hay = [
      crash.title,
      crash.summary,
      crash.location,
      crash.area,
      ...(crash.tags || []),
      ...(crash.sources || []).map((s) => s.name),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(query);
  }

  function render() {
    if (!feedEl) return;
    const list = crashes.filter((c) => matchesFilter(c) && matchesQuery(c));
    if (statusEl) {
      statusEl.textContent = list.length
        ? `Showing ${list.length} of ${crashes.length} reports`
        : `No reports match your filters (${crashes.length} total)`;
    }
    if (!list.length) {
      feedEl.innerHTML = `<div class="empty">No crashes match. Try clearing search or filters.</div>`;
      return;
    }
    feedEl.innerHTML = list.map(renderCard).join("");
  }

  async function load() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      crashes = Array.isArray(data.crashes) ? data.crashes : [];
      // Newest published first
      crashes.sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")));
      if (statusEl) {
        const updated = data.updatedAt
          ? new Date(data.updatedAt).toLocaleString("en-US", {
              timeZone: "Pacific/Honolulu",
              dateStyle: "medium",
              timeStyle: "short",
            }) + " HST"
          : "—";
        statusEl.dataset.updated = updated;
      }
      render();
      if (statusEl && statusEl.dataset.updated) {
        statusEl.textContent += ` · Data updated ${statusEl.dataset.updated}`;
      }
    } catch (err) {
      console.error(err);
      if (feedEl) {
        feedEl.innerHTML = `<div class="empty">Could not load <code>data/crashes.json</code>. If opening as a local file, use a simple static server (see README) so fetch works.</div>`;
      }
      if (statusEl) statusEl.textContent = "Failed to load crash data.";
    }
  }

  if (searchEl) {
    searchEl.addEventListener("input", () => {
      query = searchEl.value.trim().toLowerCase();
      render();
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter || "all";
      render();
    });
  });

  // Subscribe form: placeholder Formspree — prevent real submit noise
  const form = document.getElementById("subscribe-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      if (form.getAttribute("action") === "#" || !form.getAttribute("action")) {
        e.preventDefault();
        const note = document.getElementById("subscribe-feedback");
        if (note) {
          note.textContent =
            "Formspree is not configured yet. Replace the form action with your Formspree endpoint, or subscribe via RSS for now.";
          note.classList.remove("hidden");
        }
      }
    });
  }

  load();
})();
