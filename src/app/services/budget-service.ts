import { Service } from '@angular/core';
import { Abonnement, LigneDepense, Periode, VueMode } from '../models/models';

@Service()
export class BudgetService {
  /** Agrège toutes les contributions (ponctuelles + abonnements) en lignes de dépense. */
  calculerLignesDepenses(
    abonnements: Abonnement[],
    vue: VueMode,
    // borne: BornePeriode,
  ): LigneDepense[] {
    const lignesAbonnements: LigneDepense[] = abonnements
      .map((a) => ({
        id: a.id,
        libelle: a.libelle,
        categorie: a.categorie,
        montant: this.contributionAbonnement(a, vue),
        type: 'abonnement' as const,
      }))
      .filter((l) => l.montant > 0);

    return lignesAbonnements;
  }

  /** Somme des montants d'une liste de lignes de dépense. */
  sommeLignes(lignes: LigneDepense[]): number {
    return lignes.reduce((total, ligne) => total + ligne.montant, 0);
  }

  /**
   * Contribution d'un abonnement à la période vue, en appliquant le prorata temporis :
   *   contribution = baseMontant × (joursActifs / nbJours)
   *
   * - Suspendu sur toute la période -> joursActifs = 0 -> contribution = 0.
   * - Actif toute la période -> contribution = baseMontant.
   */
  contributionAbonnement(
    abonnement: Abonnement,
    vue: VueMode,
    // borne: BornePeriode,
  ): number {
    const base = this.convertirMontantAbonnement(abonnement, vue);
    if (base <= 0) return 0;
    // const joursActifs = this.joursActifsDans(abonnement.periodes, borne.debut, borne.fin);
    // if (joursActifs <= 0) return 0;
    // if (joursActifs >= borne.nbJours) return base;
    // return base * (joursActifs / borne.nbJours);
    return base;
  }

  /**
   * Convertit le montant "réel" d'un abonnement vers la valeur vue dans la période.
   * Tableau de conversion de base :
   *   - mensuel : vue MOIS -> montant ; vue ANNÉE -> montant × 12
   *   - annuel  : vue MOIS -> montant / 12 ; vue ANNÉE -> montant
   */
  convertirMontantAbonnement(abonnement: Abonnement, vue: VueMode): number {
    if (abonnement.frequence === 'mensuel') {
      return vue === 'mois' ? abonnement.montant : abonnement.montant * 12;
    }
    // annuel
    return vue === 'mois' ? abonnement.montant / 12 : abonnement.montant;
  }

  /**
   * Nombre total de jours d'activité d'un abonnement sur une fenêtre `[debutP, finP]`.
   * Somme des intersections de chaque période avec la fenêtre (bornes incluses).
   */
  joursActifsDans(periodes: Periode[], debutP: Date, finP: Date): number {
    return periodes.reduce((total, p) => total + this.intersectionJours(p, debutP, finP), 0);
  }

  /**
   * Intersection (en jours inclusifs) entre une période et une fenêtre `[d, f]`.
   * Retourne le nombre de jours de chevauchement, ou 0 si aucune intersection.
   */
  intersectionJours(periode: Periode, debutFenetre: Date, finFenetre: Date): number {
    const debut = periode.debut > debutFenetre ? periode.debut : debutFenetre;
    const finBrute = periode.fin ?? new Date();
    const fin = finBrute < finFenetre ? finBrute : finFenetre;
    if (fin < debut) return 0;
    return this.nbJoursEntre(debut, fin);
  }

  /**
   * Nombre de jours ENTRE deux dates (inclusives aux deux bornes).
   * Exemple : du 2024-01-01 au 2024-01-31 -> 31 jours.
   */
  nbJoursEntre(debut: Date, fin: Date): number {
    if (fin < debut) return 0;
    const msParJour = 1000 * 60 * 60 * 24;
    return Math.round((fin.getTime() - debut.getTime()) / msParJour) + 1;
  }
}
