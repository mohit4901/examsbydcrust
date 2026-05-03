/**
 * A ultra-minimal, dependency-free PDF text extractor.
 * Extracts raw strings from PDF binary streams.
 */
export const extractRawText = (buffer) => {
  try {
    const str = buffer.toString('binary');
    // Find all text blocks inside ( ... )
    const matches = str.match(/\((.*?)\)/g);
    if (!matches) return "";
    
    // Clean and join text
    const text = matches
      .map(m => m.slice(1, -1))
      .filter(t => t.length > 3) // Filter out noise
      .join(' ')
      .replace(/[^\x20-\x7E\n\t]/g, "") // Keep only printable ASCII
      .replace(/\s+/g, " ");
      
    return text;
  } catch (e) {
    console.error("[PDF Extractor Error]:", e.message);
    return "";
  }
};
