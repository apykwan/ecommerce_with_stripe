"use client";

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Elements, useStripe, useElements, PaymentElement, LinkAuthenticationElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardDescription, CardContent, CardFooter, CardHeader, CardTitle, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { userOrderExists } from "@/app/actions/orders"
import { formatCurrency } from '@/lib/formatters';

type CheckoutFormProps = {
  product: {
    id: string;
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
  };
  clientSecret: string;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

export default function CheckoutForm({ product, clientSecret }: CheckoutFormProps) {
  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image 
            src={`/${product.imagePath}`} 
            style={{ objectFit: 'cover' }} 
            fill
            alt={product.name} 
          />
        </div>
        <div>
          <div className="text-lg">{formatCurrency(product.priceInCents / 100)}</div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">{product.description}</div>
        </div>
      </div>
      <Elements options={{ clientSecret }} stripe={stripePromise}>
        <Form priceInCents={product.priceInCents} productId={product.id} />
      </Elements>
    </div>
  );
}

function Form({ priceInCents, productId }: { priceInCents: number, productId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState<string>();
  
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (stripe == null || elements == null || email == null) return;

    setIsLoading(true);

    const orderExists = await userOrderExists(email, productId);

    if (orderExists) {
      setErrorMessage("You have already purchased this product");
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await stripe.confirmPayment({ elements, confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`
      }});

      if (error) {
        if (error?.type == "card_error" || error?.type == "validation_error" ) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unknown error occur");
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Server error");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          {errorMessage && (
            <CardDescription className="text-destructive">
              {errorMessage}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <PaymentElement />
          <div className="mt-4">
            <LinkAuthenticationElement onChange={e => setEmail(e.value.email)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            size="lg" 
            className="w-full"
            disabled={stripe == null || elements == null || isLoading}
          >
            {isLoading ? "Purchasing..." : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}