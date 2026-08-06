import { Service, inject, signal } from '@angular/core';

import { Abonnement, Categorie, Periode } from '../models/models';
import { BudgetApiService } from '../services/budget-api.service';

/**
 * Etat et dependances partagees par les 3 vues (equivalent du "store" cote
 * plugin vanilla) : facade reactive (Signaux) au-dessus de `BudgetApiService`
 * (PocketBase), avec chargement initial et mutations synchronisees.
 *
 * `@Service()` (root-provided) : chaque `<subscription-page>` monte via
 * `createCustomElement` obtient sa PROPRE application Angular (creee dans
 * `main.ts` via `createApplication`), donc son propre injecteur racine — cet
 * etat reste isole par instance de plugin, sans fuite ni collision avec le
 * reste de la page (Hub inclus).
 */
@Service()
export class PluginContext {
  private readonly api = inject(BudgetApiService);

  /** Incremente a chaque retour au premier plan (`visibilitychange`) - voir `SubscriptionPageRoot`. */
  readonly visibilityTick = signal(0);

  readonly salaire = signal<number>(0);
  readonly budget = signal<number>(0);
  readonly abonnements = signal<Abonnement[]>([]);
  readonly categories = signal<Categorie[]>([]);

  constructor() {
    void this.initData();
  }

  notifyVisible(): void {
    this.visibilityTick.update((tick) => tick + 1);
  }

  async updateSalaire(nouveauSalaire: number): Promise<void> {
    const salaire = await this.api.updateSalaire(nouveauSalaire);
    this.salaire.set(salaire);
  }

  async updateBudget(nouveauBudget: number): Promise<void> {
    const budget = await this.api.updateBudget(nouveauBudget);
    this.budget.set(budget);
  }

  /** Applique une transformation aux périodes d'un abonnement (arrêt/reprise) et persiste le résultat. */
  async modifierPeriodesAbonnement(
    id: string,
    transform: (periodes: Periode[]) => Periode[],
  ): Promise<void> {
    const abonnements = this.abonnements();
    const index = abonnements.findIndex((a) => a.id === id);
    if (index === -1) return;
    const nouvellesPeriodes = transform(abonnements[index].periodes);
    await this.api.updatePeriodesAbonnement(id, nouvellesPeriodes);
    const nouveaux = [...abonnements];
    nouveaux[index] = { ...nouveaux[index], periodes: nouvellesPeriodes };
    this.abonnements.set(nouveaux);
  }

  async supprimerAbonnement(id: string): Promise<void> {
    await this.api.deleteAbonnement(id);
    this.abonnements.set(this.abonnements().filter((a) => a.id !== id));
  }

  /** Ajoute un nouvel abonnement, ou remplace celui existant si son `id` est déjà présent. */
  async upsertAbonnement(abonnement: Abonnement): Promise<void> {
    const saved = await this.api.upsertAbonnement(abonnement);
    const abonnements = this.abonnements();
    const index = abonnements.findIndex((a) => a.id === saved.id);
    const nouveaux =
      index === -1 ? [...abonnements, saved] : abonnements.map((a, i) => (i === index ? saved : a));
    this.abonnements.set(nouveaux);
  }

  /** Charge les données initiales (salaire, budget, abonnements) depuis PocketBase dans les Signaux. */
  private async initData(): Promise<void> {
    try {
      const [user, abonnements, categories] = await Promise.all([
        this.api.getUser(),
        this.api.getAbonnements(),
        this.api.getCategories(),
      ]);
      this.salaire.set(user.salaire);
      this.budget.set(user.budget);
      this.abonnements.set(abonnements);
      this.categories.set(categories);
    } catch (error) {
      console.warn('[PluginContext] Erreur chargement initial des données.', error);
    }
  }
}
