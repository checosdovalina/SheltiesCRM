import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { LogIn, Shield, Heart, UserPlus, Eye, EyeOff } from "lucide-react";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import logoSheltiesImage from "@assets/logo-shelties-2_1756234700564.png";
import logoSheltiesAltImage from "@assets/logo shelties_1756234743860.png";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  // Check if admin exists on component mount
  useEffect(() => {
    fetch('/api/auth/admin-exists', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setAdminExists(data.exists))
      .catch(() => setAdminExists(true)); // Default to true if error
  }, []);

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente.",
        });
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        toast({
          title: "Error de inicio de sesión",
          description: errorData.message || "Email o contraseña incorrectos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al iniciar sesión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "¡Registro exitoso!",
          description: "Tu cuenta de administrador ha sido creada.",
        });
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        toast({
          title: "Error de registro",
          description: errorData.message || "Hubo un problema al crear la cuenta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al registrar la cuenta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (adminExists === null) {
    // Loading state
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center mobile-safe-area">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center mobile-safe-area">
      <div className="mobile-container w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <img 
                src={logoSheltiesImage} 
                alt="Instituto Shelties" 
                className="h-16 w-auto object-contain"
                data-testid="img-logo-shelties"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Admin'}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
              {mode === 'login' 
                ? 'Sistema de gestión para entrenamiento canino'
                : 'Configura tu cuenta de administrador'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {mode === 'login' ? (
              <>
                {/* Services Icons */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Entrenamiento
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Hospedaje
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <LogIn className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Kinder
                    </p>
                  </div>
                </div>

                {/* Login Form */}
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="tu@email.com"
                              className="mobile-form-input"
                              data-testid="input-login-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="mobile-form-input pr-10"
                                data-testid="input-login-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full mobile-btn bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                      size="lg"
                      data-testid="button-submit-login"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <LogIn className="w-5 h-5 mr-2" />
                      )}
                      {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </Form>

                {/* Register Admin Link */}
                {!adminExists && (
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setMode('register')}
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      data-testid="button-switch-to-register"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      ¿Primer acceso? Crear cuenta de administrador
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Register Form */}
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Juan"
                                className="mobile-form-input"
                                data-testid="input-register-firstName"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Pérez"
                                className="mobile-form-input"
                                data-testid="input-register-lastName"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="admin@shelties.com"
                              className="mobile-form-input"
                              data-testid="input-register-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                                className="mobile-form-input pr-10"
                                data-testid="input-register-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Repite tu contraseña"
                                className="mobile-form-input pr-10"
                                data-testid="input-register-confirmPassword"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full mobile-btn bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                      size="lg"
                      data-testid="button-submit-register"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <UserPlus className="w-5 h-5 mr-2" />
                      )}
                      {isLoading ? 'Creando...' : 'Crear Cuenta Admin'}
                    </Button>
                  </form>
                </Form>

                {/* Back to Login */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setMode('login')}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    data-testid="button-back-to-login"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Volver al inicio de sesión
                  </Button>
                </div>
              </>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
              {mode === 'login'
                ? 'Accede con tu cuenta para gestionar citas, clientes y seguimiento de progreso'
                : 'Esta cuenta tendrá privilegios de administrador completos'
              }
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 opacity-60">
            <img 
              src={logoSheltiesAltImage} 
              alt="Shelties Logo" 
              className="h-8 w-auto object-contain"
              data-testid="img-logo-shelties-small"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            © 2024 Instituto Shelties - Sistema de gestión canina
          </p>
        </div>
      </div>
    </div>
  );
}