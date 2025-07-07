# Legal Case Dashboard - CSV Blueprint Documentation

## Overview
This document provides the exact CSV format required for uploading case data to the Legal Case Dashboard system. All future data uploads must follow this format exactly.

## CSV Format Requirements

### Required Headers (Exact Order)
```
Sr No,Case Number,Applicant Name,Respondent Name,Status,Remarks
```

### Field Descriptions

1. **Sr No** - Serial number (string/number)
   - Example: "1", "2", "3"

2. **Case Number** - Unique case identifier in Marathi/Hindi format
   - Format: अपील/XXX/YYYY or अपिल/XXX/YYYY
   - Example: "अपील/150/2023", "अपिल/139/2023"

3. **Applicant Name** - Name of the applicant in Devanagari script
   - Example: "लक्ष्मीबाई शेलार", "चंद्रबाई हंबीर"

4. **Respondent Name** - Name of the respondent in Devanagari script
   - Example: "सुनीता शेलार", "गंगुबाई आघाण"

5. **Status** - Case status in Marathi
   - Common values: "प्राप्त", "----"
   - "प्राप्त" = Received
   - "----" = Pending/No status

6. **Remarks** - Additional notes or comments (optional)
   - Can be empty or contain location/court information
   - Example: "त्र्यंबकेश्वर न्यायालय", ""

## Automatic Location Detection

The system automatically assigns cases to the correct dashboard (Igatpuri or Trimbakeshwar) based on:

1. **Case content analysis** - Names, remarks, and other fields containing location indicators
2. **Devanagari text recognition** - Supports both "त्र्यंबकेश्वर" and "इगतपुरी"
3. **English text recognition** - Supports "trimbakeshwar" and "igatpuri"

### Location Keywords
- **Trimbakeshwar**: त्र्यंबकेश्वर, trimbakeshwar
- **Igatpuri**: इगतपुरी, igatpuri

## Sample CSV File

```csv
Sr No,Case Number,Applicant Name,Respondent Name,Status,Remarks
1,अपील/150/2023,लक्ष्मीबाई शेलार,सुनीता शेलार,प्राप्त,
2,अपिल/139/2023,चंद्रबाई हंबीर,गंगुबाई आघाण,प्राप्त,
3,अपिल/134/2023,पांडुरंग पारधी,गोविंद ठोंबरे,प्राप्त,
4,अपील/131/2023,अरुण पोरजे,मनोज चौधरी,प्राप्त,
5,अपिल/113/2023,केरुजी काळे,कोंडाजी भालेराव,----,
6,अपील/104/2023,रामभाऊ ढोन्नर,अंबाबाई ढोन्नर उर्फ बिन्नर,प्राप्त,
7,अपिल/90/2023,अनुसया मालुंजकर,ओम मालुंजकर,प्राप्त,
```

## API Endpoints

### Automatic Detection (Recommended)
- **URL**: `https://legal-case-dashboard-shloknambiar-gmailcoms-projects.vercel.app/api/update-cases`
- **Method**: POST
- **Field**: `key` (file upload)

### Manual Assignment
- **Igatpuri**: `https://legal-case-dashboard-shloknambiar-gmailcoms-projects.vercel.app/api/update-cases/igatpuri`
- **Trimbakeshwar**: `https://legal-case-dashboard-shloknambiar-gmailcoms-projects.vercel.app/api/update-cases/trimbakeshwar`

## Important Notes

1. **File Encoding**: Use UTF-8 encoding to properly handle Devanagari text
2. **Header Row**: Must be exactly as specified (case-sensitive)
3. **Field Order**: Must match the exact order shown above
4. **Empty Fields**: Use empty strings for optional fields, not null values
5. **File Format**: CSV format only (.csv extension)

## Automation Integration

Your Google Drive automation should:
1. Generate CSV files in the exact format above
2. Upload to the main endpoint for automatic location detection
3. Use the `key` field name when uploading files

## Dashboard Access

- **Main Dashboard**: https://legal-case-dashboard-shloknambiar-gmailcoms-projects.vercel.app/
- **Igatpuri Dashboard**: https://legal-case-dashboard-shloknambiar-gmailcoms-projects.vercel.app/igatpuri
- **Trimbakeshwar Dashboard**: https://legal-case-dashboard-shloknambiar-gmailcoms-projects.vercel.app/trimbakeshwar

## Troubleshooting

If cases are not appearing in the correct dashboard:
1. Check that the CSV format matches exactly
2. Verify Devanagari text encoding
3. Ensure location keywords are present in the data
4. Use manual assignment endpoints if automatic detection fails
