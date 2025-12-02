<template>
  <div class="longan-map-page bg-slate-50 text-slate-800 min-h-screen">
    <div class="max-w-7xl mx-auto p-4">
      <header class="mb-4">
        <h1 class="text-2xl font-semibold">Longan Map — แผนที่ลำไย</h1>
        <h2>นายกิตติคุณ กิจวิบูลย์สิน 6604101307</h2>
        <p class="text-sm text-slate-600">
          ใช้ Leaflet + OpenStreetMap + Nominatim (cache ใน localStorage)
        </p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Form -->
        <section class="col-span-1 bg-white p-4 rounded shadow">
          <h2 class="font-medium">เพิ่ม/แก้ไข จุด (Add New)</h2>
          <form id="placeForm" class="space-y-3 mt-3">
            <div>
              <label class="block text-sm">Province (จังหวัด)</label>
              <select
                id="province"
                class="mt-1 block w-full rounded border p-2"
              >
                <option value="เชียงใหม่">เชียงใหม่</option>
                <option value="เชียงราย">เชียงราย</option>
                <option value="ลำพูน">ลำพูน</option>
                <option value="ลำปาง">ลำปาง</option>
                <option value="แพร่">แพร่</option>
                <option value="น่าน">น่าน</option>
                <option value="พะเยา">พะเยา</option>
                <option value="แม่ฮ่องสอน">แม่ฮ่องสอน</option>
              </select>
            </div>

            <div>
              <label class="block text-sm">Place (สถานที่)</label>
              <input
                id="place"
                class="mt-1 block w-full rounded border p-2"
                placeholder="เช่น ตลาดสันทราย"
              />
            </div>

            <div>
              <label class="block text-sm">Price (บาท/กก.)</label>
              <input
                id="price"
                type="number"
                step="0.01"
                class="mt-1 block w-full rounded border p-2"
                placeholder="35.50"
              />
            </div>

            <div>
              <label class="block text-sm">Date (วันที่สำรวจ)</label>
              <input
                id="date"
                type="date"
                class="mt-1 block w-full rounded border p-2"
              />
            </div>

            <div class="flex items-center gap-2">
              <input type="checkbox" id="useCoords" />
              <label for="useCoords" class="text-sm"
                >กำหนดพิกัดเอง (ใช้ Latitude/Longitude)</label
              >
            </div>

            <div id="coordsInputs" class="hidden space-y-2">
              <div>
                <label class="block text-sm">Latitude</label>
                <input
                  id="lat"
                  type="number"
                  step="0.0001"
                  class="mt-1 block w-full rounded border p-2"
                  placeholder="18.8056"
                />
              </div>
              <div>
                <label class="block text-sm">Longitude</label>
                <input
                  id="lng"
                  type="number"
                  step="0.0001"
                  class="mt-1 block w-full rounded border p-2"
                  placeholder="99.0105"
                />
              </div>
            </div>

            <div class="flex gap-2">
              <button
                id="addBtn"
                class="px-4 py-2 bg-green-600 text-white rounded"
              >
                เพิ่มจุด (Add)
              </button>
              <button
                id="clearBtn"
                type="button"
                class="px-4 py-2 bg-gray-200 rounded"
              >
                ล้างฟอร์ม
              </button>
            </div>
          </form>

          <div class="mt-4 text-sm text-slate-600">
            <p>
              ตัวอย่าง: เลือกจังหวัด "เชียงใหม่" ระบบจะวางจุดที่ (18.7883,
              98.9853)
            </p>
            <p>คลิกที่ป็อปอัพเพื่อแก้ไขข้อมูลและบันทึก</p>
          </div>

          <hr class="my-4" />

          <div>
            <h3 class="font-medium">จัดการข้อมูลที่บันทึก</h3>
            <div class="mt-2 flex gap-2">
              <button id="exportBtn" class="px-3 py-1 border rounded">
                Export JSON
              </button>
              <button id="importBtn" class="px-3 py-1 border rounded">
                Import JSON
              </button>
              <button
                id="clearAllBtn"
                class="px-3 py-1 border rounded text-red-600"
              >
                ลบทั้งหมด
              </button>
            </div>
            <input
              id="importFile"
              type="file"
              accept="application/json"
              class="hidden"
            />
          </div>
        </section>

        <!-- Map -->
        <section class="lg:col-span-2 bg-white p-2 rounded shadow">
          <div id="map"></div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";

let map = null;
let markersGroup = null;
let markersData = [];
let geoCache = {};

