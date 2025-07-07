'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus('File uploaded and processed successfully!');
        // TODO: Update your cases state with the processed data
        console.log('Processed document:', data);
      } else {
        setUploadStatus(`Error: ${data.error || 'Failed to process file'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-medium">Upload Case Document</h3>
      <div className="flex items-center gap-2">
        <input
          type="file"
          id="case-upload"
          accept=".docx"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <Button asChild>
          <label 
            htmlFor="case-upload" 
            className="cursor-pointer flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Select .docx File'}
          </label>
        </Button>
      </div>
      {uploadStatus && (
        <p className={`text-sm ${
          uploadStatus.includes('Error') ? 'text-destructive' : 'text-muted-foreground'
        }`}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
}
