import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, Download } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [dateRange, setDateRange] = useState("thisMonth");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "No autorizado",
        description: "Iniciando sesión nuevamente...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (dateRange) {
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "thisQuarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  const { data: financialSummary, isLoading: financialLoading } = useQuery({
    queryKey: ["/api/reports/financial", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const response = await fetch(
        `/api/reports/financial?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { credentials: "include" }
      );
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const getPeriodLabel = () => {
    switch (dateRange) {
      case "thisMonth": return "Este Mes";
      case "lastMonth": return "Mes Anterior";
      case "thisQuarter": return "Este Trimestre";
      case "thisYear": return "Este Año";
      default: return "Período Seleccionado";
    }
  };

  const totalIncome = Number(financialSummary?.totalIncome || 0);
  const totalExpenses = Number(financialSummary?.totalExpenses || 0);
  const netProfit = Number(financialSummary?.netProfit || 0);
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const expensesByCategory = expenses?.reduce((acc: any, expense: any) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {}) || {};

  const handleExportReport = () => {
    toast({
      title: "Exportando reporte",
      description: "El reporte se está generando y se descargará automáticamente.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground" data-testid="text-reports-title">
            Reportes Financieros
          </h2>
          <p className="text-muted-foreground">Análisis detallado de ingresos, gastos y rentabilidad</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]" data-testid="select-date-range">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">Este mes</SelectItem>
              <SelectItem value="lastMonth">Mes anterior</SelectItem>
              <SelectItem value="thisQuarter">Este trimestre</SelectItem>
              <SelectItem value="thisYear">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} data-testid="button-export-report">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Period Label */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground" data-testid="text-period-label">
          Reporte de {getPeriodLabel()}
        </h3>
        <p className="text-sm text-muted-foreground">
          {startDate.toLocaleDateString('es-ES')} - {endDate.toLocaleDateString('es-ES')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-accent" data-testid="metric-total-income">
                  ${totalIncome.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gastos Totales</p>
                <p className="text-2xl font-bold text-destructive" data-testid="metric-total-expenses">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ganancia Neta</p>
                <p className="text-2xl font-bold text-primary" data-testid="metric-net-profit">
                  ${netProfit.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Margen de Ganancia</p>
                <p className="text-2xl font-bold text-chart-2" data-testid="metric-profit-margin">
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Income by Service */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            {financialLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2"></div>
                  </div>
                ))}
              </div>
            ) : financialSummary?.serviceBreakdown?.length > 0 ? (
              <div className="space-y-4">
                {financialSummary.serviceBreakdown.map((service: any, index: number) => {
                  const maxRevenue = Math.max(...(financialSummary.serviceBreakdown?.map((s: any) => Number(s.revenue)) || [0]));
                  const percentage = maxRevenue > 0 ? (Number(service.revenue) / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={service.serviceName || index} data-testid={`service-breakdown-${index}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {service.serviceName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ${Number(service.revenue).toLocaleString()} ({service.count} citas)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" data-testid="text-no-service-data">
                  No hay datos de servicios para el período seleccionado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2"></div>
                  </div>
                ))}
              </div>
            ) : Object.keys(expensesByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(expensesByCategory).map(([category, amount], index) => {
                  const maxAmount = Math.max(...Object.values(expensesByCategory) as number[]);
                  const percentage = maxAmount > 0 ? (Number(amount) / maxAmount) * 100 : 0;
                  
                  const getCategoryName = (cat: string) => {
                    switch (cat) {
                      case 'supplies': return 'Suministros';
                      case 'utilities': return 'Servicios';
                      case 'salaries': return 'Salarios';
                      case 'rent': return 'Alquiler';
                      case 'marketing': return 'Marketing';
                      case 'maintenance': return 'Mantenimiento';
                      default: return 'Otros';
                    }
                  };
                  
                  return (
                    <div key={category} data-testid={`expense-category-${index}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {getCategoryName(category)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ${Number(amount).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-destructive h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" data-testid="text-no-expense-data">
                  No hay gastos registrados para el período seleccionado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Estado Financiero</h4>
              <div className="text-2xl font-bold mb-1">
                {netProfit >= 0 ? (
                  <span className="text-accent" data-testid="status-profitable">Rentable</span>
                ) : (
                  <span className="text-destructive" data-testid="status-loss">En Pérdida</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {netProfit >= 0 ? 'El negocio está generando ganancias' : 'Se requiere reducir gastos o aumentar ingresos'}
              </p>
            </div>

            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Eficiencia de Gastos</h4>
              <div className="text-2xl font-bold mb-1">
                <span className="text-primary" data-testid="expense-ratio">
                  {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                De los ingresos totales
              </p>
            </div>

            <div className="text-center p-4 bg-chart-2/10 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Recomendación</h4>
              <div className="text-sm text-foreground">
                {profitMargin > 20 ? (
                  <span data-testid="recommendation-excellent">
                    Excelente rentabilidad. Considera expandir servicios.
                  </span>
                ) : profitMargin > 10 ? (
                  <span data-testid="recommendation-good">
                    Buena rentabilidad. Mantén el control de gastos.
                  </span>
                ) : profitMargin > 0 ? (
                  <span data-testid="recommendation-fair">
                    Rentabilidad justa. Busca optimizar operaciones.
                  </span>
                ) : (
                  <span data-testid="recommendation-critical">
                    Situación crítica. Revisa estrategia de precios y gastos.
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
