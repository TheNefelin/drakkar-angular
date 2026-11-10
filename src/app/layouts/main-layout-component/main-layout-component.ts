import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar-component/navbar-component';
import { FooterComponent } from '@shared/components/footer-component/footer-component';
import { RuneLineComponent } from '@shared/components/rune-line-component/rune-line-component';

@Component({
  imports: [NavbarComponent, FooterComponent, RuneLineComponent, RouterOutlet, NgOptimizedImage],
  selector: 'app-main-layout-component',
  templateUrl: './main-layout-component.html',
})
export class MainLayoutComponent {}
