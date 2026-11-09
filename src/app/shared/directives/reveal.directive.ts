import {
  Directive,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements OnDestroy {
  private readonly el: HTMLElement = inject(ElementRef).nativeElement as HTMLElement;
  private readonly platformId = inject(PLATFORM_ID, { optional: true });
  private readonly zone = inject(NgZone, { optional: true });
  private observer?: IntersectionObserver;

  constructor() {
    if (this.platformId && isPlatformBrowser(this.platformId)) {
      this.init();
    }
  }

  private init(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.el.classList.add('in');
      return;
    }

    this.el.classList.add('reveal');

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          if (this.zone) {
            this.zone.run(() => this.el.classList.add('in'));
          } else {
            this.el.classList.add('in');
          }
          this.observer?.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );
    this.observer.observe(this.el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
