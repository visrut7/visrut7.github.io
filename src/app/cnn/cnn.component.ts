import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cnn',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cnn.component.html',
  styleUrl: './cnn.component.css',
})
export class CnnComponent implements OnInit {
  selectedImage: string | ArrayBuffer | null = null;
  matrix: number[] = Array(9).fill(0);
  transformedImage: string | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialImage('/assets/mount.jpg');
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result!;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const imageData = ctx?.getImageData(0, 0, img.width, img.height);
          // Now you have the image data, you can access the RGBA values with imageData.data

          const transformedImage = this.convertToGrayscaleAndApplyKernel(
            imageData!
          );
          this.renderTransformedImage(
            transformedImage.data,
            transformedImage.width,
            transformedImage.height
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  convertToGrayscaleAndApplyKernel(imageData: ImageData) {
    const width = imageData.width;
    const height = imageData.height;
    const grayScaleData = new Float32Array(width * height);
    const outputData = new Float32Array(width * height);

    console.log('starting conversation for gray scale....');

    // Convert to grayscale
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray =
        0.299 * imageData.data[i] +
        0.587 * imageData.data[i + 1] +
        0.114 * imageData.data[i + 2];
      const index = i / 4;
      grayScaleData[index] = gray;
    }

    console.log('converted into gray scale....');

    // Apply convolution
    const kernel = [1, 1, 1, 0, 0, 0, -1, -1, -1];
    for (let x = 1; x < width - 1; x++) {
      for (let y = 1; y < height - 1; y++) {
        let sum = 0;
        let kernelIndex = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelValue = grayScaleData[(y + ky) * width + (x + kx)];
            sum += pixelValue * kernel[kernelIndex++];
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
    const ctx = this.createCanvasContext(width, height); // Assume this method exists and creates an off-screen canvas
    const renderedImageData = new ImageData(width, height);
    for (let i = 0; i < outputData.length; i++) {
      const val = Math.min(Math.max(outputData[i], 0), 255); // Clamp value between 0 and 255
      renderedImageData.data[i * 4] = val; // R
      renderedImageData.data[i * 4 + 1] = val; // G
      renderedImageData.data[i * 4 + 2] = val; // B
      renderedImageData.data[i * 4 + 3] = 255; // A
    }
    ctx.putImageData(renderedImageData, 0, 0);
    this.updateOutputImage(ctx.canvas.toDataURL());
  }

  createCanvasContext(width: number, height: number): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext('2d')!;
  }

  updateOutputImage(dataUrl: string): void {
    this.transformedImage = dataUrl; // Assume transformedImage is a new class property
  }

  removeImage(): void {
    this.selectedImage = null;
  }

  loadInitialImage(filePath: string): void {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const imageData = ctx?.getImageData(0, 0, img.width, img.height);
      // Now you have the image data, you can access the RGBA values with imageData.data

      const transformedImage = this.convertToGrayscaleAndApplyKernel(
        imageData!
      );
      this.renderTransformedImage(
        transformedImage.data,
        transformedImage.width,
        transformedImage.height
      );
    };
    img.src = filePath;
    this.selectedImage = filePath; // Update the selectedImage to show the loaded image
  }
}
