/** Catégories de dépenses disponibles dans l'application. */
export interface Categorie {
  id?: string;
  name: string;
  hexaColor: string;
}

/** Fréquence de facturation d'un abonnement récurrent. */
export type Frequence = 'mensuel' | 'annuel';

/**
 * Intervalle d'activité d'un abonnement.
 * - `debut` : date de début (incluse).
 * - `fin` : date de fin (incluse) ou `null` tant que l'abonnement est actif.
 */
export interface Periode {
  debut: Date;
  fin: Date | null;
}

/** Élément de dépense agrégé pour l'affichage (liste + camembert). */
export interface LigneDepense {
  id: string;
  libelle: string;
  categorie: Categorie;
  /** Montant converti dans la période vue (prorata appliqué pour les abonnements). */
  montant: number;
  /** Type d'origine, pour différencier l'affichage. */
  type: 'ponctuelle' | 'abonnement';
}

export interface SelectionPeriode {
  vue: 'mois' | 'annee';
  annee: number;
  mois: number;
  date: Date;
}

export interface RepartitionDepense {
  categorie: Categorie;
  montant: number;
}

/** Abonnement récurrent (mensuel ou annuel), avec historique des périodes d'activité. */
export interface Abonnement {
  id?: string;
  /** Montant facturé SELON la fréquence (mensuel = par mois, annuel = par an). */
  montant: number;
  categorie: Categorie;
  libelle: string;
  frequence: Frequence;
  /** Historique des périodes d'activité (au moins une). La dernière peut être ouverte. */
  periodes: Periode[];
}

/** Vue de période sélectionnée par l'utilisateur. */
export type VueMode = 'mois' | 'annee';

/** Borne d'une période de vue (mois ou année). */
export interface BornePeriode {
  debut: string;
  fin: string;
  /** Nombre total de jours de la période (pour le calcul du prorata). */
  nbJours: number;
}
