import { Component, computed, input } from '@angular/core';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import { ChartData, ChartOptions, DoughnutController, ArcElement, Tooltip } from 'chart.js';
import { couleurCategorie, formatEurosCompact } from '../../../utils/helper';
import { RepartitionDepense } from '../../../models/models';
import { CouleurCategoriePipe, FormatEurosCompactPipe } from '../../../pipes';

@Component({
  selector: 'app-repartition-categories',
  imports: [BaseChartDirective, CouleurCategoriePipe, FormatEurosCompactPipe],
  templateUrl: './repartition-categories.html',
  styleUrl: './repartition-categories.css',
  providers: [provideCharts({ registerables: [DoughnutController, ArcElement, Tooltip] })],
})
export class RepartitionCategories {
  repartition = input.required<RepartitionDepense[]>();

  total = computed<number>(() =>
    this.repartition().reduce((total, depense) => total + depense.montant, 0),
  );

  chartData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.repartition().map((r) => r.categorie),
    datasets: [
      {
        data: this.repartition().map((r) => r.montant),
        // On essaie d'abord les couleurs calculées (thème), sinon on retombe sur les couleurs fixes.
        backgroundColor: this.repartition().map((r) => {
          return couleurCategorie(r.categorie);
        }),
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0)',
        hoverOffset: 6,
      },
    ],
  }));

  chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const valeur = ctx.parsed as number;
            const total = this.total();
            const pct = total > 0 ? Math.round((valeur / total) * 100) : 0;
            return ` ${formatEurosCompact(valeur)} (${pct}%)`;
          },
        },
      },
    },
  }));
}
