"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

import { toggleProductAvailability, deleteProduct } from '../../_actions/products';

export function ActiveToggleDropdownItem({ id, isAvailableForPurchase}: {
  id: string, isAvailableForPurchase: boolean
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  return (
    <DropdownMenuItem
      disabled={isPending} 
      onClick={startTransition.bind(null, async () => {
        await toggleProductAvailability(id, !isAvailableForPurchase);
        router.refresh();
      })}
    >
      {isAvailableForPurchase ? "Deactivate": "Activate"}
    </DropdownMenuItem>
  );
}

export function DeleteDropdownItem({ id, disabled }: { id: string, disabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenuItem
      disabled={disabled || isPending} 
      onClick={startTransition.bind(null, async () => {
        await deleteProduct(id);
        router.refresh();
      })}
    >
      Delete
    </DropdownMenuItem>
  );
}