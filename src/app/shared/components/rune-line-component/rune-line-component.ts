import { Component, input } from '@angular/core';

@Component({
  selector: 'app-rune-line-component',
  templateUrl: './rune-line-component.html',
})
export class RuneLineComponent {
  readonly text = input<string>('ᛏ ᚱ ᚨ ᚾ ᛊ ᛈ ᛟ ᚱ ᛏ ᛖ ᛊ · ᛞ ᚱ ᚨ ᚲ ᚨ ᚱ · ᚹ ᚨ ᛚ ᛈ ᚨ ᚱ ᚨ ᛁ ᛊ ᛟ · ᚲ ᚺ ᛁ ᛚ ᛖ');
}