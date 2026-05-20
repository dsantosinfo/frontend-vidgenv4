import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Mail, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { forgotPassword, resetPassword } from '../../config/api';
import { useBranding } from '../../context/BrandingContext';
import AppLogo from '../AppLogo';

type Mode = 'login' | 'register' | 'forgot' | 'reset';

const getTokenFromUrl = () => new URLSearchParams(window.location.search).get('token');

const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const { branding } = useBranding();
  const [mode, setMode] = useState<Mode>(() => getTokenFromUrl() ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const resetToken = getTokenFromUrl();

  // Estilo do botão primário com cores da API
  const btnStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${branding.color_from}, ${branding.color_to})`,
  };

  useEffect(() => { setError(''); setSuccess(''); }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try { await login(email, password); }
    catch (err: any) { setError(err.message || 'E-mail ou senha incorretos'); }
    finally { setIsLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try { await register(email, password, fullName || undefined); await login(email, password); }
    catch (err: any) { setError(err.message || 'Erro ao criar conta'); }
    finally { setIsLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try { await forgotPassword(email); setSuccess('Se o e-mail estiver cadastrado, você receberá as instruções em breve.'); }
    catch (err: any) { setError(err.message || 'Erro ao solicitar recuperação'); }
    finally { setIsLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('As senhas não coincidem'); return; }
    if (!resetToken) { setError('Token inválido'); return; }
    setIsLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setSuccess('Senha redefinida com sucesso! Você já pode fazer login.');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setMode('login'), 2500);
    }
    catch (err: any) { setError(err.message || 'Token inválido ou expirado'); }
    finally { setIsLoading(false); }
  };

  const passwordRules = (
    <p className="text-xs text-slate-500 mt-1">
      Mín. 8 caracteres, maiúscula, minúscula, número e caractere especial.
    </p>
  );

  const PrimaryBtn: React.FC<{ loading: boolean; label: string; loadingLabel: string }> = ({ loading, label, loadingLabel }) => (
    <button
      type="submit"
      disabled={loading}
      style={btnStyle}
      className="w-full py-2.5 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {loading ? loadingLabel : label}
    </button>
  );

  const ErrorBox = () => error ? (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo + nome */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AppLogo size={52} variant="gradient" iconOnly />
          </div>
          <h1 className="text-3xl font-bold text-white">{branding.app_name}</h1>
          <p className="text-slate-400 mt-1">{branding.tagline}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* LOGIN / REGISTER */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
                <button onClick={() => setMode('login')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
                  <LogIn className="w-4 h-4 inline mr-1" /> Entrar
                </button>
                <button onClick={() => setMode('register')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
                  <UserPlus className="w-4 h-4 inline mr-1" /> Cadastrar
                </button>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome (opcional)</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com" required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'register' && passwordRules}
                </div>
                <ErrorBox />
                <PrimaryBtn loading={isLoading} label={mode === 'login' ? 'Entrar' : 'Criar conta'} loadingLabel="Aguarde..." />
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')}
                    className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors text-center">
                    Esqueci minha senha
                  </button>
                )}
              </form>
            </>
          )}

          {/* FORGOT */}
          {mode === 'forgot' && (
            <>
              <button onClick={() => setMode('login')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar ao login
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-100 rounded-lg"><Mail className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">Recuperar senha</h3>
                  <p className="text-sm text-slate-500">Enviaremos um link para seu e-mail</p>
                </div>
              </div>
              {success ? (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail cadastrado</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com" required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <ErrorBox />
                  <PrimaryBtn loading={isLoading} label="Enviar link de recuperação" loadingLabel="Enviando..." />
                </form>
              )}
            </>
          )}

          {/* RESET */}
          {mode === 'reset' && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-purple-100 rounded-lg"><KeyRound className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <h3 className="font-semibold text-slate-900">Nova senha</h3>
                  <p className="text-sm text-slate-500">Defina sua nova senha de acesso</p>
                </div>
              </div>
              {success ? (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nova senha</label>
                    <div className="relative">
                      <input type={showNewPassword ? 'text' : 'password'} value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button type="button" onClick={() => setShowNewPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordRules}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar nova senha</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <ErrorBox />
                  <PrimaryBtn loading={isLoading} label="Redefinir senha" loadingLabel="Salvando..." />
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
