import Link from 'next/link';
import { Linkedin, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditsProps {
  className?: string;
}

export function Credits({ className }: CreditsProps) {
  return (
    <div className={cn("flex justify-center items-center w-full", className)}>
      <div className="flex flex-col gap-2 bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm rounded-2xl p-4 w-full md:w-auto md:min-w-[280px] transition-all hover:shadow-md duration-300 border-dashed hover:bg-background/80">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Code2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created By</span>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link 
            href="https://www.linkedin.com/in/ardakaraosmanoglu/" 
            target="_blank"
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Linkedin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Arda Karaosmanoglu</span>
            </div>
          </Link>

          <div className="h-px bg-border/50" />

          <Link 
            href="http://linkedin.com/in/ayhankemalyelken/" 
            target="_blank"
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Linkedin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Ayhan Kemal Yelken</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
