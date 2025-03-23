import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function FallbackHome() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the App Router home page
    router.push('/');
  }, [router]);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>KVK Document Generator</h1>
      <p>Loading application...</p>
    </div>
  );
} 