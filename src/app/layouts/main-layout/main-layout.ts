import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar-component/navbar-component';
import { FooterComponent } from '@shared/components/footer-component/footer-component';

@Component({
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
})
export class MainLayout {}
