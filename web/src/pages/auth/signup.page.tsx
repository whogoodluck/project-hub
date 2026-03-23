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

const ROLES = [
  {
    role: 'Admin',
    desc: 'Full access — manage clients, projects, and all users',
    color: 'bg-amber-500',
  },
  {
    role: 'Project Manager',
    desc: 'Create & manage projects, assign tasks to developers',
    color: 'bg-sky-500',
  },
  {
    role: 'Developer',
    desc: 'View assigned tasks, update status, track progress',
    color: 'bg-emerald-500',
  },
]

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
    const { confirmPassword: _, ...payload } = values
    mutate(payload)
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          color: 'var(--border)',
        }}
      />

      {/* Left panel */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-mono text-sm font-bold tracking-widest text-muted-foreground uppercase">
            Project Hub
          </span>
        </div>

        <div>
          <p className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Role-based access
          </p>
          <div className="space-y-3">
            {ROLES.map((item) => (
              <div
                key={item.role}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
                <div>
                  <div className="mb-0.5 font-mono text-sm font-bold text-card-foreground">
                    {item.role}
                  </div>
                  <div className="text-xs leading-relaxed text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Your role is assigned by an Admin after account creation.
        </p>
      </div>

      <div className="hidden w-px bg-border lg:block" />

      {/* Right panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-mono text-sm font-medium text-muted-foreground">Project Hub</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="mb-1 font-mono text-2xl font-bold text-foreground">
              Create account
            </h2>
            <p className="text-sm text-muted-foreground">Join your team's workspace</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Alex Johnson" autoComplete="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="you@company.com" autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 8 chars, 1 uppercase, 1 number"
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full font-mono text-sm font-bold tracking-wider uppercase"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border border-primary-foreground/30 border-t-primary-foreground" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account →'
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-foreground transition-colors hover:text-foreground/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}