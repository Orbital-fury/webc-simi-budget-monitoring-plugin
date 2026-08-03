import { DatePipe } from '@angular/common';
import { Component, computed, input, output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Abonnement } from '../../../models';
import { FormatEurosPipe } from '../../../pipes';
import { estAbonnementActif } from '../../../utils/helper';

@Component({
  selector: 'app-carte-abonnement',
  imports: [FormatEurosPipe, DatePipe],
  templateUrl: './carte-abonnement.html',
  styleUrl: './carte-abonnement.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CarteAbonnement {
  abonnement = input.required<Abonnement>();

  editer = output<void>();
  supprimer = output<void>();
  arreter = output<void>();
  reprendre = output<void>();

  actif = computed(() => estAbonnementActif(this.abonnement().periodes));
}
