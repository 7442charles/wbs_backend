const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRpa151bjuUBvAKPBfhnelstWip0ZHspjN2kY8lBZe00ryTS7RNWdhkHb9Y2cBsspNCJSHfZ6zQCQKK/pub?output=csv";

const ISP_COST = 1500; // Monthly ISP cost

fetch(url)
  .then(response => response.text())
  .then(csvText => {
    const rows = csvText.split("\n").map(row => row.split(","));
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      row.forEach((cell, index) => {
        obj[headers[index]] = cell.trim();
      });
      return obj;
    });
    processClientData(data);
  })
  .catch(error => {
    console.error("Error fetching spreadsheet:", error);
    document.getElementById("summary").innerHTML = `
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading data. Please try again later.
      </div>
    `;
  });

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

        if (monthYear === currentMonthYear) {
          profitThisMonth += totalAmount;
        }

        monthlyPayments[monthYear].profit = monthlyPayments[monthYear].total - ISP_COST;
      }
    }
  });

  const profitDescription = profitThisMonth > ISP_COST
    ? "Positive Profit"
    : profitThisMonth === ISP_COST
    ? "Neutral Profit"
    : "Negative Profit";

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
    <div class="grid gap-4">
      <div class="bg-blue-50 p-4 rounded-lg">
        <p class="text-lg font-semibold text-blue-800">Total Amount Paid</p>
        <p class="text-3xl font-bold text-blue-900">Ksh ${summary.totalAmountPaid.toFixed(2)}</p>
      </div>
      
      <div class="bg-${summary.profit > 0 ? 'green' : 'red'}-50 p-4 rounded-lg">
        <p class="text-lg font-semibold text-${summary.profit > 0 ? 'green' : 'red'}-800">Profit This Month</p>
        <p class="text-3xl font-bold text-${summary.profit > 0 ? 'green' : 'red'}-900">
          Ksh ${summary.profit.toFixed(2)}
          <span class="text-sm font-normal">(${summary.profitDescription})</span>
        </p>
      </div>
    </div>
  `;
}

function displayMonthlyTotals(monthlyPayments, containerId) {
  const summaryDiv = document.getElementById(containerId);
  const totalsDiv = document.createElement("div");
  totalsDiv.className = "mt-8";

  totalsDiv.innerHTML = `
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Monthly Totals</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${Object.entries(monthlyPayments).map(([month, { total, profit }]) => `
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${month}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh ${total.toFixed(2)}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}">
                Ksh ${profit.toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  summaryDiv.appendChild(totalsDiv);
}

function displayProceedsChart(profitThisMonth) {
  const ctx = document.getElementById("proceedsChart").getContext("2d");

  const remaining = ISP_COST - profitThisMonth > 0 ? ISP_COST - profitThisMonth : 0;
  const profit = profitThisMonth - ISP_COST > 0 ? profitThisMonth - ISP_COST : 0;

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Revenue", "Remaining", "Profit"],
      datasets: [{
        data: [profitThisMonth, remaining, profit],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(239, 68, 68, 0.8)',  // Red
          'rgba(34, 197, 94, 0.8)'   // Green
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            font: {
              size: 14
            }
          }
        }
      }
    }
  });
}