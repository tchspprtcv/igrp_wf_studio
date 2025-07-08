import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItemProps {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItemProps[];
  // Adicionar outras props de estilização ou comportamento se necessário
  separator?: React.ReactNode;
  itemClassName?: string;
  linkClassName?: string;
  activeItemClassName?: string;
  separatorClassName?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  className,
  itemClassName,
  linkClassName,
  activeItemClassName,
  separatorClassName,
  ...props
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1.5 text-sm text-muted-foreground', className)} {...props}>
      {items.map((item, index) => {
        const isLastItem = index === items.length - 1;
        return (
          <React.Fragment key={item.label + index}>
            {index > 0 && (
              <span className={cn('select-none', separatorClassName)}>
                {separator}
              </span>
            )}
            {item.href && !isLastItem ? (
              <Link
                href={item.href}
                className={cn(
                  'hover:text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-ring focus:rounded-sm',
                  itemClassName,
                  linkClassName
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLastItem ? 'font-medium text-foreground' : '',
                  itemClassName,
                  isLastItem ? activeItemClassName : linkClassName // Aplica linkClassName se não for o último e tiver href, ou activeItemClassName se for o último
                )}
                aria-current={isLastItem ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Para facilitar a importação e uso, podemos exportar os tipos também
// export { Breadcrumb, BreadcrumbItemProps, BreadcrumbProps }; // Já está exportando acima

// Componentes wrapper para uso mais declarativo, similar ao ShadCN (opcional, mas bom para consistência)
// Não vou implementar estes agora para manter simples, mas seria uma boa prática.
/*
const BreadcrumbList = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <nav ref={ref} aria-label="Breadcrumb" className={cn("flex items-center space-x-1.5 text-sm text-muted-foreground", className)} {...props} />
));
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("inline-flex items-center", className)} {...props} />
));
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> & { href?: string }>(
  ({ className, href, ...props }, ref) => (
    href ? (
      <Link ref={ref} href={href} className={cn("hover:text-primary hover:underline", className)} {...props} />
    ) : (
      <span className={cn("font-medium text-foreground", className)} {...props} />
    )
  )
);
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-medium text-foreground", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage"


const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(({ className, children, ...props }, ref) => (
  <li
    ref={ref}
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
));
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

// Poderíamos então usar:
// <BreadcrumbList>
//   <BreadcrumbItem>
//     <BreadcrumbLink href="/">Home</BreadcrumbLink>
//   </BreadcrumbItem>
//   <BreadcrumbSeparator />
//   <BreadcrumbItem>
//     <BreadcrumbPage>Current Page</BreadcrumbPage>
//   </BreadcrumbItem>
// </BreadcrumbList>
*/

export default Breadcrumb;
