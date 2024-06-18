import { Routes } from '@angular/router';
import { CnnComponent } from './cnn/cnn.component';
import { RotateImageComponent } from './rotate-image/rotate-image.component';

export const routes: Routes = [
  {
    path: 'cnn',
    component: CnnComponent,
  },
  {
    path: 'rotate-image',
    component: RotateImageComponent,
  },
];
