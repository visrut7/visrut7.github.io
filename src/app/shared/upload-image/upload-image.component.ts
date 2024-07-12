import { CommonModule } from '@angular/common';
import {
  Component,
  Output,
  EventEmitter,
  HostListener,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-upload-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-image.component.html',
})
export class UploadImageComponent {
  @Input({ required: true }) image: string | ArrayBuffer | null = null;
  @Output() imageChange = new EventEmitter<string | ArrayBuffer | null>();

  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageChange.emit(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  }

  @HostListener('window:paste', ['$event'])
  handlePaste(event: ClipboardEvent) {
    const item = event.clipboardData?.items[0];
    if (item?.type.startsWith('image')) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageChange.emit(e.target?.result);
      };
      reader.readAsDataURL(blob!);
    }
  }
}
