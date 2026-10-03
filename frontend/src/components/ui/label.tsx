import { cn } from 'cn'
import type * as React from 'react'

function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Primitive wrapper receiving htmlFor and controls at usage site
    <label
      data-slot="label"
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground',
        className
      )}
      {...props}
    />
  )
}

export { Label }
