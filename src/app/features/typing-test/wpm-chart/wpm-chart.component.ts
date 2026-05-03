import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { WpmSnapshot } from '../../../core/models/typing.models';
import Chart, { TooltipItem } from 'chart.js/auto';

@Component({
  selector: 'app-wpm-chart',
  standalone: true,
  template: `
    <div class="chart-card">
      <div class="chart-header">
        <span class="chart-label">WORDS PER MINUTE</span>
        <div class="chart-legend">
          <span class="legend-item">
            <span class="legend-dot wpm-dot"></span>WPM
          </span>
          <span class="legend-item">
            <span class="legend-dot error-dot"></span>Error
          </span>
          <span class="legend-item">
            <span class="legend-dot mod-dot"></span>Modifications
          </span>
        </div>
      </div>
      <div class="chart-body">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
  styleUrl: './wpm-chart.component.css',
})
export class WpmChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() history: WpmSnapshot[] = [];
  @Input() timeLimit: number = 60;

  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnChanges(): void {
    if (this.chart) this.updateChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private processData() {
    const lineData: { x: number; y: number }[] = [];
    const errorPoints: { x: number; y: number }[] = [];
    const modPoints: { x: number; y: number }[] = [];

    for (const snap of this.history) {
      lineData.push({ x: snap.second, y: snap.wpm });
      if (snap.errors > 0) errorPoints.push({ x: snap.second, y: snap.wpm });
      if (snap.modifications > 0)
        modPoints.push({ x: snap.second, y: snap.wpm });
    }

    return { lineData, errorPoints, modPoints };
  }

  private buildChart(): void {
    const canvas = this.canvasRef.nativeElement;
    const { lineData, errorPoints, modPoints } = this.processData();

    this.chart = new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'WPM',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: 'line' as any,
            data: lineData,
            borderColor: '#7c5cbf',
            backgroundColor: 'rgba(124, 92, 191, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
            order: 3,
          },
          {
            label: 'Error',
            data: errorPoints,
            backgroundColor: '#dc3545',
            borderColor: 'transparent',
            pointRadius: 6,
            pointHoverRadius: 8,
            order: 1,
          },
          {
            label: 'Modifications',
            data: modPoints,
            backgroundColor: '#ffa500',
            borderColor: 'transparent',
            pointRadius: 6,
            pointHoverRadius: 8,
            order: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        scales: {
          x: {
            type: 'linear',
            min: 0,
            max: this.timeLimit,
            ticks: {
              stepSize: 5,
              color: '#888',
              font: { size: 11 },
            },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.1)' },
          },
          y: {
            min: 0,
            ticks: {
              stepSize: 20,
              color: '#888',
              font: { size: 11 },
            },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.1)', dash: [4, 4] },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items: TooltipItem<'scatter'>[]) =>
                `Second ${items[0].label}`,
              label: (item: TooltipItem<'scatter'>) =>
                ` ${item.dataset.label}: ${item.formattedValue}`,
            },
          },
        },
      },
    });
  }

  private updateChart(): void {
    if (!this.chart) return;
    const { lineData, errorPoints, modPoints } = this.processData();
    this.chart.data.datasets[0].data = lineData;
    this.chart.data.datasets[1].data = errorPoints;
    this.chart.data.datasets[2].data = modPoints;
    (this.chart.options.scales!['x'] as any).max = this.timeLimit;
    this.chart.update();
  }
}
