import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border bg-muted'>
        <Icon className='h-5 w-5 text-muted-foreground' />
      </div>
      <h3 className='text-sm font-semibold text-foreground mb-1'>{title}</h3>
      {description && (
        <p className='text-sm text-muted-foreground mb-4 max-w-xs'>
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
