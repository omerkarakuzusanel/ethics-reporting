import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenFileName(fileName: string, maxLength: number = 30): string {
  if (fileName.length <= maxLength) return fileName;

  const extension = fileName.split('.').pop();
  const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));
  
  // Eğer dosya adı çok uzunsa, ortasını kısaltıp ... ekleyelim
  const shortenedName = nameWithoutExtension.slice(0, maxLength - 3) + '...';
  
  return `${shortenedName}.${extension}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateFile(file: File, maxSizeMB: number = 5): { isValid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // MB to bytes
  
  // İzin verilen dosya türleri
  const allowedTypes = [
    // PDF dosyaları
    'application/pdf',
    // Resim dosyaları
    'image/jpeg',
    'image/jpg',
    'image/png',
    // Word dosyaları
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel dosyaları
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Metin dosyaları
    'text/plain'
  ];
  
  // Dosya türü kontrolü
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Bu dosya türü kabul edilmiyor. Kabul edilen dosya türleri: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT`
    };
  }
  
  // Dosya boyutu kontrolü
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz. Seçilen dosya: ${formatFileSize(file.size)}`
    };
  }
  
  return { isValid: true };
}
