import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { GraduationCap, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-parchment p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">EduSync Pro</h1>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {isSubmitted 
                ? "Check your email for instructions" 
                : "Enter your email address and we'll send you a link to reset your password"}
            </CardDescription>
          </CardHeader>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit">Send Reset Link</Button>
                <Link to="/login" className="text-sm text-primary flex items-center gap-2 hover:underline">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="text-center py-6">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-brand-green" />
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                We've sent a password reset link to <span className="font-semibold">{email}</span>.
                Please check your inbox.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                Return to Login
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
