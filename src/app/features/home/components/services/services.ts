import { Component, signal } from '@angular/core';

interface ServiceItem {
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-services',
  templateUrl: './services.html',
})
export class ServicesComponent {
  protected readonly services = signal<ServiceItem[]>([
    { name: 'Fletes', description: 'Cargas generales y pallets a todo RM', icon: 'ᚨ' },
    { name: 'Mudanzas', description: 'Hogar y oficina, embalaje incluido', icon: 'ᚠ' },
    { name: 'Retiro de escombros y cachureos', description: 'Retiro rápido y responsable', icon: 'ᛋ' },
    { name: 'Asociados', description: 'Convenios para empresas y constructoras', icon: 'ᚹ' },
  ]);
}