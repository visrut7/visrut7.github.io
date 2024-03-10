import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';

const SCALE_FACTOR = 50;

enum Color {
  RED = 'red',
  BLUE = 'blue',
}

@Component({
  selector: 'app-knn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knn.component.html',
  styleUrl: './knn.component.css',
})
export class KnnComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasView!: ElementRef<HTMLCanvasElement>;

  get canvas(): HTMLCanvasElement {
    return this.canvasView.nativeElement;
  }

  color: Color = Color.RED;
  Color = Color;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.canvas.width = 300;
      this.canvas.height = 300;

      this.scaleCanvas(SCALE_FACTOR);
      this.drawGrid();
    }
  }

  private scaleCanvas(factor: number): void {
    const ctx = this.canvas.getContext('2d')!;
    ctx.scale(factor, factor);
  }

  onCanvasClick(event: MouseEvent): void {
    const x = Math.trunc(event.offsetX / SCALE_FACTOR);
    const y = Math.trunc(event.offsetY / SCALE_FACTOR);
    console.log(x, y);
    this.drawPixel(x, y);
  }

  private drawPixel(x: number, y: number): void {
    const ctx = this.canvas.getContext('2d')!;
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, 1, 1);
  }

  setColor(color: Color) {
    this.color = color;
  }

  drawGrid(): void {
    const ctx = this.canvas.getContext('2d')!;

    ctx.beginPath();
    for (let x = 0; x <= this.canvas.width; x += 1) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
    }

    for (let y = 0; y <= this.canvas.width; y += 1) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.height, y);
    }

    ctx.strokeStyle = 'white';
    ctx.lineWidth = ctx.lineWidth / SCALE_FACTOR;

    ctx.stroke();
  }

  performKNN(): void {}
}
