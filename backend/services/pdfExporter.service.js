const puppeteer = require('puppeteer');
const path = require('path');

class PDFExporterService {
  async generatePDF(reportData) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const html = this.generateHTML(reportData);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
      });

      return pdf;
    } finally {
      await browser.close();
    }
  }

  generateHTML(reportData) {
    const { week, sections } = reportData;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
    .header h1 { margin: 0; color: #2c3e50; }
    .header p { margin: 5px 0; color: #7f8c8d; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .section-title { background: #3498db; color: white; padding: 10px; font-size: 16px; font-weight: bold; }
    .entry { margin: 10px 0; padding: 10px; border-left: 3px solid #3498db; background: #ecf0f1; }
    .entry-field { margin: 5px 0; }
    .entry-label { font-weight: bold; color: #2c3e50; }
    .no-entries { color: #95a5a6; font-style: italic; padding: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #bdc3c7; padding: 8px; text-align: left; }
    th { background: #34495e; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Weekly Report - ${week.department}</h1>
    <p><strong>${week.label}</strong></p>
    <p>${new Date(week.startDate).toLocaleDateString()} - ${new Date(week.endDate).toLocaleDateString()}</p>
    ${week.submittedBy ? `<p>Submitted by: ${week.submittedBy} on ${new Date(week.submittedAt).toLocaleDateString()}</p>` : ''}
  </div>

  ${Object.entries(sections).map(([sectionKey, entries]) => `
    <div class="section">
      <div class="section-title">${this.formatSectionName(sectionKey)}</div>
      ${entries.length === 0 ? '<div class="no-entries">No entries for this section</div>' : ''}
      ${entries.map((entry, index) => `
        <div class="entry">
          <strong>Entry ${index + 1}</strong>
          ${this.formatEntryData(entry.data)}
          <div class="entry-field"><span class="entry-label">Entered by:</span> ${entry.enteredByName} (${entry.enteredByRole})</div>
          <div class="entry-field"><span class="entry-label">Date:</span> ${new Date(entry.createdAt).toLocaleString()}</div>
        </div>
      `).join('')}
    </div>
  `).join('')}
</body>
</html>
    `;
  }

  formatSectionName(key) {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  formatEntryData(data) {
    return Object.entries(data).map(([key, value]) => {
      if (value instanceof Date) {
        value = value.toLocaleDateString();
      }
      return `<div class="entry-field"><span class="entry-label">${this.formatSectionName(key)}:</span> ${value}</div>`;
    }).join('');
  }
}

module.exports = new PDFExporterService();
