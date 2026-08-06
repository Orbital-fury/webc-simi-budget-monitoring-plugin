import { Service, signal } from '@angular/core';

import { Abonnement, Periode } from '../models/models';
import type { PluginStorage } from './plugin-contract';

// const SELECTED_PLAN_KEY = 'selected-plan-id';
const SALAIRE_KEY = 'salaire';
const BUDGET_KEY = 'budget';
const ABONNEMENTS_KEY = 'abonnements';

/**
 * Etat et dependances partagees par les 3 vues (equivalent du "store" cote
 * plugin vanilla) : URL de base des assets, et facade de stockage cloisonne
 * (Dexie/IndexedDB) recue du Hub via l'`@Input() storage` du composant racine.
 *
 * `@Service()` (root-provided) : chaque `<subscription-page>` monte via
 * `createCustomElement` obtient sa PROPRE application Angular (creee dans
 * `main.ts` via `createApplication`), donc son propre injecteur racine — cet
 * etat reste isole par instance de plugin, sans fuite ni collision avec le
 * reste de la page (Hub inclus).
 */
@Service()
export class PluginContext {
  /** Incremente a chaque retour au premier plan (`visibilitychange`) - voir `SubscriptionPageRoot`. */
  readonly visibilityTick = signal(0);

  readonly salaire = signal<number>(0);
  readonly budget = signal<number>(0);
  readonly abonnements = signal<Abonnement[]>([]);

  private storage: PluginStorage | undefined;

  notifyVisible(): void {
    this.visibilityTick.update((tick) => tick + 1);
  }

  /**
   * Appelé au montage du Web Component pour injecter le stockage et charger les données initiales.
   */
  async setStorage(storage: PluginStorage | undefined): Promise<void> {
    this.storage = storage;
    await this.initFromStorage();
  }

  // 2. Méthodes de mise à jour (Mise à jour réactive + Sauvegarde)
  async updateSalaire(nouveauSalaire: number): Promise<void> {
    this.salaire.set(nouveauSalaire);
    await this.saveKey(SALAIRE_KEY, nouveauSalaire);
  }

  async updateBudget(nouveauBudget: number): Promise<void> {
    this.budget.set(nouveauBudget);
    await this.saveKey(BUDGET_KEY, nouveauBudget);
  }

  async updateAbonnements(nouveauxAbonnements: Abonnement[]): Promise<void> {
    this.abonnements.set(nouveauxAbonnements);
    await this.saveKey(ABONNEMENTS_KEY, nouveauxAbonnements);
  }

  /** Applique une transformation aux périodes d'un abonnement (arrêt/reprise) et persiste le résultat. */
  async modifierPeriodesAbonnement(
    id: string,
    transform: (periodes: Periode[]) => Periode[],
  ): Promise<void> {
    console.log(`[PluginContext] modifierPeriodesAbonnement(${id})`);
    const abonnements = this.abonnements();
    const index = abonnements.findIndex((a) => a.id === id);
    if (index === -1) return;
    const nouveaux = [...abonnements];
    nouveaux[index] = { ...nouveaux[index], periodes: transform(abonnements[index].periodes) };
    await this.updateAbonnements(nouveaux);
  }

  async supprimerAbonnement(id: string): Promise<void> {
    const abonnements = this.abonnements();
    const nouveaux = abonnements.filter((a) => a.id !== id);
    if (nouveaux.length === abonnements.length) return;
    await this.updateAbonnements(nouveaux);
  }

  /** Ajoute un nouvel abonnement, ou remplace celui existant si son `id` est déjà présent. */
  async upsertAbonnement(abonnement: Abonnement): Promise<void> {
    const abonnements = this.abonnements();
    const index = abonnements.findIndex((a) => a.id === abonnement.id);
    const nouveaux =
      index === -1
        ? [...abonnements, abonnement]
        : abonnements.map((a, i) => (i === index ? abonnement : a));
    await this.updateAbonnements(nouveaux);
  }

  /**
   * Charge les données initiales depuis IndexedDB/Memory dans les Signaux.
   */
  private async initFromStorage(): Promise<void> {
    if (!this.storage) return;

    try {
      const [s, b, a] = await Promise.all([
        this.storage.get<number>(SALAIRE_KEY),
        this.storage.get<number>(BUDGET_KEY),
        this.storage.get<Abonnement[]>(ABONNEMENTS_KEY),
      ]);

      if (s !== undefined) this.salaire.set(s);
      if (b !== undefined) this.budget.set(b);
      if (a !== undefined) this.abonnements.set(a);
    } catch (error) {
      console.warn('[subscription-page] Erreur chargement initial storage.', error);
    }
  }

  private async saveKey(key: string, value: unknown): Promise<void> {
    if (!this.storage) return;
    try {
      await this.storage.set(key, value);
    } catch (error) {
      console.warn(`[subscription-page] Écriture de ${key} indisponible.`, error);
    }
  }
}
