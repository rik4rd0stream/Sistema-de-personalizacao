import { Gem } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Gem className="h-6 w-6 text-primary" />
        <span className="">Otimizador de Runas</span>
      </Link>
    </header>
  );
}
