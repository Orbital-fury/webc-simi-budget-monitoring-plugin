import { LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

import { SubscriptionPageRoot } from './app/subscription-page-root';
import { SubscriptionWidget } from './app/subscription-widget/subscription-widget';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

const PAGE_ELEMENT = 'subscription-page';
const WIDGET_ELEMENT = 'subscription-widget';

registerLocaleData(localeFr);

async function registerElement(): Promise<void> {
  if (customElements.get(PAGE_ELEMENT)) {
    return;
  }

  // Chaque instance de <subscription-page> obtient sa propre application
  // Angular (injecteur racine isole), plutot que de partager une seule
  // application globale bootstrappee sur <app-root> - conforme au
  // fonctionnement du Hub qui peut (dis)monter le plugin dynamiquement.
  const app = await createApplication({
    providers: [provideZonelessChangeDetection(), { provide: LOCALE_ID, useValue: 'fr-FR' }],
  });

  const SubscriptionPageElement = createCustomElement(SubscriptionPageRoot, {
    injector: app.injector,
  });

  const SubscriptionWidgetElement = createCustomElement(SubscriptionWidget, {
    injector: app.injector,
  });

  customElements.define(PAGE_ELEMENT, SubscriptionPageElement);
  customElements.define(WIDGET_ELEMENT, SubscriptionWidgetElement);
}

void registerElement().catch((err) => console.error(err));
