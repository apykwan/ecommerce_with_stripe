"use client";

import { useState, useEffect } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { Product } from '@prisma/client';
import { addProduct, updateProduct } from '../../_actions/products';
import { formatCurrency } from '@/lib/formatters';

export function ProductForm({ product }: { product?: Product | null }) {
  const [error, action] = useFormState(
    product == null ? addProduct : updateProduct.bind(null, product.id),
    {}
  );
  const [priceInCents, setPriceInCents] = useState<number | undefined>(product?.priceInCents);

  useEffect(() => {
    setPriceInCents(product?.priceInCents);
  }, [product]);

  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          type="text" 
          id="name" 
          name="name" 
          defaultValue={product?.name || ""} 
          required 
        />
        {error.name && <div className="text-destructive">{error.name}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price in Cents</Label>
        <Input 
          type="number" 
          id="priceInCents" 
          name="priceInCents" 
          value={priceInCents}
          onChange={e => setPriceInCents(Number(e.target.value) || undefined)}
          required 
        />
        <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
        </div>
        {error.priceInCents && <div className="text-destructive">{error.priceInCents}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description}
        />
        {error.description && (
          <div className="text-destructive">{error.description}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input 
          type="file" 
          id="file" 
          name="file" 
          required={product == null} 
        />
        {product != null && (
          <div className="text-muted-foreground">
            {product.filePath}
          </div>
        )}
        {error.file && <div className="text-destructive">{error.file}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input type="file" id="image" name="image" required={product == null} />
        {product != null && (
          <Image 
            src={`/${product.imagePath}`} 
            height="400" 
            width="400" 
            alt="product image" 
          />
        )}
        {error.image && <div className="text-destructive">{error.image}</div>}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>
    {pending ? "Saving..." : "Save"}
  </Button>;
}