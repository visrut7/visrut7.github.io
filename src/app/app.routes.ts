import { Routes } from '@angular/router';
import { CnnComponent } from './cnn/cnn.component';
import { RotateImageComponent } from './rotate-image/rotate-image.component';
import { BlurBrushForImageComponent } from './blur-brush-for-image/blur-brush-for-image.component';

export const routes: Routes = [
  {
    path: 'cnn',
    component: CnnComponent,
  },
  {
    path: 'rotate-image',
    component: RotateImageComponent,
  },
  {
    path: 'blur-brush-for-image',
    component: BlurBrushForImageComponent,
  },
];
