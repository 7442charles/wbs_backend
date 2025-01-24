# Monthly Proceeds Dashboard

This project dynamically displays client payment and profit data from a Google Spreadsheet. It calculates monthly totals, active client counts, and visualizes proceeds through a pie chart.

---

## Features

- **Active Client Tracking**:
  - Displays the count of active clients (clients without a "removed" status).

- **Monthly Totals**:
  - Displays monthly total payments and profits.

- **Pie Chart Visualization**:
  - Visualizes current month's proceeds with segments for paid amount, remaining amount to break even, and profit.

---

## Project Structure

### Files

1. **index.html**:
   - The main HTML file displaying the summary and pie chart.

2. **script.js**:
   - Contains JavaScript logic for processing spreadsheet data and rendering outputs.

3. **styles.css** (Optional):
   - Provides styling for the summary table and page layout.

4. **README.md**:
   - Documentation for understanding and using the project.

### External Dependencies

- **Chart.js**: Used for rendering the pie chart.
  - [Chart.js Documentation](https://www.chartjs.org/)

---

## How It Works

1. **Data Source**:
   - The application fetches data from a public Google Spreadsheet in CSV format.

2. **Processing**:
   - Filters out clients marked as "removed" to calculate active clients.
   - Processes payments and calculates monthly totals and profits based on predefined rates.

3. **Visualization**:
   - Displays data as a summary and generates a pie chart to show proceeds for the current month.

---

## Setup Instructions

### Prerequisites

- A code editor (e.g., VS Code).
- A browser (e.g., Chrome, Firefox).
- Internet connection to fetch spreadsheet data and Chart.js.

### Steps

1. Clone or download the project files.

2. Open the `index.html` file in your browser.

3. Ensure the public Google Spreadsheet is accessible and uses the correct URL format for CSV output.

   ```
   https://docs.google.com/spreadsheets/d/e/YOUR-SPREADSHEET-ID/pub?output=csv
   ```

4. Modify the `url` variable in `script.js` to use your Google Spreadsheet URL.

5. Open the page in your browser to view the results.

---

## Configuration

### Google Spreadsheet Structure

| Column Name       | Description                              |
|-------------------|------------------------------------------|
| `Client Name`     | Name of the client.                     |
| `Start date`      | Service start date.                     |
| `End date`        | Service end date.                       |
| `Time`            | Duration of service (e.g., 24HRS, 1 WEEK). |
| `payment`         | Payment status (e.g., DONE).            |
| `Status`          | Status of the client (e.g., removed, blank for active). |
| `Total Amount Paid` | Amount paid by the client.             |

### Rates (Defined in `script.js`):

| Duration    | Rate     |
|-------------|----------|
| 24HRS       | 20       |
| 1 WEEK      | 150      |
| 1 MONTH     | 500      |

### ISP Cost

- The ISP cost is set to `1500` in the code and can be adjusted by modifying the `ISP_COST` variable in `script.js`.

---

## Visualization

### Summary Table

- Displays monthly totals for payments and profits.

### Pie Chart

- **Segments**:
  - Paid Amount (Blue).
  - Remaining Amount to Break Even (Red).
  - Profit (Green).

---

## Example Output

### Sample Summary

| Month       | Total Amount | Profit |
|-------------|--------------|--------|
| September 2024 | 2000         | 500    |
| October 2024   | 2500         | 1000   |

### Pie Chart Segments

- Blue: Amount Paid.
- Red: Remaining to break even.
- Green: Profit after breaking even.

---

## Future Improvements

- Add support for filtering data by specific client.
- Enable exporting charts as images or reports.
- Support for dynamic rate configuration.

---

## License

This project is open-source and available under the MIT License.

---



