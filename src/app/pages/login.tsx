import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Ajusta la ruta si es necesario

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const { login, loading, error } = useAuth();
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (!email.trim()) {
            setLocalError("Email is required");
            return;
        }
        await login(email);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">
                        <LogIn className="inline-block mr-2" />
                        Login
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to log in
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full"
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>
                        {(error || localError) && (
                            <div className="text-red-500 text-sm">
                                <AlertTriangle className="inline-block mr-1" size={16} />
                                {error || localError}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;