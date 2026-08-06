import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CarteSaisieNombre } from './components/carte-saisie-nombre/carte-saisie-nombre';

import { SectionSuivi } from './components/section-suivi/section-suivi';
import { PluginContext } from './core/plugin-context';
import { PLUGIN_ACTION_EVENT, type ToastVariant } from './core/plugin-contract';
import { SectionAbonnements } from './components/section-abonnements/section-abonnements';

/**
 * Composant racine du plugin, instancie par Angular Elements
 * (`createCustomElement`, voir `main.ts`) sous le tag `<subscription-page>`.
 *
 * `ViewEncapsulation.ShadowDom` recree la meme isolation CSS que la version
 * vanilla (un vrai Shadow DOM attache par Angular lui-meme). Le reste du
 * cycle de vie (nettoyage des ecouteurs de template, du host listener
 * `document:visibilitychange`...) est pris en charge automatiquement par
 * Angular a la destruction du composant (`disconnectedCallback` genere par
 * Angular Elements appelle `componentRef.destroy()`) : pas de code de
 * nettoyage manuel a ecrire pour ces cas-la, contrairement a la version
 * vanilla. Seul le `setInterval` du dashboard (voir `DashboardView`) reste a
 * nettoyer explicitement, car ce n'est pas un mecanisme gere par Angular.
 */
@Component({
  selector: 'app-subscription-page-root',
  imports: [CarteSaisieNombre, SectionSuivi, SectionAbonnements],
  templateUrl: './subscription-page-root.html',
  styleUrl: './subscription-page-root.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '(document:visibilitychange)': 'onVisibilityChange()',
  },
})
export class SubscriptionPageRoot {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly context = inject(PluginContext);

  salaire = this.context.salaire;
  budget = this.context.budget;

  protected onBudget(budget: number) {
    this.context.updateBudget(budget);
  }
  protected onSalaire(salaire: number) {
    this.context.updateSalaire(salaire);
  }

  protected onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.context.notifyVisible();
    }
  }

  protected onChildToast(payload: { message: string; variant?: ToastVariant }): void {
    this.dispatch(PLUGIN_ACTION_EVENT, {
      type: 'toast',
      payload: { message: payload.message, variant: payload.variant ?? 'info' },
    });
  }

  /**
   * Dispatch manuel (plutot que de s'appuyer sur le mapping automatique des
   * `@Output()` d'Angular Elements) pour garder un controle explicite sur
   * `bubbles`/`composed`, exactement comme l'exige le contrat du Hub.
   */
  private dispatch(type: string, detail: unknown): void {
    this.elementRef.nativeElement.dispatchEvent(
      new CustomEvent(type, { bubbles: true, composed: true, detail }),
    );
  }
}
