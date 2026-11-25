/* 메인 페이지: JSON 데이터 로드 및 아코디언 카드 생성 */
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  loadClubs();
});

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const opened = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!opened));
    nav.classList.toggle("is-open", !opened);
  });
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }),
  );
}

async function loadClubs() {
  const container = document.getElementById("club-accordion");
  // 학회 목록 영역이 주석 처리되어 있으면(학회 미개설 기간) 아무것도 하지 않습니다.
  if (!container) return;
  try {
    const response = await fetch("data/clubs.json");
    if (!response.ok) throw new Error("학회 데이터를 불러오지 못했습니다.");
    const clubs = await response.json();
    document.getElementById("club-count").textContent =
      `${clubs.length} COLLECTIONS`;
    renderClubs(clubs, container);
  } catch (error) {
    container.innerHTML = `<p class="error-state">${error.message}<br>Live Server로 실행 중인지 확인해 주세요.</p>`;
  }
}

const MAX_CARDS = 3; // 메인에 보여줄 카드 수

function renderClubs(clubs, container) {
  container.innerHTML = "";
  const cards = clubs.map((club, index) => {
    const card = document.createElement("article");
    card.className = `accordion-card ${index === 0 ? "is-active" : ""}`;
    card.style.setProperty("--card-image", `url("${club.image}")`);
    card.dataset.clubId = club.id;
    const statusClass =
      club.statusKey === "active" ? "status-active" : "status-upcoming";
    card.innerHTML = `
      <a class="accordion-card-link" href="club-detail.html?id=${encodeURIComponent(club.id)}" aria-label="${escapeHTML(club.name)} 상세 페이지">
        <div class="card-image"></div>
        <div class="card-shade"></div>
        <div class="card-vertical"><span>0${index + 1}</span><span>${escapeHTML(club.name)}</span></div>
        <div class="card-content">
          <span class="card-category">${escapeHTML(club.category || "COMING SOON")}</span>
          <h3>${escapeHTML(club.name)}</h3>
          <p>${escapeHTML(club.description)}</p>
          <div class="card-bottom"><span class="status ${statusClass}">${escapeHTML(club.status)}</span><span class="card-open">VIEW ARCHIVE ↗</span></div>
        </div>
      </a>`;
    return card;
  });
  // 카드는 총 3장만 보여줍니다. 학회가 3개보다 적으면 남은 자리를 Coming Soon 카드로 채웁니다.
  cards.splice(MAX_CARDS);
  for (let n = cards.length + 1; n <= MAX_CARDS; n++) {
    const card = document.createElement("article");
    card.className = "accordion-card coming-card";
    card.innerHTML = `<div class="coming-inner"><span class="coming-number">${String(n).padStart(2, "0")}</span><span class="coming-plus">＋</span><div><p>NEW COLLECTION</p><h3>Coming<br>Soon<span>.</span></h3><small>새로운 학회가 준비 중입니다.</small></div></div>`;
    cards.push(card);
  }
  cards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => activateCard(card, cards));
    card.addEventListener("focusin", () => activateCard(card, cards));
    container.appendChild(card);
  });
}
function activateCard(active, cards) {
  if (window.matchMedia("(max-width: 700px)").matches) return;
  cards.forEach((card) => card.classList.toggle("is-active", card === active));
}
function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}
