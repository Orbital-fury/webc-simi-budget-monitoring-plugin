import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { PluginContext } from '../../core/plugin-context';
import type { RepartitionDepense, SelectionPeriode } from '../../models/models';
import { FormatEurosPipe } from '../../pipes';
import { BudgetService } from '../../services/budget-service';
import { RepartitionCategories } from './repartition-categories/repartition-categories';
import { SelecteurPeriode } from './selecteur-periode/selecteur-periode';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-section-suivi',
  imports: [SelecteurPeriode, RepartitionCategories, FormatEurosPipe, DatePipe, TitleCasePipe],
  templateUrl: './section-suivi.html',
  styleUrl: './section-suivi.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SectionSuivi {
  private readonly context = inject(PluginContext);
  budgetService = inject(BudgetService);

  salaire = this.context.salaire;
  budget = this.context.budget;
  depenses = computed(() =>
    this.budgetService.calculerLignesDepenses(
      this.context.abonnements(),
      this.selectionPeriode().vue,
    ),
  );

  selectionPeriode = signal<SelectionPeriode>({
    vue: 'mois',
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1,
    date: new Date(),
  });

  totalDepense = computed<number>(() => this.budgetService.sommeLignes(this.depenses()));
  solde = computed<number>(() => this.salaire() - this.totalDepense());
  referenceBudget = computed<number>(() =>
    this.selectionPeriode().vue === 'mois' ? this.totalDepense() : this.totalDepense() / 12,
  );
  progressionBudget = computed<number>(() =>
    this.budget() > 0 ? (this.referenceBudget() / this.budget()) * 100 : 0,
  );
  pourcentageBudget = computed<number>(() => Math.round(this.progressionBudget()));

  largeurBarre = computed<string>(() => `${Math.min(this.progressionBudget(), 100)}%`);

  repartitionDepenses = computed<RepartitionDepense[]>(() =>
    this.context
      .categories()
      .map((categorie) => ({
        categorie,
        montant: this.depenses()
          .filter((depense) => depense.categorie.id! === categorie.id!)
          .reduce((total, depense) => total + depense.montant, 0),
      }))
      .filter((r) => r.montant > 0),
  );
}
