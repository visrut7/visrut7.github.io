import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cnn',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cnn.component.html',
  styleUrl: './cnn.component.css',
})
export class CnnComponent {
  selectedImage: string | ArrayBuffer | null = null;
  matrix: number[] = Array(9).fill(0);

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => (this.selectedImage = e.target?.result!);
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
  }
}
