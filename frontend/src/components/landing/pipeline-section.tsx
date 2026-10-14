import { Badge } from '@/components/ui/badge'

const STEPS = [
  {
    step: '1',
    title: 'Registro & Parámetros',
    description:
      'Ingresa la URL raíz, define los niveles de profundidad y las reglas de extracción deseadas. Recibes tu clave de acceso al instante.',
  },
  {
    step: '2',
    title: 'Ejecución de Snapshot',
    description:
      'El crawler rastrea de forma asíncrona y distribuida. Audita páginas extraídas, milisegundos de latencia y errores.',
  },
  {
    step: '3',
    title: 'Publicación & Búsqueda',
    description:
      'Publica el snapshot para activarlo como fuente de búsqueda. Tu aplicación frontend o clientes consumen la API al instante.',
  },
]

export function PipelineSection() {
  return (
    <section
      id="arquitectura"
      className="py-20 bg-background border-t border-border"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 font-semibold border-primary/30 text-primary bg-secondary/50"
          >
            Pipeline de Datos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            El ciclo de vida de un sitio
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            De la URL raíz al buscador indexado en tu plataforma en tres simples
            pasos.
          </p>
        </div>

        {/* Pasos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs hover:border-accent transition-colors relative z-10"
            >
              <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground font-extrabold text-xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-primary/25">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
