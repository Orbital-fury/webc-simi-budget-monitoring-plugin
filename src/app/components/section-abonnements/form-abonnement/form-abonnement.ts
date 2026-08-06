import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Abonnement, Categorie, Frequence } from '../../../models/models';
import { PluginContext } from '../../../core/plugin-context';

interface AbonnementFormModel {
  montant: number | null;
  libelle: string;
  categorie: string;
  frequence: Frequence;
}

@Component({
  selector: 'app-form-abonnement',
  imports: [FormField, FormRoot],
  templateUrl: './form-abonnement.html',
  styleUrl: './form-abonnement.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormAbonnement {
  context = inject(PluginContext);

  abonnement = input<Abonnement>();
  onglet = input.required<Frequence>();

  submit = output<Abonnement>();
  cancel = output<void>();

  categories = linkedSignal<Categorie[]>(() => this.context.categories());

  // Writable state derivée de `abonnement()`, réinitialisée si l'input change (ex. ré-ouverture sur un autre abonnement).
  abonnementModel = linkedSignal<AbonnementFormModel>(() => ({
    montant: this.abonnement()?.montant ?? null,
    libelle: this.abonnement()?.libelle ?? '',
    categorie:
      this.abonnement()?.categorie.id! ??
      this.categories().find((c) => c.name === 'Autre')?.id! ??
      this.categories()[0].id!,
    frequence: this.abonnement()?.frequence ?? this.onglet(),
  }));

  form = form(
    this.abonnementModel,
    (model) => {
      required(model.montant, { message: 'Montant est requis' });
      required(model.libelle, { message: 'Libellé est requis' });
      required(model.categorie, { message: 'Catégorie est requise' });
      required(model.frequence, { message: 'Fréquence est requise' });
    },
    {
      submission: {
        action: async () => this.onSubmit(),
      },
    },
  );

  onSubmit(): void {
    const formData = this.abonnementModel();

    this.submit.emit({
      id: this.abonnement()?.id,
      libelle: formData.libelle,
      montant: Number(formData.montant),
      categorie: this.categories().find((c) => c.id === formData.categorie)!,
      frequence: formData.frequence,
      periodes: this.abonnement()?.periodes ?? [{ debut: new Date(), fin: null }],
    });
  }
}
