import { Component } from '@angular/core';
import { HeroComponent } from '@features/home/components/hero/hero';
import { ServicesComponent } from '@features/home/components/services/services';

@Component({
  imports: [HeroComponent, ServicesComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {}