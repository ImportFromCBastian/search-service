import Link from 'next/link'
import { ReactNode } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

interface ConfigCardProps {
  title: string
  description: string
  icon: ReactNode
  href: string
}

export function ConfigCard({
  title,
  description,
  icon,
  href,
}: ConfigCardProps) {
  return (
    <Link
      href={href}
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="h-full transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="p-2 bg-primary/10 rounded-md text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {icon}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="group-hover:text-accent-foreground/70">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
