import { Component, CUSTOM_ELEMENTS_SCHEMA, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-carte-saisie-nombre',
  imports: [],
  templateUrl: './carte-saisie-nombre.html',
  styleUrl: './carte-saisie-nombre.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CarteSaisieNombre {
  value = input.required<number>();
  libelle = input.required<string>();
  icone = input.required<string>();

  valueChange = output<number>();

  edition = signal(false);
  valeurLocal = signal('');

  debutEdition(): void {
    this.valeurLocal.set(String(this.value() || ''));
    this.edition.set(true);
  }

  changeValeurLocal(event: Event) {
    const target = event.target as HTMLInputElement;
    this.valeurLocal.set(target.value);
  }

  valider(): void {
    const valeur = Number(this.valeurLocal());
    if (!Number.isNaN(valeur) && valeur >= 0) {
      this.valueChange.emit(valeur);
    }
    this.edition.set(false);
  }

  annuler(): void {
    this.edition.set(false);
  }
}
