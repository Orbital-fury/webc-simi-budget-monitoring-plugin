import { Component, computed, inject, signal } from '@angular/core';
import { PluginContext } from '../core/plugin-context';
import { FormatEurosPipe } from '../pipes';
import { BudgetService } from '../services/budget-service';
import { SelectionPeriode } from '../models';

@Component({
  selector: 'app-subscription-widget',
  imports: [FormatEurosPipe],
  templateUrl: './subscription-widget.html',
  styleUrl: './subscription-widget.css',
})
export class SubscriptionWidget {
  context = inject(PluginContext);
  budgetService = inject(BudgetService);

  selectionPeriode = signal<SelectionPeriode>({
    vue: 'mois',
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1,
    date: new Date(),
  });
  depenses = computed(() =>
    this.budgetService.calculerLignesDepenses(
      this.context.abonnements(),
      this.selectionPeriode().vue,
    ),
  );

  totalDepense = computed<number>(() => this.budgetService.sommeLignes(this.depenses()));
}
