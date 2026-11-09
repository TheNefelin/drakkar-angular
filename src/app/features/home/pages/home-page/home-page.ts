import { Component } from '@angular/core';
import { HeroComponent } from '@features/home/components/hero/hero';
import { ServicesComponent } from '@features/home/components/services/services';
import { ContactoComponent } from '@features/home/components/contacto/contacto';

@Component({
  imports: [HeroComponent, ServicesComponent, ContactoComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {}