/**
 * Dropzone weather kiosk — METAR (AWC via same-origin proxy), forecast (Open-Meteo),
 * runway components, Alaska FD winds (ANC row for Mat-Su / Anchorage area).
 */
(function () {
  "use strict";

  var STORAGE_AIRPORT = "kw_v1_airport";
  var STORAGE_ROTATED = "kw_v1_rotated";
  var REFRESH_MS = 5 * 60 * 1000;

  /** Button id → METAR ICAO + display + coords + runways + FD row key */
  var AIRPORTS = {
    PAAQ: {
      metarId: "PAAQ",
      title: "PAAQ",
      footerLoc: "Palmer, AK",
      subtitle: "Palmer Municipal · Palmer, AK",
      lat: 61.5951,
      lon: -149.0917,
      elevFt: 242,
      runways: [
        { id: "16", hdg: 160 },
        { id: "34", hdg: 340 }
      ],
      runwayBlurb: "PAAQ Rwys 16/34 — 6000 ft",
      fdRow: "ANC"
    },
    PAWS: {
      metarId: "PAWS",
      title: "PAWS",
      footerLoc: "Wasilla, AK",
      subtitle: "Wasilla · Palmer, AK",
      lat: 61.5719,
      lon: -149.5401,
      elevFt: 354,
      runways: [
        { id: "4", hdg: 40 },
        { id: "22", hdg: 220 }
      ],
      runwayBlurb: "PAWS Rwys 4/22",
      fdRow: "ANC"
    },
    ANC: {
      metarId: "PANC",
      title: "ANC",
      footerLoc: "Anchorage, AK",
      subtitle: "Ted Stevens Anchorage Intl · Anchorage, AK",
      lat: 61.1743,
      lon: -149.9964,
      elevFt: 152,
      runways: [
        { id: "7L", hdg: 75 },
        { id: "25R", hdg: 255 }
      ],
      runwayBlurb: "PANC Rwys 7L / 25R (simplified)",
      fdRow: "ANC"
    }
  };

  var LEVELS_FT = [3000, 6000, 9000, 12000, 18000, 24000, 30000, 34000, 39000];

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$ (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function loadAirportKey() {
    var k = localStorage.getItem(STORAGE_AIRPORT);
    if (k && AIRPORTS[k]) return k;
    return "PAAQ";
  }

  function saveAirportKey(k) {
    if (AIRPORTS[k]) localStorage.setItem(STORAGE_AIRPORT, k);
  }

  function loadRotated() {
    return localStorage.getItem(STORAGE_ROTATED) === "1";
  }

  function saveRotated(on) {
    localStorage.setItem(STORAGE_ROTATED, on ? "1" : "0");
  }

  function hpaToInHg(hpa) {
    if (hpa == null || Number.isNaN(hpa)) return null;
    return hpa / 33.8639;
  }

  function cToF(c) {
    return (c * 9) / 5 + 32;
  }

  function rhFromDew(Tc, Tdc) {
    if (Tc == null || Tdc == null) return null;
    var es = 6.112 * Math.exp((17.67 * Tc) / (Tc + 243.5));
    var e = 6.112 * Math.exp((17.67 * Tdc) / (Tdc + 243.5));
    return Math.min(100, Math.max(0, Math.round((100 * e) / es)));
  }

  /** Rough density altitude (ft) from field elev, METAR temp °C, station hPa */
  function densityAltitudeFt(elevFt, tempC, altimHpa) {
    if (elevFt == null || tempC == null || altimHpa == null) return null;
    var isa = 15 - (elevFt / 1000) * 2;
    var pa = elevFt + (1013.25 - altimHpa) * 30; /* ~30 ft/hPa */
    return Math.round(pa + 120 * (tempC - isa));
  }

  function cardinalFrom(deg) {
    if (deg == null || Number.isNaN(deg)) return "";
    var d = ((Number(deg) % 360) + 360) % 360;
    var dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(d / 45) % 8];
  }

  function windComponents(windFromDeg, windKts, rwyHdg) {
    if (windKts == null || windFromDeg == null || rwyHdg == null) {
      return { hw: null, xw: null };
    }
    var rad = ((windFromDeg - rwyHdg) * Math.PI) / 180;
    var hw = windKts * Math.cos(rad);
    var xw = windKts * Math.sin(rad);
    return {
      hw: Math.round(hw),
      xw: Math.round(Math.abs(xw))
    };
  }

  function parseGustKts(raw) {
    if (!raw) return null;
    var m = String(raw).match(/\bG(\d{1,3})KT\b/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function skyPhrase(cover) {
    var c = (cover || "").toUpperCase();
    if (c === "CLR" || c === "SKC" || !c) return { short: c || "CLR", long: "Sky clear", ceil: "No ceilings" };
    if (c === "FEW") return { short: "FEW", long: "Few clouds", ceil: "See METAR" };
    if (c === "SCT") return { short: "SCT", long: "Scattered", ceil: "See METAR" };
    if (c === "BKN") return { short: "BKN", long: "Broken", ceil: "See METAR" };
    if (c === "OVC") return { short: "OVC", long: "Overcast", ceil: "See METAR" };
    return { short: c, long: c, ceil: "—" };
  }

  function formatVis(visib) {
    if (visib == null) return "—";
    var s = String(visib);
    if (s === "10+") return "10 SM";
    var n = parseFloat(s, 10);
    if (!Number.isNaN(n)) return n + " SM";
    return s;
  }

  function flightCatClass(cat) {
    var c = (cat || "UNK").toUpperCase();
    if (c === "VFR") return "kw-header__flight-cat--vfr";
    if (c === "MVFR") return "kw-header__flight-cat--mvfr";
    if (c === "IFR") return "kw-header__flight-cat--ifr";
    if (c === "LIFR") return "kw-header__flight-cat--lifr";
    return "kw-header__flight-cat--mvfr";
  }

  function parseFDToken(tok) {
    if (!tok || tok === "RMK") return null;
    if (tok === "9900") return { lv: true, dir: null, spd: 0, temp: null };
    var m = /^(\d{2})(\d{2})(-?\d+)$/.exec(tok);
    if (m) {
      var dir = parseInt(m[1], 10) * 10;
      var spd = parseInt(m[2], 10);
      var temp = parseInt(m[3], 10);
      return { lv: false, dir: dir, spd: spd, temp: temp };
    }
    if (/^\d{6}$/.test(tok)) {
      var dir6 = parseInt(tok.slice(0, 2), 10) * 10;
      var spd6 = parseInt(tok.slice(2, 4), 10);
      var temp6 = -parseInt(tok.slice(4, 6), 10);
      return { lv: false, dir: dir6, spd: spd6, temp: temp6 };
    }
    return { raw: tok };
  }

  function remarkForLevel(ft, cell) {
    if (!cell || cell.lv) return "Light / variable";
    if (cell.raw) return "—";
    var parts = [];
    if (ft <= 6000 && cell.spd >= 20) parts.push("Low-level shear");
    if (ft >= 12000 && ft < 24000 && cell.spd >= 35) parts.push("Mod turb possible");
    if (ft >= 24000 && cell.spd >= 70) parts.push("Jet / Mtn wave check");
    if (ft >= 34000) parts.push("Tropo region");
    if (cell.temp != null && cell.temp < -40 && ft >= 18000) parts.push("Cold / IMC risk aloft");
    return parts.length ? parts.join(" · ") : "—";
  }

  function parseWindsAloftText(text, rowKey) {
    var lines = String(text).split(/\r?\n/);
    var valid = "";
    var headerIdx = -1;
    for (var i = 0; i < lines.length; i++) {
      if (/^VALID\s+/i.test(lines[i])) valid = lines[i].trim();
      if (/^\s*FT\s+/i.test(lines[i]) || /^\s*FT\s+\d/.test(lines[i])) headerIdx = i;
    }
    var dataLine = null;
    for (var j = 0; j < lines.length; j++) {
      var L = lines[j];
      var mm = new RegExp("^" + rowKey + "\\s+").exec(L);
      if (mm) {
        dataLine = L;
        break;
      }
    }
    if (!dataLine) return { valid: valid, levels: [] };
    var tokens = dataLine.trim().split(/\s+/).slice(1);
    var levels = [];
    for (var k = 0; k < LEVELS_FT.length && k < tokens.length; k++) {
      var cell = parseFDToken(tokens[k]);
      levels.push({ ft: LEVELS_FT[k], cell: cell });
    }
    return { valid: valid, levels: levels };
  }

  function wmoDayLabel(code) {
    var c = Number(code);
    if (c === 0) return "Clear";
    if (c <= 3) return "Mostly clear";
    if (c <= 48) return "Fog / low vis";
    if (c <= 57) return "Drizzle";
    if (c <= 67) return "Rain";
    if (c <= 77) return "Snow";
    if (c <= 82) return "Showers";
    if (c <= 86) return "Snow showers";
    if (c <= 99) return "Thunder";
    return "Mixed";
  }

  function wmoIcon(code) {
    var c = Number(code);
    if (c === 0) return "☀";
    if (c <= 3) return "🌤";
    if (c <= 48) return "🌫";
    if (c <= 67) return "🌧";
    if (c <= 77) return "❄";
    if (c <= 99) return "⛈";
    return "☁";
  }

  function dayNameAnchorage(isoDate) {
    var d = new Date(isoDate + "T12:00:00");
    return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Anchorage" }).format(d).toUpperCase();
  }

  function buildOpenMeteoUrl(lat, lon) {
    var p = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      temperature_unit: "fahrenheit",
      timezone: "America/Anchorage",
      forecast_days: "5"
    });
    return "https://api.open-meteo.com/v1/forecast?" + p.toString();
  }

  function awcPath(pathAndQuery) {
    return "/kiosk-awc/" + pathAndQuery.replace(/^\//, "");
  }

  var state = {
    airportKey: loadAirportKey(),
    rotated: loadRotated()
  };

  function applyRotation() {
    document.documentElement.classList.toggle("kw--rotated", state.rotated);
    var rotBtn = $("#kw-rotate");
    if (rotBtn) rotBtn.setAttribute("aria-pressed", state.rotated ? "true" : "false");
  }

  function setAirportButtons() {
    $$(".kw-btn-airport").forEach(function (b) {
      var k = b.getAttribute("data-airport");
      b.classList.toggle("kw-btn--active", k === state.airportKey);
    });
  }

  function updateClock() {
    var now = new Date();
    var loc = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Anchorage",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(now);
    var z = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(now);
    var dateStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Anchorage",
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(now);
    var tLoc = $("#kw-time-local");
    var tZu = $("#kw-time-zulu");
    var tDate = $("#kw-time-date");
    if (tLoc) tLoc.textContent = loc.replace(/,/g, "");
    if (tZu) {
      var zh = parseInt(z.split(":")[0], 10);
      var zm = z.split(":")[1];
      var zs = z.split(":")[2];
      tZu.textContent = String(zh).padStart(2, "0") + ":" + zm + ":" + zs + "Z";
    }
    if (tDate) tDate.textContent = dateStr;

    var footZ = $("#kw-footer-z");
    if (footZ && tZu) footZ.textContent = tZu.textContent;
  }

  function renderMetar(ap, m) {
    $("#kw-header-id").textContent = ap.title;
    $("#kw-header-sub").textContent = ap.subtitle;
    var footId = $("#kw-footer-id");
    var footLoc = $("#kw-footer-loc");
    if (footId) footId.textContent = ap.title;
    if (footLoc) footLoc.textContent = ap.footerLoc || "";

    var cat = (m.fltCat || "UNK").toUpperCase();
    var fc = $("#kw-flight-cat");
    if (fc) {
      fc.textContent = cat === "UNK" ? "—" : cat;
      fc.className = "kw-header__flight-cat " + flightCatClass(cat);
    }
    var fbox = $(".kw-header__flight");
    if (fbox) {
      var dk = cat === "UNK" ? "unk" : cat.toLowerCase();
      fbox.setAttribute("data-flt", dk);
    }

    var raw = m.rawOb || "";
    $("#kw-metar-raw").textContent = raw;

    var obsZ = "";
    var obsM = raw.match(/\b(\d{6})Z\b/);
    if (obsM) obsZ = obsM[1].replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2:$3") + "Z";
    $("#kw-metar-obs").textContent = obsZ ? "OBS: " + obsZ : "";

    var wdir = m.wdir;
    var wspd = m.wspd;
    var windStr =
      wdir != null && wspd != null
        ? String(wdir).padStart(3, "0") + "° / " + wspd + " kt"
        : wspd != null
          ? wspd + " kt"
          : "—";
    var gust = parseGustKts(raw);
    var windSub =
      wdir != null
        ? cardinalFrom(wdir) + " · " + (gust != null ? "Gust " + gust + " kt" : "No gust in METAR")
        : "";

    $("#kw-wind-val").textContent = windStr;
    $("#kw-wind-sub").textContent = windSub;

    $("#kw-vis-val").textContent = formatVis(m.visib);
    var visStr = formatVis(m.visib);
    $("#kw-vis-sub").textContent =
      /10/.test(visStr) || (parseFloat(visStr, 10) >= 5 && !Number.isNaN(parseFloat(visStr, 10)))
        ? "Unrestricted"
        : "Verify with METAR";

    var tc = m.temp;
    var tdc = m.dewp;
    var tf = tc != null ? Math.round(cToF(tc)) : null;
    $("#kw-temp-val").textContent =
      tc != null ? String(Math.round(tc)) + "° C / " + tf + "° F" : "—";
    $("#kw-temp-sub").textContent = tdc != null ? "Dewpt: " + Math.round(tdc) + "° C" : "";

    var inHg = hpaToInHg(m.altim);
    $("#kw-alt-val").textContent = inHg != null ? inHg.toFixed(2) + " inHg" : "—";
    $("#kw-alt-sub").textContent = m.altim != null ? m.altim.toFixed(1) + " hPa" : "";

    var sky = skyPhrase(m.cover);
    $("#kw-sky-cover").textContent = sky.short;
    $("#kw-sky-phrase").textContent = sky.long;
    $("#kw-sky-ceil").textContent = sky.ceil;

    var tags = $("#kw-tags");
    if (tags) {
      tags.innerHTML = "";
      var rh = rhFromDew(tc, tdc);
      var tag1 = document.createElement("span");
      tag1.className = "kw-tag";
      tag1.textContent = /RA|SN|TS|DZ|SH/i.test(raw) ? "Precip in METAR" : "No precip";
      tags.appendChild(tag1);
      if (rh != null) {
        var tag2 = document.createElement("span");
        tag2.className = "kw-tag";
        tag2.textContent = (rh < 30 ? "Low " : rh < 70 ? "Mod " : "High ") + "RH " + rh + "%";
        tags.appendChild(tag2);
      }
      if (/\bAO2\b/i.test(raw)) {
        var tag3 = document.createElement("span");
        tag3.className = "kw-tag";
        tag3.textContent = "AO2 sensor";
        tags.appendChild(tag3);
      }
    }

    var wFrom = wdir;
    var wKts = wspd;
    $("#kw-rwy-head").textContent =
      "RUNWAY ANALYSIS · WIND " +
      (wFrom != null ? String(wFrom).padStart(3, "0") + "°" : "—") +
      " @ " +
      (wKts != null ? wKts + "KT" : "—");
    $("#kw-rwy-blurb").textContent = ap.runwayBlurb;

    var comps = ap.runways.map(function (rw) {
      var o = windComponents(wFrom, wKts, rw.hdg);
      return { rw: rw, hw: o.hw, xw: o.xw };
    });
    var scored = comps.map(function (x) {
      var absX = x.xw == null ? 999 : x.xw;
      var hw = x.hw == null ? 0 : x.hw;
      return { x: x, score: absX * 100 - hw };
    });
    scored.sort(function (a, b) {
      return a.score - b.score;
    });
    var favIdx = scored[0] && scored[0].x ? ap.runways.indexOf(scored[0].x.rw) : 0;

    ap.runways.forEach(function (rw, idx) {
      var o = windComponents(wFrom, wKts, rw.hdg);
      var hw = o.hw;
      var xw = o.xw;
      var card = document.querySelector('[data-rwy-slot="' + idx + '"]');
      if (!card) return;
      card.querySelector("[data-rwy-hdg]").textContent = "HDG " + String(rw.hdg).padStart(3, "0") + "°";
      card.querySelector("[data-rwy-num]").textContent = rw.id;
      var stats = card.querySelector("[data-rwy-stats]");
      if (stats && hw != null && xw != null) {
        var hwLabel = hw >= 0 ? "HW" : "TW";
        var hwVal = Math.abs(hw);
        stats.textContent = hwLabel + ": " + hwVal + " kt · XW: " + xw + " kt";
      } else if (stats) stats.textContent = "—";
      var badge = card.querySelector("[data-rwy-badge]");
      if (badge) {
        if (hw == null || xw == null) {
          badge.textContent = "";
          badge.className = "kw-rwy__badge";
        } else if (idx === favIdx && hw >= 0) {
          badge.textContent = "FAVORED";
          badge.className = "kw-rwy__badge kw-rwy__badge--fav";
        } else if (hw < 0) {
          badge.textContent = "TAILWIND";
          badge.className = "kw-rwy__badge kw-rwy__badge--tail";
        } else {
          badge.textContent = "";
          badge.className = "kw-rwy__badge";
        }
      }
    });

    var elevFt =
      m.elev != null && !Number.isNaN(Number(m.elev))
        ? Math.round(Number(m.elev) * 3.28084)
        : ap.elevFt;
    var da = densityAltitudeFt(elevFt, tc, m.altim);
    var daEl = $("#kw-da");
    if (daEl) {
      if (da != null) {
        var sign = da >= 0 ? "+" : "";
        daEl.innerHTML =
          "<strong>TODAY " +
          sign +
          da +
          " ft DA</strong> · Elev " +
          elevFt +
          " ft MSL — planning aid only; verify performance.";
      } else daEl.textContent = "";
    }
  }

  function renderAloft(parsed) {
    $("#kw-aloft-valid").textContent = parsed.valid || "FD Alaska";
    var tbody = $("#kw-aloft-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    parsed.levels.forEach(function (row) {
      var tr = document.createElement("tr");
      if (row.ft >= 24000) tr.classList.add("kw-aloft-high");
      var cell = row.cell;
      var dir = "—";
      var spd = "—";
      var tmp = "—";
      if (cell && cell.lv) {
        dir = "LV";
        spd = "—";
        tmp = "—";
      } else if (cell && cell.dir != null) {
        dir = String(cell.dir).padStart(3, "0") + "°";
        spd = cell.spd + " kt";
        tmp = cell.temp != null ? cell.temp + "°C" : "—";
      } else if (cell && cell.raw) {
        dir = cell.raw;
      }
      var rm = remarkForLevel(row.ft, cell);
      tr.innerHTML =
        "<td class=\"kw-alt\">" +
        row.ft.toLocaleString() +
        " ft</td><td>" +
        dir +
        "</td><td>" +
        spd +
        "</td><td>" +
        tmp +
        "</td><td>" +
        rm +
        "</td>";
      tbody.appendChild(tr);
    });
  }

  function renderForecast(ap, json) {
    var d = json.daily;
    if (!d || !d.time) return;
    var wrap = $("#kw-fc-rows");
    if (!wrap) return;
    wrap.innerHTML = "";
    var n = Math.min(5, d.time.length);
    for (var i = 0; i < n; i++) {
      var code = d.weather_code[i];
      var tmax = d.temperature_2m_max[i];
      var tmin = d.temperature_2m_min[i];
      var pop =
        d.precipitation_probability_max && d.precipitation_probability_max[i] != null
          ? d.precipitation_probability_max[i]
          : null;
      var row = document.createElement("div");
      row.className = "kw-fc-row";
      row.innerHTML =
        "<span class=\"kw-fc-day\">" +
        dayNameAnchorage(d.time[i]) +
        "</span><span class=\"kw-fc-icon\">" +
        wmoIcon(code) +
        "</span><span class=\"kw-fc-desc\">" +
        wmoDayLabel(code) +
        " — Open-Meteo grid" +
        "</span><span class=\"kw-fc-temps\">" +
        Math.round(tmax) +
        "° / " +
        Math.round(tmin) +
        "°</span><span class=\"kw-fc-pop\">" +
        (pop != null ? Math.round(pop) + "%" : "—") +
        "</span>";
      wrap.appendChild(row);
    }
    $("#kw-fc-coords").textContent =
      ap.lat.toFixed(2) + "°N " + Math.abs(ap.lon).toFixed(2) + "°W";
  }

  function setStatus(msg) {
    var el = $("#kw-status");
    if (el) {
      el.textContent = msg || "";
      el.classList.toggle("kw-hidden", !msg);
    }
  }

  async function loadAll() {
    var ap = AIRPORTS[state.airportKey];
    if (!ap) return;

    setStatus("Loading METAR, winds, forecast…");

    var metarUrl = awcPath("metar?ids=" + encodeURIComponent(ap.metarId) + "&format=json");
    var windUrl = awcPath("windtemp?region=alaska");

    try {
      var metarRes = await fetch(metarUrl, { cache: "no-store" });
      if (!metarRes.ok) throw new Error("METAR HTTP " + metarRes.status);
      var metarArr = await metarRes.json();
      var m = Array.isArray(metarArr) && metarArr[0] ? metarArr[0] : null;
      if (!m) throw new Error("No METAR for " + ap.metarId);

      renderMetar(ap, m);

      var windRes = await fetch(windUrl, { cache: "no-store" });
      var windText = await windRes.text();
      var parsed = parseWindsAloftText(windText, ap.fdRow);
      renderAloft(parsed);

      var om = await fetch(buildOpenMeteoUrl(ap.lat, ap.lon), { cache: "no-store" });
      if (om.ok) {
        var oj = await om.json();
        renderForecast(ap, oj);
      }

      setStatus("");
    } catch (e) {
      console.error(e);
      setStatus("Could not refresh (network or proxy). Check /kiosk-awc in Nginx and try again.");
    }
  }

  function init() {
    applyRotation();
    setAirportButtons();

    $$(".kw-btn-airport").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-airport");
        if (!AIRPORTS[k]) return;
        state.airportKey = k;
        saveAirportKey(k);
        setAirportButtons();
        loadAll();
      });
    });

    var rotBtn = $("#kw-rotate");
    if (rotBtn) {
      rotBtn.addEventListener("click", function () {
        state.rotated = !state.rotated;
        saveRotated(state.rotated);
        applyRotation();
      });
    }

    updateClock();
    setInterval(updateClock, 1000);

    loadAll();
    setInterval(loadAll, REFRESH_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
