import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
  contactForm: FormGroup;
  submitted = false;
  loading = false;
  openIndex: number | null = null;

  faqs = [
    {
      question: 'How do I make a booking?',
      answer: 'Simply browse our camps and sanatoriums, select your preferred location, choose dates, and complete the booking process with required documents.'
    },
    {
      question: 'What documents are required?',
      answer: 'You\'ll need to upload identification documents, medical certificates (for sanatoriums), and any specific documents required by the facility.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking through your dashboard. Cancellation policies vary by facility and timing.'
    },
    {
      question: 'Is customer support available 24/7?',
      answer: 'Yes, our customer support team is available 24/7 to assist you with any questions or concerns.'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.contactForm.valid) {
      this.loading = true;
      
      setTimeout(() => {
        this.loading = false;
        alert('Thank you for your message! We will get back to you soon.');
        this.contactForm.reset();
        this.submitted = false;
      }, 2000);
    }
  }
toggle(index: number): void {
  this.openIndex = this.openIndex === index ? null : index;
}

isOpen(index: number): boolean {
  return this.openIndex === index;
}

  // Form control getters
  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get phone() { return this.contactForm.get('phone'); }
  get subject() { return this.contactForm.get('subject'); }
  get message() { return this.contactForm.get('message'); }
}