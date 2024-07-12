import {
  Component,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UploadImageComponent } from '../shared/upload-image/upload-image.component';

@Component({
  selector: 'app-blur-brush-for-image',
  standalone: true,
  templateUrl: './blur-brush-for-image.component.html',
  imports: [UploadImageComponent],
})
export class BlurBrushForImageComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('saveButton', { static: true })
  saveButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('copyButton', { static: true })
  copyButton!: ElementRef<HTMLButtonElement>;

  private ctx!: CanvasRenderingContext2D;
  img: string | ArrayBuffer | null = null;
  private isDrawing = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.ctx = this.canvas.nativeElement.getContext('2d')!;
      this.canvas.nativeElement.addEventListener(
        'mousedown',
        this.startDrawing.bind(this)
      );
      this.canvas.nativeElement.addEventListener(
        'mouseup',
        this.stopDrawing.bind(this)
      );
      this.canvas.nativeElement.addEventListener(
        'mousemove',
        this.draw.bind(this)
      );
      this.saveButton.nativeElement.addEventListener(
        'click',
        this.saveImage.bind(this)
      );
      this.copyButton.nativeElement.addEventListener(
        'click',
        this.copyImageToClipboard.bind(this)
      );
    }
  }

  loadImage(img: string | ArrayBuffer | null) {
    this.img = img;
    const image = new Image();
    image.src = img! as string;
    image.onload = () => {
      this.canvas.nativeElement.width = image.width;
      this.canvas.nativeElement.height = image.height;
      this.ctx.drawImage(image, 0, 0);
    };
  }

  startDrawing() {
    this.isDrawing = true;
  }

  stopDrawing() {
    this.isDrawing = false;
    this.ctx.beginPath();
  }

  draw(event: MouseEvent) {
    if (this.isDrawing) {
      this.blurArea(event.offsetX, event.offsetY);
    }
  }

  blurArea(x: number, y: number) {
    const radius = 10;
    this.ctx.filter = 'blur(5px)';
    this.ctx.drawImage(
      this.canvas.nativeElement,
      x - radius,
      y - radius,
      radius * 2,
      radius * 2,
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );
    this.ctx.filter = 'none';
  }

  saveImage() {
    const link = document.createElement('a');
    link.download = 'blurred-image.png';
    link.href = this.canvas.nativeElement.toDataURL();
    link.click();
  }

  copyImageToClipboard() {
    this.canvas.nativeElement.toBlob((blob) => {
      const item = new ClipboardItem({ 'image/png': blob! });
      navigator.clipboard.write([item]);
    });
  }
}
