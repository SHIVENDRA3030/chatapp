import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2 } from 'lucide-react';
import { GridScan } from '../components/GridScan';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const email = `${username}@chatsy.placeholder.com`;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark relative overflow-hidden">
            {/* GridScan Background */}
            <div className="absolute inset-0 z-0">
                <GridScan
                    sensitivity={0.55}
                    lineThickness={1}
                    linesColor="#392e4e"
                    gridScale={0.1}
                    scanColor="#FF9FFC"
                    scanOpacity={0.4}
                    enablePost
                    bloomIntensity={0.6}
                    chromaticAberration={0.002}
                    noiseIntensity={0.01}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-frosted border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-elevation-xl z-10 m-4"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-primary via-accent to-secondary rounded-2xl shadow-glow-lg animate-float">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-display font-bold text-center mb-2 text-gradient-vivid animate-gradient-shift">
                    Welcome Back
                </h2>
                <p className="text-gray-400 text-center mb-8 font-medium">Enter your username to continue</p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-strong border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-4 text-sm text-center font-medium shadow-elevation-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full glass-strong border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all duration-300 placeholder-gray-500"
                            placeholder="johndoe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full glass-strong border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all duration-300 placeholder-gray-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-glow-lg hover:shadow-glow-xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading...
                            </span>
                        ) : (
                            'Login'
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary-400 hover:text-secondary-400 transition-colors font-semibold">
                        Sign up
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
