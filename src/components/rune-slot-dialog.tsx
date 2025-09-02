
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from "./ui/label";
import type { Equipment } from "@/app/personagem/[id]/runas/page";
import { cn } from "@/lib/utils";

interface RuneSlotDialogProps {
    isOpen: boolean;
    onClose: () => void;
    equipment: Equipment;
    runeIndex: number;
    availableFragments: string[];
    onFragmentChange: (equipmentId: string, runeIndex: number, fragmentIndex: number, value: string) => void;
}

const getRuneColorClass = (runeName: string): string => {
    if (!runeName) return 'hidden';
    if (runeName.includes('(Amarelo)')) return 'bg-yellow-400';
    if (runeName.includes('(Roxo)')) return 'bg-purple-500';
    if (runeName.includes('(Verde)')) return 'bg-green-500';
    if (runeName.includes('(Vermelho)')) return 'bg-red-500';
    return 'hidden';
};

export function RuneSlotDialog({ isOpen, onClose, equipment, runeIndex, availableFragments, onFragmentChange }: RuneSlotDialogProps) {

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };
  
  const fragment1 = equipment.fragments[runeIndex * 2];
  const fragment2 = equipment.fragments[runeIndex * 2 + 1];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Runa {runeIndex + 1} de {equipment.name}</DialogTitle>
          <DialogDescription>
            Selecione os dois fragmentos para esta runa.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fragment-1" className="text-right">
              Fragmento 1
            </Label>
             <Select 
                value={fragment1 || 'EMPTY_SLOT'} 
                onValueChange={(value) => onFragmentChange(equipment.id, runeIndex, 0, value)}
             >
                <SelectTrigger className="col-span-3">
                     <SelectValue asChild>
                        <div className="flex items-center gap-2">
                            <div className={cn("h-3 w-3 rounded-full", getRuneColorClass(fragment1))}></div>
                            <span>{fragment1 || `Selecione...`}</span>
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {availableFragments.map(fragmentName => (
                    <SelectItem key={fragmentName} value={fragmentName}>
                        <div className="flex items-center gap-3">
                        <div className={cn("h-3 w-3 rounded-full", getRuneColorClass(fragmentName))}></div>
                        <span>{fragmentName === 'EMPTY_SLOT' ? 'Vazio' : fragmentName}</span>
                        </div>
                    </SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fragment-2" className="text-right">
              Fragmento 2
            </Label>
            <Select 
                value={fragment2 || 'EMPTY_SLOT'} 
                onValueChange={(value) => onFragmentChange(equipment.id, runeIndex, 1, value)}
            >
                <SelectTrigger className="col-span-3">
                    <SelectValue asChild>
                        <div className="flex items-center gap-2">
                            <div className={cn("h-3 w-3 rounded-full", getRuneColorClass(fragment2))}></div>
                            <span>{fragment2 || `Selecione...`}</span>
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {availableFragments.map(fragmentName => (
                        <SelectItem key={fragmentName} value={fragmentName}>
                            <div className="flex items-center gap-3">
                            <div className={cn("h-3 w-3 rounded-full", getRuneColorClass(fragmentName))}></div>
                            <span>{fragmentName === 'EMPTY_SLOT' ? 'Vazio' : fragmentName}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
            <Button onClick={onClose}>Salvar e Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
