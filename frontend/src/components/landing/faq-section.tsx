import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const FAQS = [
  {
    question:
      '¿Cómo se garantiza la seguridad y estabilidad durante la extracción de datos?',
    answer:
      'Los procesos de rastreo y extracción de contenido se ejecutan en entornos completamente aislados (sandboxes) con límites estrictos de recursos. Esto garantiza que ningún script o página web de terceros pueda comprometer la infraestructura ni la privacidad de tus datos.',
  },
  {
    question:
      '¿Qué sucede si ejecuto un nuevo snapshot mientras hay usuarios buscando?',
    answer:
      'El servicio garantiza cero downtime. Los usuarios continúan consultando el último Snapshot Publicado de manera inalterada. El nuevo snapshot se procesa de forma aislada y solo reemplaza al activo cuando tú decides publicarlo explícitamente.',
  },
  {
    question: '¿Cómo se manejan las API Keys y la seguridad de los datos?',
    answer:
      'Al crear o regenerar la clave de un sitio, el sistema muestra la API Key en texto plano (ej. sk_live_...) una única vez. En la base de datos solo se almacena un hash criptográfico y un prefijo enmascarado (sk_live_1234****). Si se pierde, puede regenerarse inmediatamente invalidando la clave anterior.',
  },
  {
    question:
      '¿Puedo cancelar un snapshot que está tardando o archivar snapshots viejos?',
    answer:
      'Sí. La consola de snapshots permite cancelar ejecuciones en curso en tiempo real y ofrece acciones por lote (batch actions) para archivar, desarchivar o eliminar permanentemente conjuntos de snapshots sin afectar la navegación del usuario.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-20 bg-muted/30 border-t border-border">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge
            variant="outline"
            className="mb-3 px-3 py-1 font-semibold border-primary/30 text-primary bg-secondary/50"
          >
            Centro de Ayuda
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Preguntas Frecuentes
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Todo lo que necesitas saber sobre el funcionamiento, seguridad y
            arquitectura.
          </p>
        </div>

        {/* Acordeones con <details name="faq"> */}
        <div className="space-y-3.5">
          {FAQS.map((faq, index) => (
            <details
              key={faq.question}
              name="faq"
              open={index === 0 ? true : undefined}
              className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-accent"
            >
              <summary className="flex cursor-pointer items-center justify-between p-5 sm:p-6 font-semibold text-foreground text-base select-none list-none">
                <span>{faq.question}</span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-transform duration-200 group-open:rotate-45">
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <div className="px-5 pb-6 sm:px-6 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
