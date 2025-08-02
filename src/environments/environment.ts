export const environment = {
  production: false,
  appName: 'Oromland',
  version: '1.0.0',
  supportedLanguages: ['en', 'uz', 'ru'],
  defaultLanguage: 'en',
  
  apiUrl: 'https://oromland.uz/api',
  apiEndpoints: {
    auth: {
      login: '/auth/Login',
      register: '/auth/register'
    },
    user: '/api/v1/user',
    superAdmin: {
      dashboard: '/dashboard/super-admin',
      users: '/dashboard/super-admin/users',
      sanatoriums: '/dashboard/super-admin/sanatoriums',
      camps: '/dashboard/super-admin/camps',
      bookings: {
        sanatoriums: '/dashboard/super-admin/bookings/sanatoriums',
        camps: '/dashboard/super-admin/bookings/camp'
      }
    },
    admin: {
      dashboard: '/dashboard/admin',
      users: '/dashboard/admin/users',
      sanatoriums: '/dashboard/admin/sanatoriums',
      camps: '/dashboard/admin/camps',
      bookings: {
        sanatoriums: '/dashboard/admin/bookings/sanatoriums',
        camps: '/dashboard/admin/bookings/camp'
      },
      statistics: {
        sanatorium: '/dashboard/admin/sanatorium/statistics',
        camp: '/dashboard/admin/camp/statistics'
      }
    },
    manager: {
      vacancies: '/api/v1/manager/vacancies',
      sanatoriums: '/api/v1/manager/sanatoriums',
      camps: '/api/v1/manager/camps',
      bookings: {
        sanatorium: '/api/v1/manager/sanatoriums/{id}/bookings',
        camp: '/api/v1/manager/camps/{id}/bookings'
      }
    },
    operator: {
      base: '/{id}' 
    },
    open: {
      sanatoriums: {
        filter: '/open/sanatorium/filter',
        byCity: '/open/sanatorium/{cityId}',
        detail: '/open/sanatorium/{cityId}/{sanatoriumId}',
        booking: '/api/sanatoriums/{cityId}/{sanatoriumId}/booking'
      },
      camps: {
        filter: '/open/camps/filter',
        byCity: '/open/camps/{cityId}',
        detail: '/open/camps/{cityId}/{campId}',
        booking: '/api/camps/{cityId}/{campId}/booking'
      }
    },
    jobs: '/api/jobs',
    roles: '/api/roles'
  },

  maxFileSize: 7 * 1024 * 1024, 
  allowedFileTypes: [
    'image/png', 
    'image/jpeg', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],

  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50]
  },
  session: {
    timeoutWarning: 300,
    timeout: 900 
  }
};