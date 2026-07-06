// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// Scroll reveal for sections
const revealTargets = document.querySelectorAll(
  ".about-grid, .skills-grid, .timeline, .projects-grid, .stats-grid, .services-grid, .edu-grid, .interests, .blog-grid, .contact-grid",
);
revealTargets.forEach((el) => el.classList.add("fade-in-up"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);

revealTargets.forEach((el) => observer.observe(el));

// Animated stat counters
const statNums = document.querySelectorAll(".stat-num");
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.5 },
);

statNums.forEach((el) => statObserver.observe(el));

// Medium blog feed
const MEDIUM_FEED_URL = "https://medium.com/feed/@mi.shovon23";
const RSS2JSON_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=" +
  encodeURIComponent(MEDIUM_FEED_URL);
const POST_COUNT = 3;
const EXCERPT_LENGTH = 140;

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("figure, figcaption").forEach((el) => el.remove());
  return doc.body.textContent || "";
}

function truncate(text, maxLength) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderBlogPosts(items) {
  const blogGrid = document.getElementById("blogGrid");
  blogGrid.innerHTML = "";

  items.slice(0, POST_COUNT).forEach((item) => {
    const card = document.createElement("a");
    card.className = "blog-card";
    card.href = item.link;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const date = document.createElement("p");
    date.className = "blog-date";
    date.textContent = formatDate(item.pubDate);

    const title = document.createElement("h3");
    title.textContent = item.title;

    const excerpt = document.createElement("p");
    excerpt.className = "blog-excerpt";
    excerpt.textContent = truncate(
      htmlToText(item.description || ""),
      EXCERPT_LENGTH,
    );

    const readMore = document.createElement("span");
    readMore.className = "blog-read-more";
    readMore.textContent = "Read on Medium ↗";

    card.append(date, title, excerpt, readMore);
    blogGrid.appendChild(card);
  });
}

fetch(RSS2JSON_URL)
  .then((res) => res.json())
  .then((data) => {
    if (data.status !== "ok" || !data.items || !data.items.length) {
      throw new Error("Feed unavailable");
    }
    renderBlogPosts(data.items);
  })
  .catch(() => {
    const blogStatus = document.getElementById("blogStatus");
    if (blogStatus) {
      blogStatus.textContent =
        "Couldn't load latest posts — see them directly on Medium below.";
    }
  });
