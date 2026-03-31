const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType, AlignmentType } = require('docx');

class DOCXExporterService {
  async generateDOCX(reportData) {
    const { week, sections } = reportData;
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: `Weekly Report - ${week.department}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: week.label,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: `${new Date(week.startDate).toLocaleDateString()} - ${new Date(week.endDate).toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Sections
          ...this.generateSections(sections)
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }

  generateSections(sections) {
    const children = [];

    for (const [sectionKey, entries] of Object.entries(sections)) {
      // Section title
      children.push(
        new Paragraph({
          text: this.formatSectionName(sectionKey),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      if (entries.length === 0) {
        children.push(
          new Paragraph({
            text: 'No entries for this section',
            italics: true,
            spacing: { after: 200 }
          })
        );
      } else {
        entries.forEach((entry, index) => {
          children.push(
            new Paragraph({
              text: `Entry ${index + 1}`,
              bold: true,
              spacing: { before: 200, after: 100 }
            })
          );

          // Entry data
          Object.entries(entry.data).forEach(([key, value]) => {
            if (value instanceof Date) {
              value = value.toLocaleDateString();
            }
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${this.formatSectionName(key)}: `, bold: true }),
                  new TextRun({ text: String(value) })
                ],
                spacing: { after: 100 }
              })
            );
          });

          // Metadata
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Entered by: ', bold: true }),
                new TextRun({ text: `${entry.enteredByName} (${entry.enteredByRole})` })
              ],
              spacing: { after: 50 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Date: ', bold: true }),
                new TextRun({ text: new Date(entry.createdAt).toLocaleString() })
              ],
              spacing: { after: 200 }
            })
          );
        });
      }
    }

    return children;
  }

  formatSectionName(key) {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}

module.exports = new DOCXExporterService();
