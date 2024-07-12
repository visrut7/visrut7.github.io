import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rotate-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rotate-image.component.html',
})
export class RotateImageComponent {
  uploadedImage: string | ArrayBuffer | null | undefined = null;
  rotation: number = 0;

  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  @HostListener('window:paste', ['$event'])
  handlePaste(event: ClipboardEvent) {
    const item = event.clipboardData?.items[0];
    if (item && item.type.indexOf('image') === 0) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage = e.target?.result;
      };
      reader.readAsDataURL(blob!);
    }
  }

  rotateImage(): void {
    this.rotation += 90;
    if (this.rotation >= 360) {
      this.rotation = 0;
    }
  }

  removeImage(): void {
    this.uploadedImage = null;
    this.rotation = 0;
  }

  downloadImage(): void {
    if (this.uploadedImage) {
      const image = new Image();
      image.src = this.uploadedImage as string;
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