const DEFAULT_CENTER = [18.5, 99.0];
const DEFAULT_ZOOM = 8;
const STORAGE_KEY = "longan_map_markers_v1";
const GEOCACHE_KEY = "longan_geocache_v1";

onMounted(() => {
  loadDependencies().then(() => {
    initMap();
  });
});

function loadDependencies() {
  return new Promise((resolve) => {
    let loaded = 0;
    const total = 2; // Tailwind + Leaflet JS (CSS is sync-ish but we wait for JS)

    // Load Tailwind
    if (!document.getElementById("tailwind-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-script";
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
        loaded++;
        if (loaded === total) resolve();
      };
      document.head.appendChild(script);
    } else {
      loaded++;
    }

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        loaded++;
        if (loaded === total) resolve();
      };
      document.head.appendChild(script);
    } else {
      loaded++;
      if (loaded === total) resolve();
    }
  });
}

function initMap() {
  if (!window.L) return;

  // --- Helpers & config ---
  function greenPinDataURI() {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='48' viewBox='0 0 36 48'><path d='M18 0C11.2 0 6 5.2 6 12c0 9.6 12 24 12 24s12-14.4 12-24c0-6.8-5.2-12-12-12z' fill='%2334d399'/><circle cx='18' cy='12' r='5' fill='white'/></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  const greenIcon = L.icon({
    iconUrl: greenPinDataURI(),
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -46],
  });

  // --- Map init ---
  // Check if map is already initialized
  const mapContainer = document.getElementById("map");
  if (mapContainer && mapContainer._leaflet_id) {
    return; // Already initialized
  }

  map = L.map("map").setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // marker layer group
  markersGroup = L.layerGroup().addTo(map);

  // load cache & markers
  geoCache = JSON.parse(localStorage.getItem(GEOCACHE_KEY) || "{}");
  markersData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  // Initial markers if empty
  if (markersData.length === 0) {
    markersData.push({
      id: genId(),
      province: "เชียงใหม่",
      place: "เชียงใหม่",
      price: 35.5,
      date: "2023-08-15",
      lat: 18.7883,
      lng: 98.9853,
    });
    markersData.push({
      id: genId(),
      province: "เชียงใหม่",
      place: "ตลาดสันทราย",
      price: 35.5,
      date: "2023-08-15",
      lat: 18.8056,
      lng: 99.0105,
    });
    saveMarkers();
  }

  renderAllMarkers();

  // --- Form logic ---
  const form = document.getElementById("placeForm");
  const useCoords = document.getElementById("useCoords");
  const coordsInputs = document.getElementById("coordsInputs");
  const clearBtn = document.getElementById("clearBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  const clearAllBtn = document.getElementById("clearAllBtn");

  if (useCoords) {
    useCoords.addEventListener("change", () => {
      coordsInputs.classList.toggle("hidden", !useCoords.checked);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      form.reset();
      coordsInputs.classList.add("hidden");
    });
  }

  if (form) {
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const province = document.getElementById("province").value.trim();
      const place = document.getElementById("place").value.trim() || province;
      const price = parseFloat(
        document.getElementById("price").value || 0
      ).toFixed(2);
      const date = document.getElementById("date").value;

      let lat = null,
        lng = null;
      if (useCoords.checked) {
        lat = parseFloat(document.getElementById("lat").value);
        lng = parseFloat(document.getElementById("lng").value);
        if (isNaN(lat) || isNaN(lng)) {
          alert("กรุณากรอกพิกัดให้ถูกต้อง");
          return;
        }
      } else {
        const q = `${place}, ${province}, Thailand`;
        const r = await geocode(q);
        if (!r) {
          alert("ไม่พบพิกัดจากบริการ Geocoding (ลองกำหนดพิกัดเอง)");
          return;
        }
        lat = r.lat;
        lng = r.lon;
      }

      const m = {
        id: genId(),
        province,
        place,
        price: parseFloat(price),
        date: date,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      addMarkerToMap(m, true);
      fitToAllMarkers();
      form.reset();
      coordsInputs.classList.add("hidden");
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const dataStr = JSON.stringify(markersData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "longan_markers.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  if (importBtn) {
    importBtn.addEventListener("click", () => {
      importFile.click();
    });
  }

  if (importFile) {
    importFile.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (Array.isArray(data)) {
            for (const item of data) {
              item.id = item.id || genId();
              markersData.push(item);
            }
            saveMarkers();
            renderAllMarkers();
            alert("นำเข้าข้อมูลสำเร็จ");
          }
        } catch (err) {
          alert("ไฟล์ไม่ถูกต้อง");
        }
      };
      reader.readAsText(f);
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (!confirm("ต้องการลบข้อมูลทั้งหมดใน localStorage หรือไม่?")) return;
      markersData = [];
      saveMarkers();
      markersGroup.clearLayers();
      fitToAllMarkers();
    });
  }
}

