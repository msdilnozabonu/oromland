import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

interface Vacancy {
  id: number;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  postedDate: Date;
  deadline: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './vacancies.component.html',
  styleUrls: ['./vacancies.component.scss']
})
export class VacanciesComponent implements OnInit {
  vacancies: Vacancy[] = [];
  filteredVacancies: Vacancy[] = [];
  selectedDepartment: string = 'all';
  selectedType: string = 'all';
  searchTerm: string = '';

  departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'medical', label: 'Medical' },
    { value: 'education', label: 'Education' },
    { value: 'recreation', label: 'Recreation' },
    { value: 'administration', label: 'Administration' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'food-service', label: 'Food Service' }
  ];

  jobTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' }
  ];

  ngOnInit() {
    this.loadVacancies();
    this.filterVacancies();
  }

  loadVacancies() {
    this.vacancies = [
      {
        id: 1,
        title: 'Camp Counselor',
        department: 'education',
        location: 'Tashkent Region',
        type: 'full-time',
        experience: '1-2 years',
        salary: '$800-1200/month',
        description: 'We are looking for an enthusiastic Camp Counselor to join our team and help create memorable experiences for children.',
        requirements: [
          'Bachelor\'s degree in Education, Psychology, or related field',
          'Experience working with children aged 6-16',
          'Strong communication and leadership skills',
          'First Aid certification preferred',
          'Fluent in Uzbek and English'
        ],
        responsibilities: [
          'Supervise and mentor children during camp activities',
          'Plan and lead recreational and educational activities',
          'Ensure safety and well-being of all campers',
          'Collaborate with other staff members',
          'Maintain accurate records and reports'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Professional development opportunities',
          'Accommodation provided',
          'Meals included'
        ],
        postedDate: new Date('2024-01-15'),
        deadline: new Date('2024-02-15'),
        isActive: true
      },
      {
        id: 2,
        title: 'Registered Nurse',
        department: 'medical',
        location: 'Samarkand',
        type: 'full-time',
        experience: '2-5 years',
        salary: '$1000-1500/month',
        description: 'Join our medical team to provide healthcare services to camp participants and sanatorium guests.',
        requirements: [
          'Valid nursing license in Uzbekistan',
          'Minimum 2 years of clinical experience',
          'Experience in pediatric care preferred',
          'CPR and First Aid certification',
          'Strong interpersonal skills'
        ],
        responsibilities: [
          'Provide medical care and first aid',
          'Administer medications as prescribed',
          'Maintain medical records',
          'Conduct health screenings',
          'Coordinate with physicians and other healthcare providers'
        ],
        benefits: [
          'Competitive salary package',
          'Health and dental insurance',
          'Continuing education support',
          'Retirement plan',
          'Paid time off'
        ],
        postedDate: new Date('2024-01-10'),
        deadline: new Date('2024-02-10'),
        isActive: true
      },
      {
        id: 3,
        title: 'Head Chef',
        department: 'food-service',
        location: 'Bukhara',
        type: 'full-time',
        experience: '5+ years',
        salary: '$1200-1800/month',
        description: 'Lead our kitchen team in preparing nutritious and delicious meals for our guests.',
        requirements: [
          'Culinary degree or equivalent experience',
          'Minimum 5 years of kitchen management experience',
          'Knowledge of dietary restrictions and nutrition',
          'Food safety certification',
          'Leadership and team management skills'
        ],
        responsibilities: [
          'Plan and prepare meals for large groups',
          'Manage kitchen staff and operations',
          'Ensure food safety and quality standards',
          'Manage inventory and food costs',
          'Accommodate special dietary needs'
        ],
        benefits: [
          'Excellent compensation package',
          'Performance bonuses',
          'Health insurance',
          'Professional development',
          'Staff accommodation'
        ],
        postedDate: new Date('2024-01-12'),
        deadline: new Date('2024-02-12'),
        isActive: true
      },
      {
        id: 4,
        title: 'Sports Trainer',
        department: 'recreation',
        location: 'Fergana Valley',
        type: 'part-time',
        experience: '2-3 years',
        salary: '$600-900/month',
        description: 'Organize and lead sports activities and fitness programs for camp participants.',
        requirements: [
          'Sports science or physical education degree',
          'Certified personal trainer qualification',
          'Experience in group fitness instruction',
          'Knowledge of various sports and activities',
          'Excellent physical fitness'
        ],
        responsibilities: [
          'Design and implement fitness programs',
          'Lead sports activities and competitions',
          'Ensure participant safety during activities',
          'Maintain sports equipment',
          'Motivate and encourage participants'
        ],
        benefits: [
          'Flexible schedule',
          'Performance incentives',
          'Training opportunities',
          'Equipment allowance',
          'Seasonal bonuses'
        ],
        postedDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-08'),
        isActive: true
      },
      {
        id: 5,
        title: 'Teacher - English Language',
        department: 'education',
        location: 'Tashkent',
        type: 'contract',
        experience: '3+ years',
        salary: '$900-1300/month',
        description: 'Teach English language classes to children and adults in our educational programs.',
        requirements: [
          'Bachelor\'s degree in English or Education',
          'TEFL/TESOL certification',
          'Minimum 3 years teaching experience',
          'Native or near-native English proficiency',
          'Experience with diverse age groups'
        ],
        responsibilities: [
          'Plan and deliver English language lessons',
          'Assess student progress and provide feedback',
          'Create engaging learning materials',
          'Participate in educational activities',
          'Collaborate with other educators'
        ],
        benefits: [
          'Competitive contract rates',
          'Professional development support',
          'Flexible teaching schedule',
          'Cultural exchange opportunities',
          'Transportation provided'
        ],
        postedDate: new Date('2024-01-05'),
        deadline: new Date('2024-02-05'),
        isActive: true
      },
      {
        id: 6,
        title: 'Maintenance Supervisor',
        department: 'maintenance',
        location: 'Nukus',
        type: 'full-time',
        experience: '4+ years',
        salary: '$800-1200/month',
        description: 'Oversee facility maintenance and ensure all equipment and buildings are in excellent condition.',
        requirements: [
          'Technical diploma in engineering or related field',
          'Minimum 4 years of maintenance experience',
          'Knowledge of HVAC, plumbing, and electrical systems',
          'Leadership and problem-solving skills',
          'Valid driver\'s license'
        ],
        responsibilities: [
          'Supervise maintenance team',
          'Conduct regular facility inspections',
          'Coordinate repair and maintenance work',
          'Manage maintenance schedules and budgets',
          'Ensure compliance with safety regulations'
        ],
        benefits: [
          'Stable employment',
          'Health insurance coverage',
          'Tool and equipment allowance',
          'Overtime compensation',
          'Annual performance bonuses'
        ],
        postedDate: new Date('2024-01-03'),
        deadline: new Date('2024-02-03'),
        isActive: true
      }
    ];
  }

  filterVacancies() {
    this.filteredVacancies = this.vacancies.filter(vacancy => {
      const matchesDepartment = this.selectedDepartment === 'all' || vacancy.department === this.selectedDepartment;
      const matchesType = this.selectedType === 'all' || vacancy.type === this.selectedType;
      const matchesSearch = this.searchTerm === '' || 
        vacancy.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vacancy.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesDepartment && matchesType && matchesSearch && vacancy.isActive;
    });
  }

  onFilterChange() {
    this.filterVacancies();
  }

  onSearchChange() {
    this.filterVacancies();
  }

  getDepartmentLabel(department: string): string {
    const dept = this.departments.find(d => d.value === department);
    return dept ? dept.label : department;
  }

  getTypeLabel(type: string): string {
    const jobType = this.jobTypes.find(t => t.value === type);
    return jobType ? jobType.label : type;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  isDeadlineApproaching(deadline: Date): boolean {
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 7 && daysDiff > 0;
  }

  isDeadlinePassed(deadline: Date): boolean {
    const today = new Date();
    return deadline < today;
  }
}
