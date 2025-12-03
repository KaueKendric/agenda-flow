import { NavLink as RouterNavLink } from 'react-router-dom'
import type { NavLinkProps } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CustomNavLinkProps extends Omit<NavLinkProps, 'className'> {
  children: ReactNode
  className?: string
  activeClassName?: string 
}

export function NavLink({ children, className, activeClassName, ...props }: CustomNavLinkProps) {
  return (
    <RouterNavLink
      {...props}
      className={({ isActive, isPending }) =>
        cn(
          'transition-colors hover:text-primary',
          isPending && 'opacity-50',
          isActive && 'text-primary font-semibold',
          isActive && activeClassName, 
          className
        )
      }
    >
      {children}
    </RouterNavLink>
  )
}
