import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { PluralPipe } from '../../pipes/plural-pipe';
import { TextoCortoPipe } from '../../pipes/texto-corto-pipe';
import { EstadisticasService } from '../../services/estadisticas';
import { Modal } from '../../services/modal';
import IDato from '../../interfaces/Dato';

// chart.js trae cada tipo de gráfico por separado: así quedan disponibles barras, líneas y torta.
Chart.register(...registerables);

// AAAA-MM-DD en la hora local (toISOString usaría UTC y a la noche ya sería "mañana").
const fechaHaceDias = (dias: number) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha.toLocaleDateString('en-CA');
};

@Component({
  imports: [PluralPipe],
  selector: 'app-panel-estadisticas',
  styleUrl: './panel-estadisticas.css',
  templateUrl: './panel-estadisticas.html',
})
export class PanelEstadisticas {
  servicio = inject(EstadisticasService);
  modal = inject(Modal);

  // Cada gráfico guarda su propio lapso: el enunciado pide poder elegirlo en cada uno. Arranca en los últimos 30 días.
  graficos = [
    { titulo: 'Historias por usuario', ruta: 'publicaciones-por-usuario', tipo: 'bar', unidad: 'historia', desde: fechaHaceDias(30), hasta: fechaHaceDias(0) },
    { titulo: 'Comentarios por día', ruta: 'comentarios-por-dia', tipo: 'line', unidad: 'comentario', desde: fechaHaceDias(30), hasta: fechaHaceDias(0) },
    { titulo: 'Comentarios por historia', ruta: 'comentarios-por-publicacion', tipo: 'pie', unidad: 'comentario', desde: fechaHaceDias(30), hasta: fechaHaceDias(0) },
  ];
  elegido = signal(0);
  datos = signal<IDato[]>([]);
  // cargando, listo o error
  estado = signal('cargando');
  suscripcion?: Subscription;

  ngOnInit() {
    this.cargar();
  }

  grafico() {
    return this.graficos[this.elegido()];
  }

  elegir(indice: number) {
    this.elegido.set(indice);
    this.cargar();
  }

  cambiarLapso(desde: string, hasta: string) {
    // Con una fecha borrada no hay lapso para pedir.
    if (!desde || !hasta) return;
    this.grafico().desde = desde;
    this.grafico().hasta = hasta;
    this.cargar();
  }

  cargar() {
    const grafico = this.grafico();
    this.estado.set('cargando');
    // Si se cambia de gráfico antes de que llegue la respuesta anterior, esa ya no interesa.
    this.suscripcion?.unsubscribe();
    this.suscripcion = this.servicio.traer(grafico.ruta, grafico.desde, grafico.hasta).subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.estado.set('listo');
        this.dibujar();
      },
      error: (error) => {
        this.estado.set('error');
        this.modal.errorHttp(error, 'No pudimos traer las estadísticas');
      },
    });
  }

  total() {
    return this.datos().reduce((suma, dato) => suma + dato.cantidad, 0);
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
    this.chart?.destroy();
  }

  // ===== Visual: dibujo del gráfico con chart.js. =====

  lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  chart?: Chart;

  dibujar() {
    this.chart?.destroy();
    const grafico = this.grafico();
    const datos = this.datos();
    const css = getComputedStyle(document.documentElement);
    const color = (variable: string) => css.getPropertyValue(variable).trim();
    // Colores de marcador de pizarra: azul, rojo y verde primero.
    const paleta = ['--tinta-pizarra', '--tinta-birome', '--tinta-pizarra-verde', '--brasa', '--tinta-enlace', '--tinta-pizarra-suave', '--madera', '--madera-clara'].map(color);
    // Las barras son azules y la línea roja, como dos marcadores distintos.
    const marcador = grafico.tipo === 'line' ? color('--tinta-birome') : color('--tinta-pizarra');
    const corto = new TextoCortoPipe();

    Chart.defaults.color = color('--tinta-pizarra');
    Chart.defaults.borderColor = color('--linea-pizarra');
    Chart.defaults.font.family = color('--fuente-pizarra');
    const configuracion: any = {
      type: grafico.tipo,
      data: {
        // En la línea, los días van como DD/MM; en la torta, los títulos largos se recortan para que entre la leyenda.
        labels: datos.map((dato) =>
          grafico.tipo === 'line' ? dato.etiqueta.slice(8, 10) + '/' + dato.etiqueta.slice(5, 7) : corto.transform(dato.etiqueta, 26),
        ),
        datasets: [
          {
            label: grafico.titulo,
            data: datos.map((dato) => dato.cantidad),
            // Trazo grueso y casi sin relleno, como dibujado con marcador; la torta sí va pintada para distinguir las porciones.
            backgroundColor:
              grafico.tipo === 'pie' ? datos.map((_, i) => paleta[i % paleta.length]) : grafico.tipo === 'bar' ? color('--relleno-pizarra') : marcador,
            borderColor: grafico.tipo === 'pie' ? color('--malvavisco-relleno') : marcador,
            borderWidth: grafico.tipo === 'pie' ? 2 : 3,
            pointRadius: 3,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: grafico.tipo === 'pie', position: 'right' } },
      },
    };
    if (grafico.tipo !== 'pie') {
      configuracion.options.scales = { y: { beginAtZero: true, ticks: { precision: 0 } } };
    }
    this.chart = new Chart(this.lienzo().nativeElement, configuracion);
  }
}
