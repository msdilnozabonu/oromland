import { Injectable } from '@angular/core';

export interface DefaultImages {
  sanatoriums: string;
  camps: string;
  placeholder: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private defaultImages: DefaultImages = {
    sanatoriums: 'https://avatars.mds.yandex.net/i?id=31199cac7d54739448076a1194b29942f7b212ac-4809555-images-thumbs&n=13',
    camps: 'https://e7.pngegg.com/pngimages/493/598/png-clipart-debit-card-child-online-banking-child-angle-child.png',
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'
  };

  getDefaultImage(type: 'sanatoriums' | 'camps' | 'placeholder'): string {
    return this.defaultImages[type];
  }

  getImageWithFallback(imageUrl: string | undefined, fallbackType: 'sanatoriums' | 'camps'): string {
    if (imageUrl && imageUrl.trim() !== '') {
      return imageUrl;
    }
    return this.getDefaultImage(fallbackType);
  }

  preloadImages(): Promise<void[]> {
    const imagePromises = Object.values(this.defaultImages).map(url => {
      return new Promise<void>((resolve, reject) => {
        if (url.startsWith('data:')) {
          resolve();
          return;
        }
        
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); 
        img.src = url;
      });
    });

    return Promise.all(imagePromises);
  }

  createImageElement(src: string, alt: string, className?: string): HTMLImageElement {
    const img = new Image();
    img.src = src;
    img.alt = alt;
    if (className) {
      img.className = className;
    }
    return img;
  }

  isImageLoaded(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  }
}