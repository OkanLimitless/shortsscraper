import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ marginTop: '20px' }}>
        <Link href="/" style={{ 
          background: '#2563eb', 
          color: 'white', 
          padding: '10px 16px', 
          borderRadius: '5px',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Go to Home Page
        </Link>
      </div>
    </div>
  );
} 