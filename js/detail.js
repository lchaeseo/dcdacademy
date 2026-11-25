/* 학회 상세 페이지: URL의 id에 해당하는 학회 및 활동 데이터 표시 */
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  loadClubDetail();
  setupDialog();
});
function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle"),
    nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const opened = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!opened));
    nav.classList.toggle("is-open", !opened);
  });
}
async function loadClubDetail() {
  const id = new URLSearchParams(location.search).get("id");
  const target = document.getElementById("club-detail-content");
  if (!id) {
    showDetailError(target, "주소에 학회 ID가 없습니다.");
    return;
  }
  try {
    const [clubsRes, activitiesRes] = await Promise.all([
      fetch("data/clubs.json"),
      fetch("data/activities.json"),
    ]);
    if (!clubsRes.ok || !activitiesRes.ok)
      throw new Error("데이터 파일을 불러오지 못했습니다.");
    const [clubs, activities] = await Promise.all([
      clubsRes.json(),
      activitiesRes.json(),
    ]);
    const club = clubs.find((item) => item.id === id);
    if (!club) {
      showDetailError(target, "해당 학회를 찾을 수 없습니다.");
      return;
    }
    document.title = `${club.name} — ACADEMIC ARCHIVE`;
    document.getElementById("crumb-name").textContent = club.name.toUpperCase();
    renderDetail(
      club,
      activities.filter((item) => item.clubId === id),
      target,
    );
  } catch (error) {
    showDetailError(target, `${error.message} Live Server로 실행해 주세요.`);
  }
}
function renderDetail(club, activities, target) {
  const statusClass =
    club.statusKey === "active"
      ? "status-active"
      : club.statusKey === "upcoming"
        ? "status-upcoming"
        : "status-preparing";
  // 실제 값이 있는 연락처만 표시합니다. ("추후 공개", "준비 중"은 숨김)
  const contacts = [
    ["학회장", club.president],
    ["부학회장", club.vicePresident],
    ["문의", club.contact],
    ["이메일", club.email],
  ].filter(
    ([, value]) => value && value !== "추후 공개" && !value.includes("준비 중"),
  );
  const contactHTML = contacts.length
    ? `<dl class="detail-info">${contacts.map(([label, value]) => `<dt>${label}</dt><dd>${escapeHTML(value)}</dd>`).join("")}</dl>`
    : `<p class="detail-note">운영진 및 연락처는 추후 공개됩니다.</p>`;
  target.innerHTML = `
    <section class="detail-hero">
      <div class="detail-hero-image" style="background-image:url('${escapeHTML(club.image)}')"></div>
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-title">
        <p>${escapeHTML(club.category || "STUDENT COMMUNITY")}</p>
        <h1>${escapeHTML(club.name)}</h1>
        <span class="status ${statusClass}">${escapeHTML(club.status)}</span>
      </div>
    </section>
    <section class="detail-intro two-column">
      <div><p class="eyebrow">01 / ABOUT</p><h2>About<br><em>the club.</em></h2></div>
      <div class="detail-copy">
        <p class="detail-lead">${escapeHTML(club.intro || club.description)}</p>
        ${club.vision ? `<p>${escapeHTML(club.vision)}</p>` : ""}
        <div class="activity-tags">${(club.activities || []).map((item) => `<span>${escapeHTML(item)}</span>`).join("")}</div>
        ${contactHTML}
      </div>
    </section>
    <section class="activity-archive">
      <div class="activity-heading"><div><p class="eyebrow">02 / RECORDS</p><h2>Activity<br><em>archive.</em></h2></div><p>${String(activities.length).padStart(2, "0")} RECORDS</p></div>
      <div class="activity-grid">${
        activities.length
          ? activities
              .map((item, i) => {
                const count = getImages(item).length;
                return `
        <button class="activity-card" type="button" data-activity-id="${escapeHTML(item.id)}">
          <span class="activity-thumb" style="background-image:url('${escapeHTML(getImages(item)[0])}')">
            <span class="activity-index">${String(i + 1).padStart(2, "0")}</span>
            ${count > 1 ? `<span class="photo-count">▦ ${count} PHOTOS</span>` : ""}
            <span class="activity-overlay">
              <span class="activity-card-meta">${formatDate(item.date)}</span>
              <strong>${escapeHTML(item.title)}</strong>
              <span class="activity-description">${escapeHTML(item.description)}</span>
            </span>
          </span>
        </button>`;
              })
              .join("")
          : `<p class="empty-state">아직 등록된 활동이 없습니다. 활동 데이터는 <code>data/activities.json</code>에서 추가할 수 있습니다.</p>`
      }</div>
    </section>
    <div class="detail-back"><a href="index.html#archive">← ALL CLUBS</a></div>`;
  target.querySelectorAll(".activity-card").forEach((button) =>
    button.addEventListener("click", () => {
      const activity = activities.find(
        (item) => item.id === button.dataset.activityId,
      );
      if (activity) openActivity(activity);
    }),
  );
}
// 활동의 사진 목록: images 배열이 있으면 사용하고, 없으면 image 한 장만 사용합니다.
function getImages(item) {
  const list =
    Array.isArray(item.images) && item.images.length
      ? item.images
      : [item.image];
  return list.filter(Boolean);
}
function setupDialog() {
  const dialog = document.getElementById("activity-dialog");
  document
    .querySelector(".dialog-close")
    ?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
function openActivity(item, startIndex = 0) {
  const dialog = document.getElementById("activity-dialog");
  const images = getImages(item);
  let current = Math.min(startIndex, images.length - 1);
  const content = document.getElementById("dialog-content");
  content.innerHTML = `
    <div class="dialog-gallery">
      <div class="dialog-image"></div>
      ${
        images.length > 1
          ? `
        <button class="gallery-nav prev" type="button" aria-label="이전 사진">‹</button>
        <button class="gallery-nav next" type="button" aria-label="다음 사진">›</button>
        <span class="gallery-counter"></span>`
          : ""
      }
    </div>
    ${images.length > 1 ? `<div class="dialog-thumbs">${images.map((src, i) => `<button type="button" data-index="${i}" style="background-image:url('${escapeHTML(src)}')" aria-label="${i + 1}번째 사진"></button>`).join("")}</div>` : ""}
    <p class="eyebrow">ACTIVITY RECORD / ${formatDate(item.date)}</p>
    <h2>${escapeHTML(item.title)}</h2><p class="dialog-description">${escapeHTML(item.description)}</p><div class="dialog-body">${escapeHTML(item.content || item.description)}</div>`;
  const show = (index) => {
    current = (index + images.length) % images.length;
    content.querySelector(".dialog-image").style.backgroundImage =
      `url('${images[current]}')`;
    const counter = content.querySelector(".gallery-counter");
    if (counter) counter.textContent = `${current + 1} / ${images.length}`;
    content
      .querySelectorAll(".dialog-thumbs button")
      .forEach((b, i) => b.classList.toggle("is-current", i === current));
  };
  content
    .querySelector(".prev")
    ?.addEventListener("click", () => show(current - 1));
  content
    .querySelector(".next")
    ?.addEventListener("click", () => show(current + 1));
  content
    .querySelectorAll(".dialog-thumbs button")
    .forEach((b) =>
      b.addEventListener("click", () => show(Number(b.dataset.index))),
    );
  show(current);
  dialog.showModal();
}
function showDetailError(target, message) {
  target.innerHTML = `<div class="error-panel"><h1>Archive not found.</h1><p>${escapeHTML(message)}</p><a class="text-link" href="index.html">메인으로 돌아가기 ↗</a></div>`;
}
function formatDate(value) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "DATE TBD";
}
function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}
