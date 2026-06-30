import { Component } from '@angular/core';
import { PrimeImportsModule } from '@shared/moduleResources/prime-imports';
import { TopbarComponent } from '@layout/topbar/topbar.component';
import { LoaderComponent } from '@shared/loader/loader.component';
import { PoReferenceDetailComponent } from '@modules/reference-data-lookup/po-reference/po-reference-detail/po-reference-detail.component';
import { RouterOutlet } from '@angular/router'
@Component({
  selector: 'app-po-detail-layout',
  standalone: true,
  imports: [
    TopbarComponent,
    PoReferenceDetailComponent,
    PrimeImportsModule,
    LoaderComponent,
    RouterOutlet
  ],
  templateUrl: './po-detail-layout.component.html',
  styleUrl: './po-detail-layout.component.scss',
})
export class PODetailLayoutComponent {}