function saveMarkers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(markersData));
}
function saveGeoCache() {
  localStorage.setItem(GEOCACHE_KEY, JSON.stringify(geoCache));
}

function fitToAllMarkers() {
  if (!markersGroup || markersGroup.getLayers().length === 0) {
    if (map) map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    return;
  }
  const bounds = markersGroup.getBounds();
  if (map) map.fitBounds(bounds.pad(0.15));
}

function renderAllMarkers() {
  if (!markersGroup) return;
  markersGroup.clearLayers();
  for (const m of markersData) {
    addMarkerToMap(m, false);
  }
  fitToAllMarkers();
}

function createPopupContent(m) {
  return `
    <div class="marker-popup">
      <div><strong>${escapeHtml(m.place)} - ${escapeHtml(
    m.province
  )}</strong></div>
      <div class="mt-2 text-sm">ราคา: <input type='number' step='0.01' id='p_price' value='${
        m.price
      }' /></div>
      <div class='mt-2 text-sm'>วันที่: <input type='date' id='p_date' value='${
        m.date || ""
      }' /></div>
      <div class='mt-2 text-sm'>พิกัด: ${m.lat.toFixed(6)}, ${m.lng.toFixed(
    6
  )}</div>
      <div class='mt-3 flex gap-2'>
        <button id='saveMarker' class='px-2 py-1 border rounded'>บันทึก</button>
        <button id='deleteMarker' class='px-2 py-1 border rounded text-red-600'>ลบ</button>
      </div>
    </div>
  `;
}

function escapeHtml(s) {
  return (s + "").replace(/[&<>"']/g, function (c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c];
  });
}

function addMarkerToMap(m, save = true) {
  if (!window.L) return;

  // Re-create icon here to be safe or use global
  const greenPinDataURI = () => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='48' viewBox='0 0 36 48'><path d='M18 0C11.2 0 6 5.2 6 12c0 9.6 12 24 12 24s12-14.4 12-24c0-6.8-5.2-12-12-12z' fill='%2334d399'/><circle cx='18' cy='12' r='5' fill='white'/></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  };
  const greenIcon = L.icon({
    iconUrl: greenPinDataURI(),
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -46],
  });

  const marker = L.marker([m.lat, m.lng], {
    icon: greenIcon,
    draggable: false,
  });
  marker.bindPopup(createPopupContent(m), { maxWidth: 300 });
  marker.on("popupopen", function (e) {
    const container = e.popup._contentNode;
    const saveBtn = container.querySelector("#saveMarker");
    const delBtn = container.querySelector("#deleteMarker");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const newPrice = parseFloat(
          container.querySelector("#p_price").value || 0
        ).toFixed(2);
        const newDate = container.querySelector("#p_date").value;
        const idx = markersData.findIndex((x) => x.id === m.id);
        if (idx >= 0) {
          markersData[idx].price = parseFloat(newPrice);
          markersData[idx].date = newDate;
          saveMarkers();
          marker.setPopupContent(createPopupContent(markersData[idx]));
          marker.openPopup();
        }
      });
    }
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        if (!confirm("ต้องการลบจุดนี้หรือไม่?")) return;
        const idx = markersData.findIndex((x) => x.id === m.id);
        if (idx >= 0) {
          markersData.splice(idx, 1);
          saveMarkers();
        }
        markersGroup.removeLayer(marker);
        fitToAllMarkers();
      });
    }
  });
  marker.addTo(markersGroup);
  if (save) {
    markersData.push(m);
    saveMarkers();
  }
}

function genId() {
  return "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

async function geocode(query) {
  if (!query) return null;
  if (geoCache[query]) return geoCache[query];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1&countrycodes=th`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", Referer: location.origin },
    });
    const j = await res.json();
    if (j && j.length > 0) {
      const lat = parseFloat(j[0].lat);
      const lon = parseFloat(j[0].lon);
      geoCache[query] = { lat, lon };
      saveGeoCache();
      return geoCache[query];
    }
  } catch (e) {
    console.warn("geocode error", e);
  }
  return null;
}
</script>

<style scoped>
/* map must have explicit height */
#map {
  height: 72vh;
  min-height: 480px;
}
.marker-popup input {
  width: 100%;
}
</style>
