/* Documents 페이지: JSON에 등록된 서류 목록 생성 */
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  loadDocuments();
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
async function loadDocuments() {
  const list = document.getElementById("document-list");
  try {
    const response = await fetch("data/documents.json");
    if (!response.ok) throw new Error("서류 목록을 불러오지 못했습니다.");
    const documents = await response.json();
    list.innerHTML = documents
      .map(
        (doc, index) => `
      <article class="document-row">
        <span class="document-number">0${index + 1}</span>
        <div class="document-info"><h3>${escapeHTML(doc.title)}</h3></div>
        <div class="document-meta"><span>${escapeHTML(doc.format || "PDF")}</span><small>UPDATED ${escapeHTML(doc.updated || "—")}</small></div>
        <a class="download-link" href="${escapeHTML(encodeURI(doc.file))}" download="${escapeHTML(doc.file.split("/").pop())}" aria-label="${escapeHTML(doc.title)} 다운로드">DOWNLOAD <span>↓</span></a>
      </article>`,
      )
      .join("");
  } catch (error) {
    list.innerHTML = `<p class="error-state">${escapeHTML(error.message)} Live Server로 실행해 주세요.</p>`;
  }
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
