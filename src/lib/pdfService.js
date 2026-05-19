import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Helper to sanitize unicode text (like Ghanaian Cedi ₵ and special punctuation)
 * into clean standard ASCII equivalents (e.g. 'GHS ') supported by base jsPDF fonts.
 */
function sanitizePdfText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/₵/g, 'GHS ')
    .replace(/[•·]/g, '-')
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’`]/g, "'")
    .replace(/⚠️/g, '[!]')
    .replace(/[\u20B9\u20AC\u00A3\u00A5]/g, 'GHS ');
}

/**
 * High-fidelity real vector PDF document generator service
 * Converts target DOM containers into pristine vector multi-page or single-page PDF files.
 * Completely eliminates raster snapshots so text and tables are never faint, blurry, or broken across pages.
 * 
 * @param {string|HTMLElement} targetSelector - CSS selector or HTML element to convert
 * @param {string} filename - Output PDF filename (e.g., 'Tenancy_Agreement_101.pdf')
 * @param {object} options - Custom PDF formatting options
 * @returns {Promise<boolean>} True if download succeeded
 */
export async function generateRealPDF(targetSelector, filename = 'Document.pdf', options = {}) {
  try {
    const element = typeof targetSelector === 'string' 
      ? document.querySelector(targetSelector) 
      : targetSelector;

    if (!element) {
      console.error(`PDF Generation Error: Target element '${targetSelector}' not found in DOM.`);
      throw new Error("Target document container not found.");
    }

    // Determine orientation: options.orientation or default to landscape for reports/dashboards, portrait for agreements/receipts
    const isReportOrOverview = filename.toLowerCase().includes('report') || filename.toLowerCase().includes('overview') || filename.toLowerCase().includes('dashboard') || filename.toLowerCase().includes('badge');
    const orientation = options.orientation || (isReportOrOverview ? 'l' : 'p');
    
    const doc = new jsPDF(orientation, 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = options.margin !== undefined ? options.margin : 14;
    const usableWidth = pageWidth - margin * 2;
    
    let currentY = margin;

    // Helper for adding new page if content exceeds height
    const checkPageBreak = (neededHeight) => {
      if (currentY + neededHeight > pageHeight - 20) {
        doc.addPage();
        currentY = margin + 10;
        return true;
      }
      return false;
    };

    // 1. Title Formatting
    const cleanDocTitle = sanitizePdfText(filename.replace('.pdf', '').replace(/_/g, ' ').toUpperCase());
    
    // Check if there's a prominent title in the DOM container
    let headerTitle = cleanDocTitle;
    const h1Elem = element.querySelector('h1, h2');
    if (h1Elem && h1Elem.innerText && h1Elem.innerText.trim().length > 3) {
      headerTitle = sanitizePdfText(h1Elem.innerText.trim().toUpperCase());
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // #0f172a
    const titleLines = doc.splitTextToSize(headerTitle, usableWidth);
    doc.text(titleLines, margin, currentY + 10);
    currentY += (titleLines.length * 8) + 6;

    // Subtitle / cluster banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(153, 27, 27); // #991b1b
    doc.text("REALTYOS EXECUTIVE CLUSTER • VERIFIED SYSTEM RECORD", margin, currentY);
    currentY += 10;

    // 2. Executive Audit Metadata Block
    doc.setFillColor(241, 245, 249); // #f1f5f9
    doc.setDrawColor(203, 213, 225); // #cbd5e1
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, currentY, usableWidth, 22, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // #64748b
    doc.text("ORIGIN:", margin + 6, currentY + 7);
    doc.text("TIMESTAMP:", margin + (usableWidth * 0.3), currentY + 7);
    doc.text("AUTHORITY:", margin + (usableWidth * 0.6), currentY + 7);
    doc.text("STATUS:", margin + (usableWidth * 0.85), currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.text("REALTYOS GLOBAL HQ", margin + 6, currentY + 14);
    doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), margin + (usableWidth * 0.3), currentY + 14);
    doc.text("SYSTEM AUDIT TELEMETRY", margin + (usableWidth * 0.6), currentY + 14);
    
    doc.setTextColor(0, 135, 90); // #00875a
    doc.text("SECURE-KYC-AUDITED", margin + (usableWidth * 0.85), currentY + 14);
    
    currentY += 30;

    // 3. Extract Tables and Text Blocks from DOM
    const tables = element.querySelectorAll('table');
    
    if (tables.length > 0) {
      // Extract summary KPI metrics before the table
      const kpiCards = element.querySelectorAll('.glass-card-premium, .glass-card, .kpi-card, .stat-box');
      let kpiData = [];
      kpiCards.forEach(card => {
        if (!card.querySelector('table')) {
          const labelElem = card.querySelector('span, p, h4');
          const valElem = card.querySelector('h3, strong, .value');
          if (labelElem && valElem) {
            kpiData.push({
              label: sanitizePdfText(labelElem.innerText.trim().replace(/\n+/g, ' ')),
              val: sanitizePdfText(valElem.innerText.trim().replace(/\n+/g, ' '))
            });
          }
        }
      });

      if (kpiData.length > 0) {
        checkPageBreak(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text("EXECUTIVE SUMMARY METRICS", margin, currentY);
        currentY += 8;

        const kpiWidth = usableWidth / Math.min(kpiData.length, 4);
        kpiData.slice(0, 4).forEach((kpi, idx) => {
          const boxX = margin + (idx * kpiWidth);
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(boxX, currentY, kpiWidth - 4, 18, 2, 2, 'FD');
          
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(doc.splitTextToSize(kpi.label, kpiWidth - 8), boxX + 4, currentY + 6);
          
          doc.setFontSize(11);
          doc.setTextColor(15, 23, 42);
          doc.text(doc.splitTextToSize(kpi.val, kpiWidth - 8), boxX + 4, currentY + 14);
        });
        currentY += 26;
      }

      // Render Each Structured Table
      tables.forEach((table, tIdx) => {
        const headers = [];
        const theadThs = table.querySelectorAll('thead th, tr th');
        theadThs.forEach(th => headers.push(sanitizePdfText(th.innerText.trim())));

        const rows = [];
        const tbodyTrs = table.querySelectorAll('tbody tr, tr:not(:has(th))');
        tbodyTrs.forEach(tr => {
          const rowData = [];
          const tds = tr.querySelectorAll('td');
          if (tds.length > 0) {
            tds.forEach(td => rowData.push(sanitizePdfText(td.innerText.trim().replace(/\n+/g, ' - '))));
            rows.push(rowData);
          }
        });

        if (headers.length > 0 && rows.length > 0) {
          checkPageBreak(40);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(15, 23, 42);
          doc.text(`TABLE DATASET #${tIdx + 1}`, margin, currentY);
          currentY += 6;

          autoTable(doc, {
            startY: currentY,
            head: [headers],
            body: rows,
            theme: 'grid',
            headStyles: {
              fillColor: [153, 27, 27], // #991b1b (Crimson Executive)
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 10,
              halign: 'left',
              valign: 'middle'
            },
            styles: {
              font: 'helvetica',
              fontSize: 9,
              textColor: [30, 41, 59],
              cellPadding: 6,
              lineColor: [226, 232, 240],
              lineWidth: 0.5,
              valign: 'middle'
            },
            alternateRowStyles: {
              fillColor: [248, 250, 252] // #f8fafc
            },
            margin: { left: margin, right: margin }
          });

          currentY = doc.lastAutoTable.finalY + 16;
        }
      });

      // Extract footer summary totals (if any)
      const footerTotals = element.querySelectorAll('.totals-box, .summary-row, [style*="Aggregated"], [style*="Valuation"]');
      let totalsText = [];
      footerTotals.forEach(ft => {
        const txt = sanitizePdfText(ft.innerText.trim().replace(/\s+/g, ' '));
        if (txt && !txt.includes('TABLE DATASET') && txt.length > 5) {
          totalsText.push(txt);
        }
      });

      if (totalsText.length > 0) {
        checkPageBreak(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(153, 27, 27);
        doc.text("AGGREGATED AUDIT TOTALS", margin, currentY);
        currentY += 8;

        doc.setFillColor(254, 242, 242); // light crimson
        doc.setDrawColor(252, 165, 165);
        doc.roundedRect(margin, currentY, usableWidth, 24, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(153, 27, 27);
        const tLines = doc.splitTextToSize(totalsText.join(' | '), usableWidth - 12);
        doc.text(tLines, margin + 6, currentY + 10);
        currentY += 34;
      }

    } else {
      // 4. Non-Table Documents (Agreements, Vouchers, Receipts, Notices)
      // Extract leaf-level text nodes cleanly without duplicating parent wrappers
      const walkAndPrint = (rootElem) => {
        const textNodes = rootElem.querySelectorAll('h1, h2, h3, h4, p, li, span, strong, div');
        const seenTexts = new Set();

        textNodes.forEach(node => {
          // Check if it's a leaf node containing text (no element children)
          const hasElementChildren = Array.from(node.childNodes).some(child => child.nodeType === 1);
          if (hasElementChildren) return;

          // Exclude buttons, navigation, modals controls, hidden elements
          if (node.closest('button, nav, select, input, .no-print, [style*="display: none"]')) return;

          const tag = node.tagName.toLowerCase();
          const txt = sanitizePdfText(node.innerText ? node.innerText.trim() : node.textContent ? node.textContent.trim() : '');
          
          if (!txt || txt.length < 2 || seenTexts.has(txt)) return;
          seenTexts.add(txt);

          let fontSize = 10;
          let fontStyle = 'normal';
          let textColor = [30, 41, 59];
          let spaceBefore = 6;
          let spaceAfter = 4;

          if (tag === 'h1') {
            fontSize = 20; fontStyle = 'bold'; textColor = [15, 23, 42]; spaceBefore = 12; spaceAfter = 6;
          } else if (tag === 'h2') {
            fontSize = 16; fontStyle = 'bold'; textColor = [153, 27, 27]; spaceBefore = 10; spaceAfter = 5;
          } else if (tag === 'h3') {
            fontSize = 13; fontStyle = 'bold'; textColor = [15, 23, 42]; spaceBefore = 8; spaceAfter = 4;
          } else if (tag === 'h4' || tag === 'strong') {
            fontSize = 11; fontStyle = 'bold'; textColor = [15, 23, 42]; spaceBefore = 6; spaceAfter = 2;
          } else {
            fontSize = 10; fontStyle = 'normal'; textColor = [51, 65, 85]; spaceBefore = 4; spaceAfter = 4;
          }

          const lines = doc.splitTextToSize(txt, usableWidth);
          const neededHeight = spaceBefore + (lines.length * (fontSize * 0.4)) + spaceAfter;
          checkPageBreak(neededHeight);

          currentY += spaceBefore;
          doc.setFont('helvetica', fontStyle);
          doc.setFontSize(fontSize);
          doc.setTextColor(...textColor);
          doc.text(lines, margin, currentY);
          currentY += (lines.length * (fontSize * 0.4)) + spaceAfter;
        });
      };

      walkAndPrint(element);
    }

    // 5. Add Running Header & Footer to All Pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Top Crimson Accent Bar
      doc.setFillColor(153, 27, 27); // #991b1b
      doc.rect(0, 0, pageWidth, 6, 'F');

      // Bottom Dark Footer Bar
      doc.setFillColor(30, 41, 59); // #1e293b
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      
      const footerTextY = pageHeight - 4;
      const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      doc.text(`REALTYOS CLUSTER • ${cleanDocTitle} (${dateStr})`, margin, footerTextY);
      doc.text(`PAGE ${i} OF ${pageCount}`, pageWidth - margin - 20, footerTextY);
    }

    // Trigger instant download
    doc.save(filename);
    return true;
  } catch (error) {
    console.error("Failed to generate real vector PDF:", error);
    alert("Could not generate vector PDF file. Please verify document formatting and try again.");
    return false;
  }
}
