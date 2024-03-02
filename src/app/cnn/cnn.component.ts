import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  WritableSignal,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageDataService } from '../image-data/image-data.service';

const KERNEL_SIZE = 3;

@Component({
  selector: 'app-cnn',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cnn.component.html',
  styleUrl: './cnn.component.css',
})
export class CnnComponent implements OnInit {
  inputImage: WritableSignal<string | ArrayBuffer | null> = signal(null);
  kernel: number[] = [1, 1, 1, 0, 0, 0, -1, -1, -1];
  outputImage!: string | null;

  private async getOutputImage() {
    if (this.inputImage() === null) {
      return Promise.resolve(null);
    }

    const imageData = await this.imageService.getImageData(
      this.inputImage() as string
    );

    const outputImageData = this.convertToGrayscaleAndApplyKernel(imageData);

    return this.imageService.getImage({
      ...outputImageData,
      imageData: outputImageData.data,
    }) as string;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly imageService: ImageDataService
  ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.inputImage.set('assets/mount.jpg');
    }
    this.outputImage = await this.getOutputImage();
  }

  async updateKernel(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    this.kernel[index] = parseInt(target.value);
    const image = await this.getOutputImage();
    this.outputImage = image;
  }

  trackByFn(index: any, item: any): number {
    return index;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.inputImage.set(e.target?.result!);
        this.outputImage = await this.getOutputImage();
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

  async removeImage() {
    this.inputImage.set(null);
    this.outputImage = await this.getOutputImage();
  }

  async rotateKernelClockWise() {
    // horizontal flip
    for (let i = 0; i < KERNEL_SIZE; i++) {
      for (let j = 0; j < KERNEL_SIZE; j++) {
        if (j < KERNEL_SIZE / 2) {
          const temp = this.kernel[3 * i + j];
          this.kernel[3 * i + j] = this.kernel[3 * i + (KERNEL_SIZE - 1 - j)];
          this.kernel[3 * i + (KERNEL_SIZE - 1 - j)] = temp;
        }
      }
    }

    // flip around anti diagonal
    for (let i = 0; i < KERNEL_SIZE; i++) {
      for (let j = 0; j < KERNEL_SIZE; j++) {
        if (i + j < KERNEL_SIZE) {
          const temp = this.kernel[3 * i + j];
          this.kernel[3 * i + j] = this.kernel[4 * KERNEL_SIZE - 3 * j - i - 4];
          this.kernel[4 * KERNEL_SIZE - 3 * j - i - 4] = temp;
        }
      }
    }

    this.outputImage = await this.getOutputImage();
  }
}
