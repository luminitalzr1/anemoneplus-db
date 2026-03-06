(function () {
  function clean(text) {
    return String(text || "")
      .replace(/\r?\n|\r/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tableToCSV(table) {
    const rows = Array.from(table.querySelectorAll("tr"));
    if (!rows.length) return "";

    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("th,td"));
      return cells.map((cell) => {
        const txt = clean(cell.innerText || cell.textContent || "").replace(/"/g, '""');
        return `"${txt}"`;
      }).join(",");
    }).join("\n");
  }

  function findTable() {
    return document.querySelector("table") || document.querySelector('[role="table"]');
  }

  function downloadVisibleTable() {
    const table = findTable();
    if (!table) {
      alert("No table found to export.");
      return;
    }

    const csv = tableToCSV(table);
    if (!csv) {
      alert("No data found to export.");
      return;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ANEMONE_PLUS_Stakeholder_Database.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function isCsvButton(el) {
    if (!el) return false;
    const txt = clean(el.innerText || el.textContent || "").toLowerCase();
    return txt === "csv" || txt === "📥 csv" || txt === "export csv";
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("button,a,[role='button']");
    if (!isCsvButton(btn)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    downloadVisibleTable();
  }, true);
})();
