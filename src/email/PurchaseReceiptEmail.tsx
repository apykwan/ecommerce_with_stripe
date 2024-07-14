import { Html, Preview, Tailwind, Body, Head, Heading, Container } from "@react-email/components";

import OrderInformation from './components/OrderInformation';

type PurchaseReceiptEmailProps = {
  product: { imagePath: string; name: string; description: string }
  order: { id: string; createdAt: Date; pricePaidInCents: number };
  downloadVerificationId: string;
}

PurchaseReceiptEmail.PreviewProps = {
  product: { 
    name: "Test Product", 
    description: "testing product 123",
    imagePath: "products/99d7efcb-f212-442d-8b27-82c0491ccb29-house10.jpg"
  },
  order: {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    pricePaidInCents: 10000
  },
  downloadVerificationId: crypto.randomUUID()
} satisfies PurchaseReceiptEmailProps

export default function PurchaseReceiptEmail({ 
  product,
  order,
  downloadVerificationId
}: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Preview>Download { product.name} and view receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>
            <OrderInformation 
              product={product} 
              order={order} 
              downloadVerificationId={downloadVerificationId}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}