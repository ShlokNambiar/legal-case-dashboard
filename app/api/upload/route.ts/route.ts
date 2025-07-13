import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if file is a .docx
    if (!file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only .docx files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from .docx
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    // Extract 'Next Date' from the text
    let nextDate = null;
    // Try to match 'Next Date' in a table or line, e.g., Next Date    02-01-2025
    const nextDateRegex = /Next Date[:\s]*([0-9]{2}[\/-][0-9]{2}[\/-][0-9]{4})/i;
    const match = text.match(nextDateRegex);
    if (match) {
      nextDate = match[1];
    }
    const caseData = {
      fileName: file.name,
      content: text,
      nextDate, // extracted value or null
      // Add more parsed fields as needed
    };

    return NextResponse.json({
      success: true,
      data: caseData,
      message: 'File processed successfully'
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
