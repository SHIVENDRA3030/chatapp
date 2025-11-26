import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react';

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
                className="glass-frosted border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-elevation-xl z-10"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-secondary via-accent to-primary rounded-2xl shadow-glow-lg animate-float">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-display font-bold text-center mb-2 text-gradient-vivid animate-gradient-shift">
                    Join Chatsy
                </h2>
                <p className="text-gray-400 text-center mb-8 font-medium">Create your unique username</p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-strong border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-4 text-sm text-center font-medium shadow-elevation-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full glass-strong border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-secondary/50 focus:shadow-glow transition-all duration-300 placeholder-gray-500"
                            placeholder="Choose a unique username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full glass-strong border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-secondary/50 focus:shadow-glow transition-all duration-300 placeholder-gray-500"
                            placeholder="Create a password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-secondary-500 via-accent-500 to-primary-500 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-glow-lg hover:shadow-glow-xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Account...
                            </span>
                        ) : (
                            'Sign Up'
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-secondary-400 hover:text-primary-400 transition-colors font-semibold">
                        Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
