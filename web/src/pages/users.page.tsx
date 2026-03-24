import { usersApi } from '@/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { RoleBadge } from '@/components/ui/status-badges'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, MoreHorizontal, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function UsersPage() {
  const qc = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.update(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
    },
    onError: () => toast.error('Failed to update user'),
  })

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      usersApi.update(id, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Role updated')
    },
    onError: () => toast.error('Failed to update role'),
  })

  return (
    <div>
      <PageHeader
        title='Users'
        description='Manage team members and their roles'
      />

      <div className='p-6'>
        {isLoading ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title='No users found' />
        ) : (
          <div className='rounded-lg border border-border overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className='w-12' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className='flex items-center gap-2.5'>
                        <Avatar className='h-7 w-7'>
                          <AvatarFallback className='text-xs'>
                            {u.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium text-foreground'>
                            {u.name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={
                          u.isActive
                            ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground'>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                          >
                            <MoreHorizontal className='h-3.5 w-3.5' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() =>
                              changeRole.mutate({
                                id: u.id,
                                role:
                                  u.role === 'DEVELOPER'
                                    ? 'PROJECT_MANAGER'
                                    : 'DEVELOPER',
                              })
                            }
                          >
                            Make{' '}
                            {u.role === 'DEVELOPER'
                              ? 'Project Manager'
                              : 'Developer'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              toggleActive.mutate({
                                id: u.id,
                                isActive: !u.isActive,
                              })
                            }
                            className={
                              u.isActive
                                ? 'text-destructive focus:text-destructive'
                                : ''
                            }
                          >
                            {u.isActive ? 'Deactivate' : 'Reactivate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
