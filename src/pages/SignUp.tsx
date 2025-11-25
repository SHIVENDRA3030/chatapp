import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Check if username is already taken
        const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();

        if (existingProfiles) {
            setError('Username is already taken. Please choose another one.');
            setLoading(false);
            return;
        }

        // Create account (profile will be created automatically by database trigger)
        const email = `${username}@chatsy.placeholder.com`;

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Success! Navigate to home
        navigate('/');
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary/30 rounded-full blur-3xl opacity-50 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-50 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-xl z-10"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-gradient-to-br from-secondary to-primary rounded-xl shadow-lg">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Join Chatsy</h2>
                <p className="text-gray-400 text-center mb-8">Create your unique username</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-dark/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                            placeholder="Choose a unique username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                            placeholder="Create a password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-secondary to-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-secondary/20"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-secondary hover:text-primary transition-colors font-medium">
                        Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
