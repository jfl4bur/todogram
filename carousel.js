const API_URL = "https://jfl4bur.github.io/Todogram/data.json"; // Cambia esta URL si hace falta

const carousel = document.getElementById("carousel");
const modal = document.getElementById("modal");

function renderItems(items) {
  items.forEach(item => {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <img src="${item.Carteles[0].external.url}" alt="${item.Título}" />
      <div class="info-hover">
        <strong>${item.Título}</strong><br />
        ${item.Géneros || ""}
        <p>${item.Synopsis && item.Synopsis.length > 70 ? item.Synopsis.slice(0, 70) + "..." : ""}</p>
      </div>
    `;
    el.addEventListener("click", () => openModal(item));
    carousel.appendChild(el);
  });
}

function openModal(item) {
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <h2>${item.Título} (${item.Año || ""})</h2>
      <p><strong>Géneros:</strong> ${item.Géneros || "No disponible"}</p>
      <p>${item.Synopsis || "Sin sinopsis"}</p>
      <a href="${item["Ver Película"] || "#"}" target="_blank" style="color: #0af;">Ver película</a>
    </div>
  `;
  modal.classList.remove("hidden");

  modal.querySelector(".modal-close").onclick = () => {
    modal.classList.add("hidden");
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  };
}

fetch(API_URL)
  .then(res => res.json())
  .then(data => renderItems(data))
  .catch(err => console.error("Error cargando datos:", err));
