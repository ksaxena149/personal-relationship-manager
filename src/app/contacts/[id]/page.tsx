import { Suspense } from 'react';
import ContactDetailClient from './ContactDetailClient';

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading contact details...</p>
    </div>}>
      <ContactDetailClient contactId={params.id} />
    </Suspense>
  );
} 