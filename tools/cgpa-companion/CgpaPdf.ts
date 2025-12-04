import { jsPDF } from "jspdf";
import { StudentProfile, SemesterInput, GPAResult } from './types';
import { calculateSemesterGPA, gradeToPoint, marksToLetter } from './calc';

export const generateCgpaPdf = (
  profile: StudentProfile,
  semesters: SemesterInput[],
  result: GPAResult
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // -- Header --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CGPA Companion Report", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 26, { align: "center" });

    // -- Student Profile --
    doc.setTextColor(0);
    doc.setDrawColor(200);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, 35, pageWidth - 28, 24, 2, 2, "FD");

    doc.setFontSize(11);
    doc.text(`Name: ${profile.name || 'N/A'}`, 20, 45);
    doc.text(`ID/Roll: ${profile.rollNo || 'N/A'}`, 20, 53);
    doc.text(`Program: ${profile.program || 'N/A'}`, 120, 45);

    // -- Final Result Badge in Header --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(`CGPA: ${result.cgpa.toFixed(2)}`, 120, 53);

    let y = 70;
    const margin = 14;
    const colWidths = [30, 70, 20, 20, 20, 20]; // Code, Name, Cred, Grade, GP, Pts
    const rowHeight = 8;

    semesters.forEach(sem => {
      // Check page break
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Semester Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0);
      const semRes = calculateSemesterGPA(sem.courses);
      doc.text(`${sem.name} (SGPA: ${semRes.sgpa.toFixed(2)})`, margin, y);
      y += 6;

      // Table Header
      doc.setFillColor(60, 60, 60);
      doc.rect(margin, y, pageWidth - (margin * 2), rowHeight, "F");
      doc.setTextColor(255);
      doc.setFontSize(9);

      let x = margin;
      const headers = ["Code", "Course Name", "Credits", "Grade", "GP", "Points"];
      headers.forEach((h, i) => {
        doc.text(h, x + 2, y + 5.5);
        x += colWidths[i];
      });
      y += rowHeight;

      // Table Rows
      doc.setTextColor(50);
      doc.setFont("helvetica", "normal");

      sem.courses.forEach((c, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, y, pageWidth - (margin * 2), rowHeight, "F");
        }

        let cx = margin;
        const gp = gradeToPoint(c.grade) || 0;
        const pts = gp * parseFloat(c.credits || '0');

        const parsedGrade = parseFloat(c.grade);
        const displayGrade = !isNaN(parsedGrade) ? marksToLetter(parsedGrade) : (c.grade || '-');

        const rowData = [
          c.code || '-',
          c.name || `Course ${idx + 1}`,
          c.credits || '0',
          displayGrade,
          gp.toFixed(1),
          pts.toFixed(1)
        ];

        rowData.forEach((d, i) => {
          doc.text(String(d), cx + 2, y + 5.5);
          cx += colWidths[i];
        });
        y += rowHeight;
      });

      // Semester Footer
      doc.setFont("helvetica", "bold");
      doc.text(`Total Credits: ${semRes.totalCredits}`, margin, y + 6);
      doc.text(`Total Points: ${semRes.totalPoints.toFixed(1)}`, margin + 50, y + 6);
      y += 18;
    });

    // -- Final Summary --
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Final Summary", margin, y);
    y += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Semesters: ${semesters.length}`, margin, y);
    doc.text(`Total Credits Earned: ${result.totalCredits}`, margin, y + 6);
    doc.text(`Cumulative Grade Point Average (CGPA): ${result.cgpa.toFixed(2)}`, margin, y + 12);

    // Sanitize filename for Chrome compatibility
    // Chrome is very strict about filenames - remove all special characters
    let sanitizedName = 'Student';
    if (profile.name && profile.name.trim()) {
      sanitizedName = profile.name
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '_')             // Replace spaces with underscores
        .substring(0, 50);                // Limit length
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `CGPA_Report_${sanitizedName}_${dateStr}.pdf`;

    console.log('Generating PDF with filename:', fileName);

    // Manual blob download approach for better browser compatibility
    // This ensures the file downloads with the correct name
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);

    console.log('PDF download triggered successfully');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};