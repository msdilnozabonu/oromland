import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentService } from '../../services/document.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-document-upload',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent implements OnInit {
  @Input() bookingId?: number;
  @Input() childId?: number;
  @Input() maxFiles: number = 5;
  @Input() required: boolean = false;
  @Output() filesUploaded = new EventEmitter<any[]>();
  @Output() uploadError = new EventEmitter<string>();

  selectedFiles: File[] = [];
  uploadedDocuments: any[] = [];
  uploading = false;
  dragOver = false;

  maxFileSize = environment.maxFileSize;
  allowedTypes = environment.allowedFileTypes;

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    if (this.bookingId) {
      this.loadExistingDocuments();
    }
  }

  loadExistingDocuments() {
    // Load existing documents for the booking
    this.documentService.getUserDocuments().subscribe({
      next: (documents) => {
        this.uploadedDocuments = documents.filter(doc => 
          this.bookingId ? doc.bookingId === this.bookingId : true
        );
      },
      error: (error) => {
        console.error('Error loading documents:', error);
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []) as File[];
    this.handleFiles(files);
  }

  onFileSelect(event: any) {
    const files = Array.from(event.target.files || []) as File[];
    this.handleFiles(files);
  }

  handleFiles(files: File[]) {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file type
      if (!this.allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Allowed types: PNG, JPEG, PDF, DOC, DOCX`);
        return;
      }

      // Check file size
      if (file.size > this.maxFileSize) {
        errors.push(`${file.name}: File too large. Maximum size: ${this.maxFileSize / (1024 * 1024)}MB`);
        return;
      }

      // Check total files limit
      if (this.selectedFiles.length + validFiles.length >= this.maxFiles) {
        errors.push(`Maximum ${this.maxFiles} files allowed`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      this.uploadError.emit(errors.join('\n'));
    }

    this.selectedFiles = [...this.selectedFiles, ...validFiles];
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  removeUploadedDocument(documentId: number) {
    this.documentService.deleteDocument(documentId).subscribe({
      next: () => {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== documentId);
      },
      error: (error) => {
        console.error('Error deleting document:', error);
        this.uploadError.emit('Error deleting document');
      }
    });
  }

  uploadFiles() {
    if (this.selectedFiles.length === 0) {
      return;
    }

    this.uploading = true;
    const uploadPromises: Promise<any>[] = [];

    this.selectedFiles.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      
      if (this.bookingId) {
        formData.append('bookingId', this.bookingId.toString());
      }
      
      if (this.childId) {
        formData.append('childId', this.childId.toString());
      }

      const uploadPromise = this.documentService.uploadDocument(formData).toPromise();
      uploadPromises.push(uploadPromise);
    });

    Promise.all(uploadPromises)
      .then(results => {
        this.uploading = false;
        this.selectedFiles = [];
        this.uploadedDocuments = [...this.uploadedDocuments, ...results];
        this.filesUploaded.emit(results);
      })
      .catch(error => {
        this.uploading = false;
        console.error('Upload error:', error);
        this.uploadError.emit('Error uploading files. Please try again.');
      });
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'fas fa-file-pdf text-danger';
      case 'doc':
      case 'docx':
        return 'fas fa-file-word text-primary';
      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'fas fa-file-image text-success';
      default:
        return 'fas fa-file text-secondary';
    }
  }

  getFileSize(size: number): string {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return Math.round(size / 1024) + ' KB';
    } else {
      return Math.round(size / (1024 * 1024)) + ' MB';
    }
  }

  getDocumentStatusBadge(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-success';
      case 'REJECTED':
        return 'bg-danger';
      case 'PENDING':
      default:
        return 'bg-warning';
    }
  }
}