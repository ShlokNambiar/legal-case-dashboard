# Legal Case Dashboard - Data Schema Blueprint

## CRITICAL: Data Upload Safety
**The system now uses SAFE UPSERT operations - no more data deletion!**
- New cases are inserted
- Existing cases (matched by Case Number) are updated but preserve user edits
- **NO DATA WILL BE WIPED** during uploads

## Required CSV Format

### Column Headers (EXACT MATCH REQUIRED)
```
Case Type,Case Number,Appellant,Respondent,Received,Next Date,Taluka
```

### Sample Data Format
```csv
Case Type,Case Number,Appellant,Respondent,Received,Next Date,Taluka
अपील,अपील/188/2024,राम शर्मा,श्याम वर्मा,प्राप्त,2025-07-17,Igatpuri
रिव्हीजन,रिव्हीजन/123/2025,सीता देवी,गीता पाटील,प्राप्त,2025-07-17,Trimbakeshwar
मामलेदार कोर्ट,MC/456/2024,अजय कुमार,विजय सिंह,,2025-07-17,Igatpuri
```

## Field Specifications

### 1. Case Type (Required)
**Allowed Values:**
- अपील (Appeal)
- रिव्हीजन (Revision)
- मामलेदार कोर्ट (Mamledar Court)
- गौणखनिज (Minor Minerals)
- अतिक्रमण (Encroachment)
- कुळ कायदा (Caste Law)

**Default:** अपील (if empty)

### 2. Case Number (Required - UNIQUE IDENTIFIER)
**Format:** Any alphanumeric string
**Examples:**
- अपील/188/2024
- Appeal/123/2025
- MC/456/2024
- REV-789-2024

**CRITICAL:** This field is used to identify existing cases for updates. Make sure it's unique and consistent.

### 3. Appellant (Required)
**Format:** Text (person/organization name)
**Examples:**
- राम शर्मा
- सीता देवी
- ABC Company Ltd.

### 4. Respondent (Required)
**Format:** Text (person/organization name)
**Examples:**
- श्याम वर्मा
- गीता पाटील
- State Government

### 5. Received (Optional)
**Allowed Values:**
- प्राप्त (Received)
- - (Not received/empty)
- (blank - will default to प्राप्त)

**Default:** प्राप्त

### 6. Next Date (Optional)
**Format:** YYYY-MM-DD or DD-MM-YYYY
**Examples:**
- 2025-07-17
- 17-07-2025
- 2025-08-15

**Default:** 2025-07-17

### 7. Taluka (Optional - Auto-detected)
**Allowed Values:**
- Igatpuri
- Trimbakeshwar

**Auto-detection Rules:**
1. Checks case number for location indicators
2. Scans all fields for location keywords
3. Defaults to "Igatpuri" if no location detected

## Location Auto-Detection

The system automatically assigns cases to the correct taluka based on:

### Detection Keywords:
**Igatpuri:**
- इगतपुरी, igatpuri, igt

**Trimbakeshwar:**
- त्र्यंबकेश्वर, trimbakeshwar, tmb

### Detection Priority:
1. Case Number patterns
2. Field content analysis
3. Overall CSV content
4. Default to Igatpuri

## File Upload Methods

### 1. CSV Files (.csv)
- UTF-8 encoding recommended
- Comma-separated values
- Headers in first row

### 2. ODS Files (.ods)
- LibreOffice/OpenOffice format
- Will be converted to CSV automatically

### 3. Direct CSV Text
- Can be sent as text content
- Same format requirements

## Make.com Automation Setup

### HTTP Module Configuration:
```
URL: https://legal-case-dashboard-shloknambiar-gmailcoms-projects.vercel.app/api/update-cases
Method: POST
Body Type: multipart/form-data
Field Type: File
Key: file
File: [Your CSV/ODS file from Google Drive]
```

### Expected Response:
```json
{
  "success": true,
  "message": "Successfully processed X cases",
  "breakdown": {
    "igatpuri": 2,
    "trimbakeshwar": 1
  },
  "totalCases": 3,
  "inserted": 1,
  "updated": 2
}
```

## Data Safety Features

### 1. UPSERT Logic
- **INSERT:** New cases (by Case Number)
- **UPDATE:** Existing cases preserve user edits for:
  - Status (user-entered)
  - Received (if manually changed)
  - Next Date (if manually changed)

### 2. No Data Loss
- No DELETE operations on bulk data
- Individual case updates only
- User edits are preserved

### 3. Error Handling
- Invalid data is logged but doesn't stop processing
- Partial uploads are supported
- Detailed error messages in response

## Troubleshooting

### Common Issues:

1. **Empty Dashboard After Upload**
   - Check CSV format matches exactly
   - Verify Case Number field is not empty
   - Check for encoding issues (use UTF-8)

2. **Cases Not Appearing**
   - Verify column headers match exactly
   - Check for extra spaces in headers
   - Ensure data rows have same number of columns as headers

3. **Wrong Location Assignment**
   - Add location keywords to case numbers or fields
   - Use explicit Taluka column
   - Check auto-detection logs in API response

### Testing Your Data:
1. Start with a small test file (2-3 cases)
2. Verify the response shows correct breakdown
3. Check dashboard shows cases correctly
4. Then upload full dataset

## Support
If issues persist, check the API response for detailed error messages and logs.
