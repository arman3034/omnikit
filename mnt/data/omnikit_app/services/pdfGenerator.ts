
import { jsPDF } from "jspdf";
import { StudentProfile, GPAResult, calculateGPA } from '../tools/cgpa-calculator/calc';

export const generateMarkdownCheatSheet = () => {
  const doc = new jsPDF();

  // --- Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Markdown Shortcut Cheat Sheet", 105, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text("A clean, professional reference for quick Markdown formatting", 105, 28, { align: "center" });

  // --- Table Configuration ---
  const startY = 40;
  const rowHeight = 10;
  const col1X = 14;
  const col2X = 80;
  const colWidth1 = 66; // Width of first column
  const colWidth2 = 116; // Width of second column
  
  const data = [
    { feature: "Heading 1", shortcut: "# Heading" },
    { feature: "Heading 2", shortcut: "## Heading" },
    { feature: "Heading 3", shortcut: "### Heading" },
    { feature: "Bold", shortcut: "**text**" },
    { feature: "Italic", shortcut: "*text*" },
    { feature: "Bold + Italic", shortcut: "***text***" },
    { feature: "Paragraph", shortcut: "Just type and leave one blank line" },
    { feature: "Unordered List", shortcut: "- Item" },
    { feature: "Ordered List", shortcut: "1. Item" },
    { feature: "Link", shortcut: "[Text](https://example.com)" },
    { feature: "Image", shortcut: "![Alt](url)" },
    { feature: "Blockquote", shortcut: "> quote" },
    { feature: "Inline Code", shortcut: "`code`" },
    { feature: "Code Block", shortcut: "```code```" },
    { feature: "Horizontal Line", shortcut: "---" },
    { feature: "Tables", shortcut: "| A | B |" },
    { feature: "Task List", shortcut: "- [ ] Task" },
    { feature: "Strikethrough", shortcut: "~~text~~" },
  ];

  // --- Draw Table Header ---
  doc.setFillColor(60, 60, 60); // Dark Grey Background
  doc.rect(col1X, startY, colWidth1 + colWidth2, rowHeight, "F");
  
  doc.setTextColor(255, 255, 255); // White Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Feature", col1X + 5, startY + 6.5);
  doc.text("Shortcut / Markdown", col2X + 5, startY + 6.5);

  // --- Draw Rows ---
  let currentY = startY + rowHeight;
  doc.setTextColor(50, 50, 50); // Dark text
  doc.setFontSize(10);
  doc.setLineWidth(0.1);
  doc.setDrawColor(200, 200, 200);

  data.forEach((item, index) => {
    // Alternating Row Background
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(col1X, currentY, colWidth1 + colWidth2, rowHeight, "F");
    }

    // Borders
    doc.rect(col1X, currentY, colWidth1, rowHeight);
    doc.rect(col2X, currentY, colWidth2, rowHeight);

    // Text
    doc.setFont("helvetica", "normal");
    doc.text(item.feature, col1X + 5, currentY + 6.5);
    
    doc.setFont("courier", "normal"); // Monospace for code
    doc.text(item.shortcut, col2X + 5, currentY + 6.5);

    currentY += rowHeight;
  });

  // Output as Blob and open in new tab
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, "_blank");
};

export const generateCgpaPdf = (profile: StudentProfile, overall: GPAResult) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Academic Performance Report", pageWidth / 2, 20, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: "center" });

    // --- Student Info Box ---
    doc.setDrawColor(200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, 35, pageWidth - (margin * 2), 25, 3, 3, "FD");

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.setFont("helvetica", "bold");
    doc.text("Name:", margin + 5, 45);
    doc.text("Roll No:", margin + 5, 53);
    
    doc.setFont("helvetica", "normal");
    doc.text(profile.name || "Not provided", margin + 30, 45);
    doc.text(profile.rollNo || "—", margin + 30, 53);

    // --- Overall CGPA Badge ---
    doc.setFont("helvetica", "bold");
    doc.text("CGPA:", pageWidth - 60, 45);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.setFontSize(16);
    doc.text(overall.gpa.toFixed(2), pageWidth - 45, 45);
    
    doc.setTextColor(50);
    doc.setFontSize(11);
    doc.text(`(${overall.totalCredits} Credits)`, pageWidth - 60, 53);

    let y = 75;

    // --- Loop through Semesters ---
    profile.semesters.forEach((sem, idx) => {
        const semResult = calculateGPA(sem.courses);
        
        // Check for page break
        if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
        }

        // Semester Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(sem.name, margin, y);
        
        // SGPA for Semester
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`SGPA: ${semResult.gpa.toFixed(2)}  |  Credits: ${semResult.totalCredits}`, pageWidth - margin, y, { align: "right" });
        
        y += 5;

        // Table Header
        doc.setFillColor(60, 60, 60);
        doc.rect(margin, y, pageWidth - (margin * 2), 8, "F");
        doc.setTextColor(255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Course Name", margin + 5, y + 5.5);
        doc.text("Credits", margin + 110, y + 5.5);
        doc.text("Grade", margin + 140, y + 5.5);
        
        y += 8;

        // Courses Rows
        doc.setTextColor(50);
        doc.setFont("helvetica", "normal");
        
        sem.courses.forEach((c, cIdx) => {
             // Row Background
             if (cIdx % 2 === 0) {
                doc.setFillColor(245);
                doc.rect(margin, y, pageWidth - (margin * 2), 8, "F");
             }
             
             doc.text(c.name || `Course ${cIdx + 1}`, margin + 5, y + 5.5);
             doc.text(c.credits.toString(), margin + 110, y + 5.5);
             doc.text(c.grade.toString().toUpperCase(), margin + 140, y + 5.5);
             
             y += 8;
        });

        y += 10; // Spacing between semesters
    });

    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Generated by OmniKit GPA Calculator", pageWidth / 2, pageHeight - 10, { align: "center" });

    window.open(URL.createObjectURL(doc.output("blob")), "_blank");
};
