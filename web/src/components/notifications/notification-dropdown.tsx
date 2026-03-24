import { notificationsApi } from '@/api'
import type { Notification } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { ScrollArea } from '../ui/scroll-area'

function NotificationItem({
  notif,
  onRead,
}: {
  notif: Notification
  onRead: (id: string) => void
}) {
  return (
    <div
      className={`flex gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-muted/30' : ''}`}
      onClick={() => !notif.isRead && onRead(notif.id)}
    >
      <div
        className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-primary' : 'bg-transparent'}`}
      />
      <div className='flex-1 min-w-0'>
        <p className='text-sm text-foreground leading-snug'>{notif.message}</p>
        <p className='text-xs text-muted-foreground mt-1'>
          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notif.isRead && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRead(notif.id)
          }}
          className='text-muted-foreground hover:text-foreground shrink-0 mt-0.5'
        >
          <Check className='h-3.5 w-3.5' />
        </button>
      )}
    </div>
  )
}

export function NotificationDropdown({ unreadCount }: { unreadCount: number }) {
  const qc = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
  })

  const markOne = useMutation({
    mutationFn: notificationsApi.markOne,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'count'] })
    },
  })

  const markAll = useMutation({
    mutationFn: notificationsApi.markAll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'count'] })
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-4 w-4' />
          {unreadCount > 0 && (
            <Badge className='absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80 p-0'>
        <div className='flex items-center justify-between px-3 py-2.5 border-b border-border'>
          <span className='text-sm font-semibold'>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-7 text-xs gap-1'
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className='h-3.5 w-3.5' />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className='max-h-96'>
          {notifications.length === 0 ? (
            <div className='py-8 text-center text-sm text-muted-foreground'>
              No notifications yet
            </div>
          ) : (
            <div className='divide-y divide-border'>
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notif={n}
                  onRead={(id) => markOne.mutate(id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
