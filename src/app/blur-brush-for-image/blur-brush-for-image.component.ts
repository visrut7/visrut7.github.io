import {
  Component,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-blur-brush-for-image',
  standalone: true,
  templateUrl: './blur-brush-for-image.component.html',
})
export class BlurBrushForImageComponent {
  @ViewChild('upload', { static: true }) upload!: ElementRef<HTMLInputElement>;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('saveButton', { static: true })
  saveButton!: ElementRef<HTMLButtonElement>;

  private ctx!: CanvasRenderingContext2D;
  private img: HTMLImageElement | null = null;
  private isDrawing = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.ctx = this.canvas.nativeElement.getContext('2d')!;
      this.upload.nativeElement.addEventListener(
        'change',
        this.handleFileUpload.bind(this)
      );
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
    }
  }

  handleFileUpload(event: Event) {
    if (isPlatformBrowser(this.platformId)) {
      const file = (event.target as HTMLInputElement).files![0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.img = new Image();
        this.img.src = e.target!.result as string;
        this.img.onload = () => {
          this.canvas.nativeElement.width = this.img!.width;
          this.canvas.nativeElement.height = this.img!.height;
          this.ctx.drawImage(this.img!, 0, 0);
        };
      };
      reader.readAsDataURL(file);
    }
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
}
