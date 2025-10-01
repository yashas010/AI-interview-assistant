import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

/**
 * Extract text content from uploaded files (PDF, DOCX)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  
  try {
    if (fileType === 'application/pdf') {
      return await extractFromPDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractFromDOCX(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from PDF files
 */
async function extractFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Extract text from DOCX files
 */
async function extractFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Extract basic information from resume text using regex patterns
 */
export function extractResumeInfo(text: string) {
  // Clean text for better parsing
  const cleanText = text.replace(/\n+/g, '\n').trim();

  // Name extraction patterns (multiple approaches)
  const namePatterns = [
    /(?:Name|FULL NAME|Full Name):\s*([^\n]+)/i,
    /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/m,
    /^\s*([A-Z][A-Z\s]+)\n/m, // All caps name at start
  ];

  let name = '';
  for (const pattern of namePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      name = match[1].trim();
      break;
    }
  }

  // Email extraction
  const emailMatch = cleanText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : '';

  // Phone extraction patterns
  const phonePatterns = [
    /(?:Phone|Mobile|Tel|Contact|Cell).*?([+]?[\d\s()-]{10,})/i,
    /([+]?[\d\s()-]{10,})/,
  ];

  let phone = '';
  for (const pattern of phonePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      phone = match[1].replace(/[^\d+()-]/g, ' ').trim();
      // Validate it looks like a phone number (at least 10 digits)
      if (phone.replace(/\D/g, '').length >= 10) {
        break;
      }
    }
  }

  return {
    name,
    email,
    phone,
    extractedText: cleanText
  };
}