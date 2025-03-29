import { Suspense } from 'react';
import EditContactClient from './EditContactClient';

export default function EditContactPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading contact information...</p>
    </div>}>
      <EditContactClient contactId={params.id} />
    </Suspense>
  );
} 