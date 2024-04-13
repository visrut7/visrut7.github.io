import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageDataService {
  constructor() {}

  getImageData(imageSrc: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const ctx = this.createCanvasContext(img.width, img.height);
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  }

  getImage({
    imageData,
    width,
    height,
  }: {
    imageData: Float32Array;
    width: number;
    height: number;
  }): string | ArrayBuffer {
    const ctx = this.createCanvasContext(width, height);
    const renderedImageData = new ImageData(width, height);
    for (let i = 0; i < imageData.length; i++) {
      const val = Math.min(Math.max(imageData[i], 0), 255); // Clamp value between 0 and 255
      renderedImageData.data[i * 4] = val; // R
      renderedImageData.data[i * 4 + 1] = val; // G
      renderedImageData.data[i * 4 + 2] = val; // B
      renderedImageData.data[i * 4 + 3] = 255; // A
    }
    ctx.putImageData(renderedImageData, 0, 0);
    return ctx.canvas.toDataURL();
  }

  private createCanvasContext(
    width: number,
    height: number
  ): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext('2d')!;
  }
}
