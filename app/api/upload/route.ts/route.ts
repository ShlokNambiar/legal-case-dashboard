import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

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

    const fileName = file.name;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let resultData = {};

    if (fileName.endsWith('.xlsx')) {
      // Parse XLSX
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      // Extract Next Date for each row
      resultData = {
        fileType: 'xlsx',
        fileName,
        rows, // includes Next Date and all columns
      };
    } else if (fileName.endsWith('.csv')) {
      // Parse CSV
      const csvText = buffer.toString('utf-8');
      const lines = csvText.split(/\r?\n/);
      const headers = lines[0].split(',');
      const rows = lines.slice(1).filter(l=>l.trim()).map(line => {
        const values = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((h, i) => row[h.trim()] = (values[i] || '').trim());
        return row;
      });
      resultData = {
        fileType: 'csv',
        fileName,
        rows, // includes Next Date and all columns
      };
    } else if (fileName.endsWith('.docx')) {
      // Extract text from .docx
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      // Extract 'Next Date' from the text
      let nextDate = null;
      const nextDateRegex = /Next Date[:\s]*([0-9]{2}[\/-][0-9]{2}[\/-][0-9]{4})/i;
      const match = text.match(nextDateRegex);
      if (match) {
        nextDate = match[1];
      }
      resultData = {
        fileType: 'docx',
        fileName,
        content: text,
        nextDate,
      };
    } else {
      return NextResponse.json(
        { error: 'Only .xlsx, .csv, or .docx files are allowed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resultData,
      message: 'File processed successfully',
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
