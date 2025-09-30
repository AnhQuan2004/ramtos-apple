import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // After a short delay, redirect to the home page and trigger the success step
    const timer = setTimeout(() => {
      navigate('/?payment=success');
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
      <p className="text-lg text-muted-foreground">Your payment was successful.</p>
      <p className="text-muted-foreground mt-8">Redirecting you back to the demo...</p>
    </div>
  );
};

export default ThankYou;
