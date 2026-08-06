import { Pipe, PipeTransform } from '@angular/core';
import { formatEuros, formatEurosCompact } from './utils/helper';

@Pipe({
  name: 'formatEuros',
  standalone: true, // Si tu es sur Angular 14+
})
export class FormatEurosPipe implements PipeTransform {
  transform(value: number): string {
    return formatEuros(value);
  }
}

@Pipe({
  name: 'formatEurosCompact',
  standalone: true,
})
export class FormatEurosCompactPipe implements PipeTransform {
  transform(value: number): string {
    return formatEurosCompact(value);
  }
}
