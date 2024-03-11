import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';

const SCALE_FACTOR = 10;

enum Color {
  RED = 'red',
  BLUE = 'blue',
  LIGHT_BLUE = 'lightblue',
  LIGHT_RED = 'lightcoral',
}

@Component({
  selector: 'app-knn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knn.component.html',
  styleUrl: './knn.component.css',
})
export class KnnComponent implements AfterViewInit {
  @ViewChild('canvas') canvasView!: ElementRef<HTMLCanvasElement>;

  get canvas(): HTMLCanvasElement {
    return this.canvasView.nativeElement;
  }

  ColorEnum = Color;
  gridEnabled = false;
  color: Color = Color.RED;
  points: Array<{ x: number; y: number; color: Color }> = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.canvas.width = 300;
      this.canvas.height = 300;

      this.scaleCanvas(SCALE_FACTOR);
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
    this.drawPixel(x, y, this.color);
  }

  private drawPixel(x: number, y: number, color: Color): void {
    const ctx = this.canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
    this.points.push({ x, y, color });
  }

  setColor(color: Color) {
    this.color = color;
  }

  toggleGrid(): void {
    const ctx = this.canvas.getContext('2d')!;

    if (!this.gridEnabled) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.gridEnabled = true;
      return;
    }

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

    this.gridEnabled = false;
  }

  performKNN(): void {
    const knnCount = 7;
    for (let i = 0; i < this.canvas.width / SCALE_FACTOR; i++) {
      for (let j = 0; j < this.canvas.height / SCALE_FACTOR; j++) {
        if (this.points.some((point) => point.x === i && point.y === j)) {
          continue;
        }

        const neighbors = this.getNeighbors(i, j, knnCount);
        const majorityColor = this.getMajorityColor(neighbors);
        if (majorityColor === Color.RED) {
          this.drawPixel(i, j, Color.LIGHT_RED);
        } else {
          this.drawPixel(i, j, Color.LIGHT_BLUE);
        }
      }
    }
  }

  private getNeighbors(x: number, y: number, knnCount: number): Array<Color> {
    const distances = this.points.map((point) => {
      return {
        distance: Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2),
        color: point.color,
      };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, knnCount).map((d) => d.color);
  }

  private getMajorityColor(neighbors: Array<Color>): Color {
    const colorCount = neighbors.reduce((acc, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {} as Record<Color, number>);

    const majorityColor = Object.entries(colorCount).reduce(
      (acc, [color, count]) => {
        if (count > acc.count) {
          acc.color = color as Color;
          acc.count = count;
        }
        return acc;
      },
      { color: Color.RED, count: 0 }
    ).color;

    return majorityColor;
  }
}
