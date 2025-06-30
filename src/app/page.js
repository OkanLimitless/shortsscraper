import dynamic from 'next/dynamic';
import styles from './page.module.css';

// Dynamically import the KVKForm component with client-side rendering
const KVKForm = dynamic(() => import('../components/KVKForm'), { 
  ssr: false, // Disable server-side rendering
  loading: () => <p className={styles.loading}>Loading form...</p>
});

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>KVK Document Generator</h1>
        <p className={styles.description}>
          Generate authentic KVK business register extracts with advanced metadata spoofing
        </p>
      </div>
      
      <KVKForm />
      
      <footer className={styles.footer}>
        <p>
          This tool creates PDF documents with authentic metadata matching official KVK Business Register extracts.
          For educational and design purposes only.
        </p>
      </footer>
    </main>
  );
} 