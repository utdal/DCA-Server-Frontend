import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingPage = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prevProgress) => {
        const newProgress = prevProgress >= 100 ? 100 : prevProgress + 10;
        if (newProgress === 100) {
          navigate('/results'); // Navigate to ResultsPage when loading is complete
        }
        return newProgress;
      });
    }, 500); 

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.loadingContainer}>
        <h1 style={styles.title}>Loading...</h1>
        <div style={styles.loadingBarContainer}>
          <div style={{ ...styles.loadingBar, width: `${loadingProgress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#d0d8e8',
  },
  loadingContainer: {
    textAlign: 'center',
  },
  title: {
    color: '#282c34',
    marginBottom: '20px',
  },
  loadingBarContainer: {
    width: '100%',
    maxWidth: '600px',
    height: '20px',
    backgroundColor: '#ccc',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#87CEEB',
    borderRadius: '10px 0 0 10px',
    transition: 'width 0.5s ease-in-out',
  },
};

export default LoadingPage;
