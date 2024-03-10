import { Routes } from '@angular/router';
import { CnnComponent } from './cnn/cnn.component';
import { KnnComponent } from './knn/knn.component';

export const routes: Routes = [
  {
    path: 'cnn',
    component: CnnComponent,
  },
  {
    path: 'knn',
    component: KnnComponent,
  },
];
