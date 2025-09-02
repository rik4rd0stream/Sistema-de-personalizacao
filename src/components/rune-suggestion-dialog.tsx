'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { suggestIdealRunes } from '@/ai/flows/suggest-ideal-runes';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface RuneSuggestionDialogProps {
  equipmentType: string;
  tier: number;
  onApplySuggestions: (suggestions: string[]) => void;
}

export function RuneSuggestionDialog({ equipmentType, tier, onApplySuggestions }: RuneSuggestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSuggest = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await suggestIdealRunes({ equipmentType, tier });
      if (result.runeSuggestions && result.runeSuggestions.length > 0) {
        setSuggestions(result.runeSuggestions);
      } else {
        toast({
            title: "Nenhuma Sugestão",
            description: "A IA não retornou sugestões para este item.",
        });
      }
    } catch (error) {
      console.error("Error fetching rune suggestions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Sugerir Runas",
        description: "Não foi possível obter sugestões. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApply = () => {
    onApplySuggestions(suggestions);
    setOpen(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state on close
      setIsLoading(false);
      setSuggestions([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Wand2 className="h-4 w-4 mr-1" />
          Sugerir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sugestão de Runas com IA</DialogTitle>
          <DialogDescription>
            Obtenha sugestões para <span className="font-bold text-accent">{equipmentType}</span> (Tier {tier}).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[200px] flex items-center justify-center">
          {!isLoading && suggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center gap-4 p-8 bg-card rounded-lg border border-dashed">
                <Sparkles className="h-12 w-12 text-muted-foreground"/>
                <p className="text-muted-foreground">Clique para receber sugestões de runas do nosso assistente de IA.</p>
                <Button onClick={handleSuggest}>
                    <Wand2 className="mr-2 h-4 w-4" /> Gerar Sugestões
                </Button>
            </div>
          )}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Analisando as melhores combinações...</p>
            </div>
          )}
          {!isLoading && suggestions.length > 0 && (
            <div className="w-full">
              <Alert>
                <AlertTitle className="font-bold">Runas Sugeridas:</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-2 font-medium">
                    {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button variant="outline">Fechar</Button>
          </DialogClose>
          {suggestions.length > 0 && !isLoading && (
            <Button onClick={handleApply}>Aplicar Sugestões</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
