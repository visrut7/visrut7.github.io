import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageDataService } from '../image-data/image-data.service';

@Component({
  selector: 'app-cnn',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cnn.component.html',
  styleUrl: './cnn.component.css',
})
export class CnnComponent implements OnInit {
  selectedImage: string | ArrayBuffer | null = null;
  kernel: number[] = [1, 1, 1, 0, 0, 0, -1, -1, -1];
  transformedImage: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly imageService: ImageDataService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialImage('/assets/mount.jpg');
    }
  }

  updateKernel(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    this.kernel[index] = parseInt(target.value);
  }

  trackByFn(index: any, item: any): number {
    return index;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result!;
        this.processImage(this.selectedImage);
      };
      reader.readAsDataURL(file);
    }
  }

  convertToGrayscaleAndApplyKernel(imageData: ImageData) {
    const width = imageData.width;
    const height = imageData.height;
    const grayScaleData = new Float32Array(width * height);
    const outputData = new Float32Array(width * height);

    // Convert to grayscale
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray =
        0.299 * imageData.data[i] +
        0.587 * imageData.data[i + 1] +
        0.114 * imageData.data[i + 2];
      const index = i / 4;
      grayScaleData[index] = gray;
    }

    for (let x = 1; x < width - 1; x++) {
      for (let y = 1; y < height - 1; y++) {
        let sum = 0;
        let kernelIndex = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelValue = grayScaleData[(y + ky) * width + (x + kx)];
            sum += pixelValue * this.kernel[kernelIndex++];
          }
        }
        outputData[y * width + x] = sum;
      }
    }

    // Return the output data
    return { width, height, data: outputData };
  }

  // After applying kernel and converting to grayscale
  // Convert the outputData back to ImageData for rendering
  renderTransformedImage(
    outputData: Float32Array,
    width: number,
    height: number
  ): void {
    this.updateOutputImage(
      this.imageService.getImage({
        imageData: outputData,
        width,
        height,
      }) as string
    );
  }

  updateOutputImage(dataUrl: string): void {
    this.transformedImage = dataUrl; // Assume transformedImage is a new class property
  }

  removeImage(): void {
    this.selectedImage = null;
    this.transformedImage = null;
  }

  loadInitialImage(filePath: string): void {
    this.processImage(filePath);
    this.selectedImage = filePath;
  }

  processImage(imageSrc: string | ArrayBuffer): void {
    this.imageService.getImageData(imageSrc).subscribe({
      next: (imageData) => {
        const transformedImage =
          this.convertToGrayscaleAndApplyKernel(imageData);
        this.renderTransformedImage(
          transformedImage.data,
          transformedImage.width,
          transformedImage.height
        );
      },
      error: (error) => {
        console.error('Error loading image', error);
      },
    });
  }
}
