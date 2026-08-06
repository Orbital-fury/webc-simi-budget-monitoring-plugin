import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Abonnement, Categorie, Periode } from '../models/models';
import { AbonnementRecord, CategorieRecord, User } from '../models/pocketbase-models';
import { BudgetApiService } from './budget-api.service';

const pb = new PocketBase('http://127.0.0.1:8090');

// TODO: remplacer par l'id de l'utilisateur authentifié (pb.authStore) une fois l'auth en place.
const USER_ID = '8ytqtzvr12bp2hr';

/** Implémentation de `BudgetApiService` adossée au SDK PocketBase. */
@Injectable()
export class PocketBaseBudgetResource extends BudgetApiService {
  override async getUser(): Promise<User> {
    return await pb.collection<User>('users').getOne(USER_ID);
  }

  //   override async getSalaire(): Promise<number> {
  //     const user = await pb.collection<User>('users').getOne(USER_ID);
  //     return user.salaire;
  //   }

  override async updateSalaire(montant: number): Promise<number> {
    const user = await pb.collection<User>('users').update(USER_ID, { salaire: montant });
    return user.salaire;
  }

  //   override async getBudget(): Promise<number> {
  //     const user = await pb.collection<User>('users').getOne(USER_ID);
  //     return user.budget;
  //   }

  override async updateBudget(montant: number): Promise<number> {
    const user = await pb.collection<User>('users').update(USER_ID, { budget: montant });
    return user.budget;
  }

  override async getAbonnements(): Promise<Abonnement[]> {
    const records = await pb.collection<AbonnementRecord>('abonnements').getFullList({
      filter: `user = "${USER_ID}"`,
      sort: '-created',
      expand: 'categorie',
    });
    return records.map((record) => this.toDomain(record));
  }

  // Update d'abord (cas le plus fréquent : abonnement déjà persisté) ; create en repli
  // sinon, en réutilisant l'id généré côté client pour garder un seul espace d'id.
  override async upsertAbonnement(abonnement: Abonnement): Promise<Abonnement> {
    const data = this.toRecordData(abonnement);
    if (abonnement.id) {
      const updated = await pb
        .collection<AbonnementRecord>('abonnements')
        .update(abonnement.id, data, { expand: 'categorie' });
      return this.toDomain(updated);
    }

    const created = await pb
      .collection<AbonnementRecord>('abonnements')
      .create({ id: abonnement.id, user: USER_ID, ...data }, { expand: 'categorie' });
    return this.toDomain(created);
  }

  override async deleteAbonnement(id: string): Promise<void> {
    await pb.collection('abonnements').delete(id);
  }

  override async updatePeriodesAbonnement(id: string, periodes: Periode[]): Promise<void> {
    await pb.collection('abonnements').update(id, { periodes: this.periodesToRecord(periodes) });
  }

  override async getCategories(): Promise<Categorie[]> {
    const records = await pb.collection<Categorie>('aboCategories').getFullList();
    return records.map((r) => ({ id: r.id, name: r.name, hexaColor: r.hexaColor }));
  }

  override async upsertCategorie(categorie: Categorie): Promise<Categorie> {
    if (categorie.id) {
      const updated = await pb
        .collection<Categorie>('aboCategories')
        .update(categorie.id, { name: categorie.name, hexaColor: categorie.hexaColor });
      return { id: updated.id, name: updated.name, hexaColor: updated.hexaColor };
    }

    const created = await pb
      .collection<Categorie>('aboCategories')
      .create({ name: categorie.name, hexaColor: categorie.hexaColor });
    return { id: created.id, name: created.name, hexaColor: created.hexaColor };
  }

  override async deleteCategorie(id: string): Promise<void> {
    await pb.collection('aboCategories').delete(id);
  }

  private toDomain(record: AbonnementRecord): Abonnement {
    return {
      id: record.id,
      montant: record.montant,
      categorie: this.categorieToDomain(record.expand?.categorie, record.categorie),
      libelle: record.libelle,
      frequence: record.frequence,
      periodes: record.periodes.map((p) => ({
        debut: new Date(p.debut),
        fin: p.fin ? new Date(p.fin) : null,
      })),
    };
  }

  private categorieToDomain(expanded: CategorieRecord | undefined, categorieId: string): Categorie {
    if (expanded) return { id: expanded.id, name: expanded.name, hexaColor: expanded.hexaColor };
    return { id: categorieId, name: '', hexaColor: '' };
  }

  private toRecordData(abonnement: Abonnement) {
    if (!abonnement.categorie.id) {
      throw new Error(
        'Impossible de persister un abonnement sans catégorie enregistrée (id manquant).',
      );
    }
    return {
      montant: abonnement.montant,
      // Champ relation PocketBase : seul l'id de la catégorie est attendu, pas l'objet complet.
      categorie: abonnement.categorie.id,
      libelle: abonnement.libelle,
      frequence: abonnement.frequence,
      periodes: this.periodesToRecord(abonnement.periodes),
    };
  }

  private periodesToRecord(periodes: Periode[]): { debut: string; fin: string | null }[] {
    return periodes.map((p) => ({
      debut: p.debut.toISOString(),
      fin: p.fin ? p.fin.toISOString() : null,
    }));
  }
}
