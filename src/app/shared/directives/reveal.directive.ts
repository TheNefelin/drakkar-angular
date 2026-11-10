import {
  Directive,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements OnDestroy {
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender({
      write: () => this.init(),
    });
  }

  private init(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.el.classList.add('reveal-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.el.classList.add('reveal-visible');
            this.observer?.disconnect();
            return;
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    this.observer.observe(this.el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
