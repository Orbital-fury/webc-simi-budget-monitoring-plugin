import { Injectable } from '@angular/core';
import { Abonnement, Categorie, Periode } from '../models/models';
import { User } from '../models/pocketbase-models';

/**
 * Contrat abstrait (token DI) pour l'accès aux données budget. Non fournie via
 * `providedIn` : l'implémentation concrète est branchée explicitement en DI
 * (voir `main.ts`, `{ provide: BudgetApiService, useClass: ... }`).
 */
@Injectable()
export abstract class BudgetApiService {
  abstract getUser(): Promise<User>;
  //   abstract getSalaire(): Promise<number>;
  abstract updateSalaire(montant: number): Promise<number>;
  //   abstract getBudget(): Promise<number>;
  abstract updateBudget(montant: number): Promise<number>;

  abstract getAbonnements(): Promise<Abonnement[]>;
  abstract upsertAbonnement(abonnement: Abonnement): Promise<Abonnement>;
  abstract deleteAbonnement(id: string): Promise<void>;
  abstract updatePeriodesAbonnement(id: string, periodes: Periode[]): Promise<void>;

  abstract getCategories(): Promise<Categorie[]>;
  abstract upsertCategorie(categorie: Categorie): Promise<Categorie>;
  abstract deleteCategorie(id: string): Promise<void>;
}
