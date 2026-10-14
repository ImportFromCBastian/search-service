import {
  Activity,
  Boxes,
  Database,
  Globe2,
  Layers,
  Sparkles,
} from 'lucide-react'

const CLIENTS = [
  { name: 'FinTech Cloud', icon: Layers },
  { name: 'DataStream AI', icon: Database },
  { name: 'GlobalCorp Logistics', icon: Globe2 },
  { name: 'OmniSearch Systems', icon: Sparkles },
  { name: 'Nexora HealthTech', icon: Activity },
  { name: 'Enterprise Scale Labs', icon: Boxes },
]

function MarqueeItem({ name, icon: Icon }: (typeof CLIENTS)[number]) {
  return (
    <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-muted-foreground/80 hover:text-foreground transition-colors cursor-default">
      <Icon className="h-5 w-5 stroke-[2.2] text-primary" />
      <span>{name}</span>
    </div>
  )
}

export function ClientMarquee() {
  return (
    <section className="border-y border-border bg-muted/40 py-5 overflow-hidden">
      <div className="marquee-mask w-full overflow-hidden">
        <div className="flex w-max gap-12 sm:gap-16 animate-marquee">
          {/* Renderizado declarativo en 2 tandas sin duplicación de JSX */}
          {[0, 1].map((copyIndex) => (
            <div
              key={`marquee-group-${copyIndex}`}
              className="flex gap-12 sm:gap-16 items-center"
            >
              {CLIENTS.map((client) => (
                <MarqueeItem
                  key={`${copyIndex}-${client.name}`}
                  name={client.name}
                  icon={client.icon}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
