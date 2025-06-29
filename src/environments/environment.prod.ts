export const environment = {
  production: true,
  appName: 'Oromland',
  version: '1.0.0',
  supportedLanguages: ['en', 'uz', 'ru'],
  defaultLanguage: 'uz',
  maxFileSize: 5 * 1024 * 1024,
  allowedFileTypes: ['image/png', 'image/jpeg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  mapConfig: {
    defaultCenter: [41.2995, 69.2401],
    defaultZoom: 10
  }
};