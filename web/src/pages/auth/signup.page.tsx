import { signupApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signupSchema, type SignupFormValues } from '@/validators/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Layers } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      toast.success('Account created! Please sign in.')
      navigate('/signin', { replace: true })
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Sign up failed'
      toast.error(msg)
    },
  })

  function onSubmit(values: SignupFormValues) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _, ...payload } = values
    mutate(payload)
  }

  return (
    <div className='relative flex min-h-screen overflow-hidden bg-background'>
      <div
        className='absolute inset-0 opacity-[0.4] dark:opacity-[0.03]'
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          color: 'var(--border)',
        }}
      />

      <div className='relative hidden w-1/2 flex-col justify-between p-12 lg:flex'>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
            <Layers className='h-4 w-4 text-primary-foreground' />
          </div>
          <span className='font-mono text-sm font-bold tracking-widest text-muted-foreground uppercase'>
            Project Hub
          </span>
        </div>

        <div>
          <div className='mb-6 inline-block rounded-full border border-border bg-muted px-3 py-1'>
            <span className='font-mono text-xs tracking-wider text-muted-foreground uppercase'>
              Agency OS · v2.0
            </span>
          </div>
          <h1 className='mb-4 font-mono text-5xl font-bold leading-none tracking-tight text-foreground'>
            Every project.
            <br />
            <span className='text-muted-foreground/40'>Every deadline.</span>
            <br />
            One place.
          </h1>
          <p className='max-w-xs text-sm leading-relaxed text-muted-foreground'>
            Real-time collaboration, role-based access, and live activity feeds
            — built for teams that ship.
          </p>
        </div>

        <div className='flex gap-8'>
          {[
            { label: 'Active Projects', value: '240+' },
            { label: 'Team Members', value: '1.2k' },
            { label: 'Tasks Shipped', value: '18k' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className='font-mono text-2xl font-bold text-foreground'>
                {stat.value}
              </div>
              <div className='text-xs text-muted-foreground'>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className='hidden w-px bg-border lg:block' />

      <div className='relative flex flex-1 flex-col items-center justify-center px-6 py-12'>
        <div className='mb-10 flex items-center gap-2 lg:hidden'>
          <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary'>
            <Layers className='h-4 w-4 text-primary-foreground' />
          </div>
          <span className='font-mono text-sm font-medium text-muted-foreground'>
            Project Hub
          </span>
        </div>

        <div className='w-full max-w-sm'>
          <div className='mb-8'>
            <h2 className='mb-1 font-mono text-2xl font-bold text-foreground'>
              Create account
            </h2>
            <p className='text-sm text-muted-foreground'>
              Join your team's workspace
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Alex Johnson'
                        autoComplete='name'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        placeholder='you@company.com'
                        autoComplete='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Min. 8 chars, 1 uppercase, 1 number'
                          autoComplete='new-password'
                          className='pr-10'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword((v) => !v)}
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type={showConfirm ? 'text' : 'password'}
                          placeholder='••••••••'
                          autoComplete='new-password'
                          className='pr-10'
                        />
                        <button
                          type='button'
                          onClick={() => setShowConfirm((v) => !v)}
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'
                          tabIndex={-1}
                        >
                          {showConfirm ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                disabled={isPending}
                className='mt-2 w-full font-mono text-sm font-bold tracking-wider uppercase'
              >
                {isPending ? (
                  <span className='flex items-center gap-2'>
                    <span className='h-3 w-3 animate-spin rounded-full border border-primary-foreground/30 border-t-primary-foreground' />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>

          <p className='mt-6 text-center text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link
              to='/signin'
              className='font-medium text-foreground transition-colors hover:text-foreground/80'
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
