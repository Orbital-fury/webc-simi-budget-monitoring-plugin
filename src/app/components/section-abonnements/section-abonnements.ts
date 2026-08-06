import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormAbonnement } from './form-abonnement/form-abonnement';
import { PluginContext } from '../../core/plugin-context';
import { Abonnement, Frequence, Periode } from '../../models/models';
import { FormatEurosPipe } from '../../pipes';
import { estAbonnementActif } from '../../utils/helper';
import { CarteAbonnement } from './carte-abonnement/carte-abonnement';

@Component({
  selector: 'app-section-abonnements',
  imports: [FormatEurosPipe, CarteAbonnement, FormAbonnement],
  templateUrl: './section-abonnements.html',
  styleUrl: './section-abonnements.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SectionAbonnements {
  context = inject(PluginContext);

  onglet = signal<Frequence>('mensuel');
  isAddEditAboOpen = signal<boolean>(false);
  aEditer = signal<Abonnement | undefined>(undefined);
  aSupprimer = signal<Abonnement | null>(null);

  abonnementsMensuels = computed(() =>
    this.context.abonnements().filter((a) => a.frequence === 'mensuel'),
  );
  abonnementsAnnuels = computed(() =>
    this.context.abonnements().filter((a) => a.frequence === 'annuel'),
  );

  totalMensuel = computed(() =>
    this.abonnementsMensuels()
      .filter((a) => estAbonnementActif(a.periodes))
      .reduce((s, a) => s + a.montant, 0),
  );
  totalAnnuel = computed(() =>
    this.abonnementsAnnuels()
      .filter((a) => estAbonnementActif(a.periodes))
      .reduce((s, a) => s + a.montant, 0),
  );

  listeCourante = computed(() =>
    this.onglet() === 'mensuel' ? this.abonnementsMensuels() : this.abonnementsAnnuels(),
  );

  changeTab(event: any): void {
    event.detail.activeIndex === 0 ? this.onglet.set('mensuel') : this.onglet.set('annuel');
  }

  ouvrirAjout(): void {
    this.isAddEditAboOpen.set(true);
  }

  ouvrirEdition(a: Abonnement): void {
    this.aEditer.set(a);
    this.isAddEditAboOpen.set(true);
  }

  closeAddEditModal(): void {
    this.aEditer.set(undefined);
    this.isAddEditAboOpen.set(false);
  }

  enregistrerAbonnement(a: Abonnement): void {
    this.context.upsertAbonnement(a).then(() => this.closeAddEditModal());
  }

  confirmerSuppression(): void {
    if (this.aSupprimer()) {
      this.context.supprimerAbonnement(this.aSupprimer()!.id!).then(() => {
        this.aSupprimer.set(null);
      });
    }
  }

  arreter(periodes: Periode[]): Periode[] {
    const aujourd = new Date();
    return periodes.map((p) => (p.fin === null ? { ...p, fin: aujourd } : p));
  }

  reprendre(periodes: Periode[]): Periode[] {
    const aujourd = new Date();
    return [...periodes, { debut: aujourd, fin: null }];
  }

  arreterAbonnement(id: string): void {
    this.context.modifierPeriodesAbonnement(id, (periodes) => this.arreter(periodes));
  }

  reprendreAbonnement(id: string): void {
    this.context.modifierPeriodesAbonnement(id, (periodes) => this.reprendre(periodes));
  }
}
