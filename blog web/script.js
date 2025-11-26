import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://YOUR-PROJECT.supabase.co",
  "YOUR_PUBLIC_ANON_KEY"
);

const state = { articles: [], activeTag: null, query: "" };

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  await loadArticles();
  mountTags();
  setupHandlers();
  restoreTheme();
  updateAuthUI();
});

// Load posts from Supabase
async function loadArticles() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("inserted_at", { ascending: false });

  if (error) console.error(error);
  state.articles = data || [];
  mountArticles();
}

// Tags
function uniqueTags() {
  return Array.from(new Set(state.articles.map(a => a.tag))).sort();
}

function mountTags() {
  const tagNav = document.getElementById("tagNav");
  const chips = document.getElementById("popularTags");
  tagNav.innerHTML = "";
  chips.innerHTML = "";

  const tags = uniqueTags();
  const allBtn = makeTagButton("all", true);
  tagNav.appendChild(allBtn);

  tags.forEach(t => tagNav.appendChild(makeTagButton(t)));
  tags.slice(0, 6).forEach(t => {
    const btn = document.createElement("button");
    btn.textContent = "#" + t;
    btn.onclick = () => setActiveTag(t);
    chips.appendChild(btn);
  });
}

function makeTagButton(tag, active = false) {
  const btn = document.createElement("button");
  btn.textContent = tag === "all" ? "All" : `#${tag}`;
  if (active) btn.classList.add("active");
  btn.onclick = () => {
    setActiveTag(tag === "all" ? null : tag);
    document.querySelectorAll(".tag-nav button").forEach(b =>
      b.classList.remove("active")
    );
    btn.classList.add("active");
  };
  return btn;
}

function setActiveTag(tag) {
  state.activeTag = tag;
  mountArticles();
}

// Feed
function mountArticles() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  const list = filterArticles();
  if (!list.length) {
    feed.innerHTML = `<div style="grid-column:1/-1;padding:28px;border-radius:12px;background:var(--card);color:var(--muted)">No results found.</div>`;
    return;
  }
  list.forEach(a => {
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="meta">${new Date(a.inserted_at).toLocaleDateString()} • <span class="tag">#${a.tag}</span></div>
      <h3>${a.title}</h3>
      <p>${a.content.substring(0, 140)}...</p>
      <div class="card-footer">
        <div class="author muted">By ${a.author_id}</div>
        <div>
          <button class="read-small" data-id="${a.id}">Read</button>
        </div>
      </div>
    `;
    el.querySelector(".read-small").addEventListener("click", openReader);
    feed.appendChild(el);
  });
}

function filterArticles() {
  const q = state.query.trim().toLowerCase();
  return state.articles.filter(a => {
    const matchesTag = state.activeTag ? a.tag === state.activeTag : true;
    const matchesQuery = q
      ? (a.title + " " + a.content + " " + a.tag).toLowerCase().includes(q)
      : true;
    return matchesTag && matchesQuery;
  });
}

// Handlers
function setupHandlers() {
  document.getElementById("searchInput").addEventListener("input", e => {
    state.query = e.target.value;
    mountArticles();
  });
  document.getElementById("clearSearch").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    state.query = "";
    mountArticles();
  });

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  document.querySelectorAll(".read-btn").forEach(b =>
    b.addEventListener("click", e => {
      e.preventDefault();
      openReaderById(b.dataset.id);
    })
  );

  document.getElementById("closeReader").addEventListener("click", closeReader);

  document.getElementById("homeLink").addEventListener("click", e => {
    e.preventDefault();
    state.activeTag = null;
    state.query = "";
    document.getElementById("searchInput").value = "";
    mountArticles();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "k" && (e.ctrlKey || e.metaKey))
      document.getElementById("searchInput").focus();
    if (e.key === "Escape") closeReader();
  });
}

// Reader modal
function openReader(e) {
  const id = e.currentTarget.dataset.id;
  openReaderById(id);
}

function openReaderById(id) {
  const article = state.articles.find(a => a.id === id);
  if (!article) return;
  const modal = document.getElementById("readerModal");
  const content = document.getElementById("readerContent");
  content.innerHTML = `
    <div class="meta">${new Date(article.inserted_at).toLocaleDateString()} • #${article.tag} • By ${article.author_id}</div>
    <p>${article.content}</p>
    <hr/>
    <p class="muted">Thanks for reading!</p>
  `;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeReader() {
  const modal = document.getElementById("readerModal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Theme
function toggleTheme() {
  const root = document.documentElement;
  const isLight = root.classList.toggle("light");
  localStorage.setItem("argent-theme", isLight ? "light" : "dark");
}

function restoreTheme() {
  const t = localStorage.getItem("argent-theme");
  if (t === "light") document.documentElement.classList.add("light");
}

// Auth UI
async function updateAuthUI() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const composeBtn = document.getElementById("composeBtn");

  if (session) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    composeBtn.style.display = "inline-block";
  } else {
    logoutBtn.style.display = "none";
    composeBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
  }

  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.reload();
  });
}
