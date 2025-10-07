'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ExternalLink,
  LogOut,
  Package,
  ShoppingCart,
  TrendingUp,
  User,
  Mail,
  Calendar,
  Award
} from 'lucide-react';
import { useMarketplacesModule } from '../_modules/useMarketplacesModule';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const ConnectionCard = () => {
  const { localData, flags, methods } = useMarketplacesModule();
  const { isConnected, account } = localData;
  const { isDisconnecting } = flags;

  if (!isConnected || !account) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2z" fill="#FFE600"/>
              </svg>
            </div>
            <div>
              <CardTitle>MercadoLibre México</CardTitle>
              <CardDescription>Publica y sincroniza productos automáticamente</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Conecta tu cuenta de MercadoLibre para comenzar a publicar productos automáticamente
              y sincronizar tu inventario en tiempo real.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">¿Qué podrás hacer?</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Publicar productos con un solo clic
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Sincronización automática de inventario
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Importar órdenes automáticamente
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Actualizar precios y stock en tiempo real
              </li>
            </ul>
          </div>

          <Button onClick={methods.connect} size="lg" className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Conectar con MercadoLibre
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2z" fill="#FFE600"/>
              </svg>
            </div>
            <div>
              <CardTitle>MercadoLibre México</CardTitle>
              <CardDescription>Cuenta conectada exitosamente</CardDescription>
            </div>
          </div>
          <Badge variant="default" className="bg-green-500">
            Conectado
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información de la cuenta */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">@{account.nickname}</span>
            <span className="text-muted-foreground">({account.metadata.firstName})</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{account.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Conectado el {new Date(account.connectedAt).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Reputación: {account.metadata.reputation === 'green' ? '🟢 Excelente' :
                          account.metadata.reputation === 'yellow' ? '🟡 Buena' :
                          account.metadata.reputation === 'red' ? '🔴 Regular' :
                          '⚪ Nueva'}
            </span>
          </div>
        </div>

        <Separator />

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              Publicaciones
            </div>
            <p className="text-2xl font-bold">{account.stats.totalListings}</p>
            <p className="text-xs text-muted-foreground">
              {account.stats.activeListings} activas
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShoppingCart className="h-3 w-3" />
              Ventas
            </div>
            <p className="text-2xl font-bold">{account.stats.salesThisMonth}</p>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Puntos
            </div>
            <p className="text-2xl font-bold">{account.metadata.points}</p>
            <p className="text-xs text-muted-foreground">MercadoLibre</p>
          </div>
        </div>

        <Separator />

        {/* Acciones */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a
              href={`https://www.mercadolibre.com.mx/perfil/${account.nickname}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              Ver perfil en ML
            </a>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDisconnecting}
                className="flex-1"
              >
                <LogOut className="mr-2 h-3 w-3" />
                {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Desconectar cuenta de MercadoLibre?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tus publicaciones existentes no se eliminarán, pero ya no podrás gestionar
                  productos ni sincronizar inventario desde Filos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => methods.disconnect()}>
                  Desconectar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
