import { Pipe, PipeTransform } from '@angular/core';
import { couleurCategorie, formatEuros, formatEurosCompact } from './utils/helper';
import { Categorie } from './models/models';

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

@Pipe({
  name: 'couleurCategorie',
  standalone: true,
})
export class CouleurCategoriePipe implements PipeTransform {
  transform(categorie: Categorie): string {
    return couleurCategorie(categorie);
  }
}
