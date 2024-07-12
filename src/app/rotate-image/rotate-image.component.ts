import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadImageComponent } from '../shared/upload-image/upload-image.component';

@Component({
  selector: 'app-rotate-image',
  standalone: true,
  imports: [CommonModule, UploadImageComponent],
  templateUrl: './rotate-image.component.html',
})
export class RotateImageComponent {
  img: string | ArrayBuffer | null = null;
  rotation: number = 0;

  rotateImage(): void {
    this.rotation += 90;
    if (this.rotation >= 360) {
      this.rotation = 0;
    }
  }

  removeImage(): void {
    this.img = null;
    this.rotation = 0;
  }

  downloadImage(): void {
    if (this.img) {
      const image = new Image();
      image.src = this.img as string;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        // Calculate the new canvas size
        const angle = this.rotation % 360;
        if (angle === 90 || angle === 270) {
          canvas.width = image.height;
          canvas.height = image.width;
        } else {
          canvas.width = image.width;
          canvas.height = image.height;
        }

        // Rotate the image
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((angle * Math.PI) / 180);
        context.drawImage(image, -image.width / 2, -image.height / 2);

        // Convert canvas to data URL and download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'rotated-image.png';
        link.click();
      };
    }
  }
}
