import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static routes - prerender
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contacts',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'camps',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'sanatoriums',
    renderMode: RenderMode.Prerender
  },
  // Dynamic routes - server-side render
  {
    path: 'camps/:cityId',
    renderMode: RenderMode.Server
  },
  {
    path: 'camps/:cityId/:campId',
    renderMode: RenderMode.Server
  },
  {
    path: 'sanatoriums/:cityId',
    renderMode: RenderMode.Server
  },
  {
    path: 'sanatoriums/:cityId/:sanatoriumId',
    renderMode: RenderMode.Server
  },

  // All dashboard routes - server-side render (require authentication)
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Server
  },
  // Fallback for other routes
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
