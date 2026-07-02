/**
 * Convert markdown formatting to HTML
 * Converts **text** to <strong>text</strong>
 * Converts *text* to <em>text</em>
 * Converts \n to <br /> for proper line breaks
 */
export function cleanAIContent(html: string): string {
  if (!html) return html;

  // Convert markdown bold (**text**) to HTML <strong> tags
  let cleaned = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert markdown italic (*text*) to HTML <em> tags
  cleaned = cleaned.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert markdown lists to proper formatting
  // Replace "- " or "* " at start of lines with bullet points
  cleaned = cleaned.replace(/^[\s]*[-*]\s+/gm, '• ');

  // Replace literal \n with actual line breaks in pre-formatted sections
  cleaned = cleaned.replace(/\\n/g, '<br />');

  // Convert newlines to <br /> tags for proper display
  cleaned = cleaned.replace(/\n/g, '<br />');

  return cleaned;
}
