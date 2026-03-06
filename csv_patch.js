<script>
(function () {
  function tableToCSV(table) {
    const rows = Array.from(table.querySelectorAll("tr"));
    if (!rows.length) return "";

    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("th,td"));
      return cells.map((cell) => {
        let text = (cell.innerText || cell.textContent || "").trim();
        text = text.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ");
        text = text.replace(/"/g, '""');
        return `"${text}"`;
      }).join(",");
    }).join("\n");
  }

  function downloadCSV() {
    const table =
      document.querySelector("table") ||
      document.querySelector('[role="table"]');

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
    a.download = "anemoneplus_stakeholders.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function buttonLooksLikeCSV(el) {
    if (!el) return false;
    const txt = (el.innerText || el.textContent || "").trim().toLowerCase();
    return txt === "csv" || txt === "export csv";
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("button,a,div");
    if (!buttonLooksLikeCSV(btn)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    downloadCSV();
  }, true);
})();
</script>
