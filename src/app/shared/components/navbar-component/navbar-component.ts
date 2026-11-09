import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  imports: [NgOptimizedImage, RouterLink],
  selector: 'app-navbar-component',
  templateUrl: './navbar-component.html',
})
export class NavbarComponent {}