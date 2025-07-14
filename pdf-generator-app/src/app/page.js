import KVKForm from '../components/KVKForm';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>KVK Document Generator</h1>
        <p className={styles.description}>
          Create accurate KVK business register extracts that perfectly match the official format
        </p>
      </div>
      
      <KVKForm />
      
      <footer className={styles.footer}>
        <p>
          This tool creates HTML documents matching the format of KVK Business Register extracts.
          For educational and design purposes only.
        </p>
      </footer>
    </main>
  );
} 