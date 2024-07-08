"use client";

import { useTransition } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

import { toggleProductAvailability, deleteProduct } from '../../_actions/products';

export function ActiveToggleDropdownItem({ id, isAvailableForPurchase}: {
  id: string, isAvailableForPurchase: boolean
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      disabled={isPending} 
      onClick={startTransition.bind(null, async () => {
        await toggleProductAvailability(id, !isAvailableForPurchase);
      })}
    >
      {isAvailableForPurchase ? "Deactivate": "Activate"}
    </DropdownMenuItem>
  );
}

export function DeleteDropdownItem({ id, disabled }: { id: string, disabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      disabled={disabled || isPending} 
      onClick={startTransition.bind(null, async () => {
        await deleteProduct(id);
      })}
    >
      Delete
    </DropdownMenuItem>
  );
}