const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRpa151bjuUBvAKPBfhnelstWip0ZHspjN2kY8lBZe00ryTS7RNWdhkHb9Y2cBsspNCJSHfZ6zQCQKK/pub?output=csv";

const ISP_COST = 1500; // Monthly ISP cost

fetch(url)
  .then(response => response.text())
  .then(csvText => {
    const rows = csvText.split("\n").map(row => row.split(","));

    const headers = rows[0]; // Extract headers
    const data = rows.slice(1).map(row => {
      const obj = {};
      row.forEach((cell, index) => {
        obj[headers[index]] = cell.trim(); // Trim spaces for cleaner data
      });
      return obj;
    });

    processClientData(data);
  })
  .catch(error => console.error("Error fetching spreadsheet:", error));

function processClientData(data) {
  const rates = {
    dayRate: 20,
    weekRate: 150,
    monthRate: 500
  };

  let totalAmountPaid = 0;
  let activeClients = 0;
  let profitThisMonth = 0;
  const monthlyPayments = {};

  const currentMonthYear = getCurrentMonthYear();

  data.forEach(row => {
    const clientStatus = row["Status"];
    const totalAmount = calculateAmount(row["Time"], rates);

    // Count active clients based on Status column
    if (!clientStatus || clientStatus.toLowerCase() !== "removed") {
      activeClients++;
    }

    if (row["payment"] === "DONE") {
      totalAmountPaid += totalAmount;

      const monthYear = getMonthYear(row["Start date"]);
      if (monthYear) {
        if (!monthlyPayments[monthYear]) {
          monthlyPayments[monthYear] = { total: 0, profit: 0 };
        }

        monthlyPayments[monthYear].total += totalAmount;

        // Check if the monthYear is the current month and calculate profit
        if (monthYear === currentMonthYear) {
          profitThisMonth += totalAmount;
        }

        monthlyPayments[monthYear].profit = monthlyPayments[monthYear].total - ISP_COST;
      }
    }
  });

  const profitDescription =
    profitThisMonth > ISP_COST
      ? "Positive Profit"
      : profitThisMonth === ISP_COST
      ? "Neutral Profit"
      : "Negative Profit";

  // Update the webpage with summary and monthly totals
  displaySummary({
    activeClients,
    totalAmountPaid,
    profit: profitThisMonth - ISP_COST,
    profitDescription
  });
  displayMonthlyTotals(monthlyPayments, "summary");
  displayProceedsChart(profitThisMonth);
}

function calculateAmount(time, rates) {
  if (time.includes("24HRS")) return rates.dayRate;
  if (time.includes("1 WEEK")) return rates.weekRate;
  if (time.includes("1 MONTH")) return rates.monthRate;

  const hours = parseInt(time);
  return !isNaN(hours) ? (hours / 24) * rates.dayRate : 0;
}

function getCurrentMonthYear() {
  const now = new Date();
  return `${getMonthName(now.getMonth() + 1)} ${now.getFullYear()}`;
}

function getMonthYear(dateStr) {
  if (!dateStr) return null;
  const [month, day, year] = dateStr.split("/");
  return `${getMonthName(parseInt(month))} ${year}`;
}

function getMonthName(monthIndex) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[monthIndex - 1];
}

function displaySummary(summary) {
  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = `
    
    <p><strong>Total Amount Paid:</strong> ${summary.totalAmountPaid}</p>
    <p><strong>Profit This Month:</strong> ${summary.profit} (${summary.profitDescription})</p>
  `;
}

function displayMonthlyTotals(monthlyPayments, containerId) {
  const summaryDiv = document.getElementById(containerId);
  const totalsDiv = document.createElement("div");

  totalsDiv.innerHTML = "<h2>Monthly Totals</h2>";
  const table = document.createElement("table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Month", "Total Amount", "Profit"].forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const [month, { total, profit }] of Object.entries(monthlyPayments)) {
    const row = document.createElement("tr");

    const monthCell = document.createElement("td");
    monthCell.textContent = month;
    row.appendChild(monthCell);

    const totalCell = document.createElement("td");
    totalCell.textContent = total.toFixed(2);
    row.appendChild(totalCell);

    const profitCell = document.createElement("td");
    profitCell.textContent = profit.toFixed(2);
    row.appendChild(profitCell);

    tbody.appendChild(row);
  }
  table.appendChild(tbody);

  totalsDiv.appendChild(table);
  summaryDiv.appendChild(totalsDiv);
}

function displayProceedsChart(profitThisMonth) {
  const ctx = document.getElementById("proceedsChart").getContext("2d");

  const remaining = ISP_COST - profitThisMonth > 0 ? ISP_COST - profitThisMonth : 0;
  const profit = profitThisMonth - ISP_COST > 0 ? profitThisMonth - ISP_COST : 0;

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Paid (Blue)", "Remaining (Red)", "Profit (Green)"],
      datasets: [
        {
          data: [profitThisMonth, remaining, profit],
          backgroundColor: ["blue", "red", "green"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top"
        }
      }
    }
  });
}