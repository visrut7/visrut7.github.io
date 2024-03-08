import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, combineLatest, of, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ImageDataService } from '../image-data/image-data.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

const KERNEL_SIZE = 3;

@Component({
  selector: 'app-cnn',
  standalone: true,
  templateUrl: './cnn.component.html',
  styleUrls: ['./cnn.component.css'],
  imports: [CommonModule],
})
export class CnnComponent implements OnInit {
  inputImageSubject = new BehaviorSubject<string | ArrayBuffer | null>(null);
  kernelSubject = new BehaviorSubject<number[]>([1, 1, 1, 0, 0, 0, -1, -1, -1]);

  outputImage$ = combineLatest([
    this.inputImageSubject,
    this.kernelSubject,
  ]).pipe(
    switchMap(([inputImage, kernel]) => {
      if (!inputImage) return of(null); // Handle null or initial case
      // Convert Promise to Observable with from()
      return from(this.imageService.getImageData(inputImage as string)).pipe(
        map((imageData) => {
          const outputImageData = this.convertToGrayscaleAndApplyKernel(
            imageData,
            kernel
          );
          // Assuming getImage also returns a Promise, you would handle it similarly if needed
          return this.imageService.getImage({
            ...outputImageData,
            imageData: outputImageData.data,
          }) as string;
        })
      );
    })
  );

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly imageService: ImageDataService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.inputImageSubject.next('assets/mount.jpg');
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.inputImageSubject.next(e.target?.result!);
      };
      reader.readAsDataURL(file);
    }
  }

  updateKernel(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    const newKernel = [...this.kernelSubject.value];
    newKernel[index] = parseInt(target.value);
    this.kernelSubject.next(newKernel);
  }

  removeImage(): void {
    this.inputImageSubject.next(null);
  }

  convertToGrayscaleAndApplyKernel(imageData: ImageData, kernel: number[]) {
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
      grayScaleData[i / 4] = gray;
    }

    // Apply kernel
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        let kernelIndex = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++, kernelIndex++) {
            const pixelValue = grayScaleData[(y + ky) * width + (x + kx)];
            sum += pixelValue * kernel[kernelIndex];
          }
        }
        outputData[y * width + x] = sum;
      }
    }

    return { width, height, data: outputData };
  }

  async rotateKernelClockWise() {
    const kernel = this.kernelSubject.value;

    // horizontal flip
    for (let i = 0; i < KERNEL_SIZE; i++) {
      for (let j = 0; j < KERNEL_SIZE; j++) {
        if (j < KERNEL_SIZE / 2) {
          const temp = kernel[3 * i + j];
          kernel[3 * i + j] = kernel[3 * i + (KERNEL_SIZE - 1 - j)];
          kernel[3 * i + (KERNEL_SIZE - 1 - j)] = temp;
        }
      }
    }

    // flip around anti diagonal
    for (let i = 0; i < KERNEL_SIZE; i++) {
      for (let j = 0; j < KERNEL_SIZE; j++) {
        if (i + j < KERNEL_SIZE) {
          const temp = kernel[3 * i + j];
          kernel[3 * i + j] = kernel[4 * KERNEL_SIZE - 3 * j - i - 4];
          kernel[4 * KERNEL_SIZE - 3 * j - i - 4] = temp;
        }
      }
    }

    this.kernelSubject.next([...kernel]);
  }

  trackByFn(index: any, item: any): number {
    return index;
  }
}
