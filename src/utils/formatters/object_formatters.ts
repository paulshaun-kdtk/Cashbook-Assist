export function safeParseJSON(input: string | object) {
    if (typeof input !== 'string') {
      return input; // assuming it's already an object or null
    }
  
    try {
      // Clean up leading/trailing whitespace and possible code block fences like ```json ... ```
      const cleaned = input
        .replace(/^[^[{]*([{\[].*[}\]])[^]}]*$/s, '$1') // extract only JSON part if possible
        .replace(/```(json)?/g, '') 
        .trim();
  
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("safeParseJSON failed:", error);
      return null;
    }
  }
  