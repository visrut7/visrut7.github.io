import { Routes } from '@angular/router';
import { CnnComponent } from './cnn/cnn.component';
import { RotateImageComponent } from './rotate-image/rotate-image.component';
import { BlurBrushForImageComponent } from './blur-brush-for-image/blur-brush-for-image.component';
import { TestRunnerComponent } from './test-runner/test-runner.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
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
  {
    path: 'test-runner',
    component: TestRunnerComponent,
  },
];
