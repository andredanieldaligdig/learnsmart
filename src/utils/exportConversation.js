/**
 * Conversation Export Utility - Export chat conversations to PDF or text
 * Uses jsPDF for PDF generation (alternative: user can install it or use basic text/PDF)
 */

/**
 * Converts messages to plain text format
 * @param {array} messages - Array of message objects
 * @param {string} title - Conversation title
 * @returns {string} - Plain text content
 */
export function exportToText(messages, title = "LearnSmart Conversation") {
  let textContent = "";
  textContent += `${title}\n`;
  textContent += `Exported: ${new Date().toLocaleString()}\n`;
  textContent += "=".repeat(60) + "\n\n";

  messages.forEach((message, index) => {
    const role = message.role === "user" || message.role === "human" ? "You" : "AI";
    textContent += `[${index + 1}] ${role}:\n`;
    textContent += `${message.content}\n`;
    textContent += "-".repeat(60) + "\n\n";
  });

  return textContent;
}

/**
 * Generates a simple HTML representation of conversation for PDF
 * @param {array} messages - Array of message objects
 * @param {string} title - Conversation title
 * @returns {string} - HTML content
 */
export function generateConversationHTML(messages, title = "LearnSmart Conversation") {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }
        .timestamp {
          color: #7f8c8d;
          font-size: 0.9em;
          margin-bottom: 20px;
        }
        .message {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 6px;
          page-break-inside: avoid;
        }
        .message.user {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          margin-left: 20px;
        }
        .message.assistant {
          background: #f5f5f5;
          border-left: 4px solid #9c27b0;
          margin-right: 20px;
        }
        .message-role {
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 0.95em;
        }
        .message-content {
          white-space: pre-wrap;
          word-wrap: break-word;
          color: #2c3e50;
        }
        .user .message-role {
          color: #1976d2;
        }
        .assistant .message-role {
          color: #7b1fa2;
        }
        @media print {
          body { background: white; }
          .container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <div class="timestamp">Exported: ${new Date().toLocaleString()}</div>
  `;

  messages.forEach((message) => {
    const role = message.role === "user" || message.role === "human" ? "You" : "LearnSmart AI";
    const messageClass = message.role === "user" || message.role === "human" ? "user" : "assistant";
    
    html += `
      <div class="message ${messageClass}">
        <div class="message-role">${role}:</div>
        <div class="message-content">${escapeHtml(message.content)}</div>
      </div>
    `;
  });

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Downloads text file
 * @param {string} content - Text content
 * @param {string} filename - File name (without extension)
 */
export function downloadAsText(content, filename = "conversation") {
  const element = document.createElement("a");
  const file = new Blob([content], { type: "text/plain;charset=utf-8" });
  element.href = URL.createObjectURL(file);
  element.download = `${filename}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Downloads HTML file (can be opened in browser and printed to PDF)
 * @param {string} htmlContent - HTML content
 * @param {string} filename - File name (without extension)
 */
export function downloadAsHTML(htmlContent, filename = "conversation") {
  const element = document.createElement("a");
  const file = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  element.href = URL.createObjectURL(file);
  element.download = `${filename}.html`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Downloads as PDF using browser's print functionality
 * User needs to save as PDF from print dialog
 * Alternative: Can integrate with jsPDF for client-side PDF generation
 * @param {array} messages - Array of message objects
 * @param {string} title - Conversation title
 */
export async function downloadAsPDF(messages, title = "LearnSmart Conversation") {
  const htmlContent = generateConversationHTML(messages, title);
  
  // Check if jsPDF is available
  if (typeof window.jsPDF !== "undefined") {
    try {
      const { jsPDF } = window.jsPDF;
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin;

      // Add title
      pdf.setFontSize(16);
      pdf.text(title, margin, margin + 5);
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(127, 127, 127);
      pdf.text(`Exported: ${new Date().toLocaleString()}`, margin, margin + 12);
      
      // Reset color
      pdf.setTextColor(0, 0, 0);
      let yPosition = margin + 20;

      // Add messages
      pdf.setFontSize(11);
      messages.forEach((message) => {
        const role = message.role === "user" || message.role === "human" ? "You:" : "LearnSmart AI:";
        const contentLines = pdf.splitTextToSize(message.content, maxWidth - 4);
        
        // Check if we need a new page
        if (yPosition + contentLines.length * 5 + 8 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        // Add role
        pdf.setFont(undefined, "bold");
        pdf.text(role, margin + 2, yPosition);
        yPosition += 5;

        // Add content
        pdf.setFont(undefined, "normal");
        contentLines.forEach((line) => {
          pdf.text(line, margin + 4, yPosition);
          yPosition += 5;
        });
        
        yPosition += 3;
      });

      // Save PDF
      pdf.save(`${title}.pdf`);
      return true;
    } catch (error) {
      console.error("PDF generation failed:", error);
      return false;
    }
  } else {
    // Fallback: open HTML in new window for printing
    const newWindow = window.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    return false;
  }
}

/**
 * Exports conversation in requested format
 * @param {array} messages - Array of message objects
 * @param {string} format - "text", "html", or "pdf"
 * @param {string} filename - Base filename without extension
 * @returns {boolean} - Success status
 */
export async function exportConversation(messages, format = "text", filename = "conversation") {
  if (!messages || messages.length === 0) {
    console.warn("No messages to export");
    return false;
  }

  try {
    switch (format.toLowerCase()) {
      case "text":
        const textContent = exportToText(messages, filename);
        downloadAsText(textContent, filename);
        return true;

      case "html":
        const htmlContent = generateConversationHTML(messages, filename);
        downloadAsHTML(htmlContent, filename);
        return true;

      case "pdf":
        return await downloadAsPDF(messages, filename);

      default:
        console.error(`Unsupported export format: ${format}`);
        return false;
    }
  } catch (error) {
    console.error("Export failed:", error);
    return false;
  }
}
