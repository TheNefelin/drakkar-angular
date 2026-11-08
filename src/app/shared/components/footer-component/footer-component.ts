import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-footer-component',
  templateUrl: './footer-component.html',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
