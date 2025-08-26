import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Shield, Heart } from "lucide-react";
import logoSheltiesImage from "@assets/logo-shelties-2_1756234700564.png";
import logoSheltiesAltImage from "@assets/logo shelties_1756234743860.png";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

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
              Bienvenido
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
              Sistema de gestión para entrenamiento canino
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
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

              <Button 
                onClick={handleLogin}
                className="w-full mobile-btn bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                size="lg"
                data-testid="button-login"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 px-4">
                Accede con tu cuenta para gestionar citas, clientes y seguimiento de progreso
              </p>
            </div>
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