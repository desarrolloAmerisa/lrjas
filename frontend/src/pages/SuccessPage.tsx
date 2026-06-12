import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScaleIn, FadeIn } from '@/components/layout/PageTransition';
import { CredentialCard } from '@/components/credential/CredentialCard';
import { Button } from '@/components/ui/button';
import type { Participant } from '@/types';

export default function SuccessPage() {
  const location = useLocation();
  const participant = location.state?.participant as Participant | undefined;

  if (!participant) return <Navigate to="/register" replace />;

  return (
    <PublicLayout>
      <div className="flex flex-col items-center py-4 space-y-6">
        <ScaleIn>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf/10 border border-leaf/30"
          >
            <CheckCircle2 className="h-8 w-8 text-leaf-dark" />
          </motion.div>
        </ScaleIn>

        <FadeIn delay={0.2}>
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">¡Registro exitoso!</h1>
            <p className="text-muted-foreground text-sm max-w-sm">
              Bienvenido, {participant.firstName}. Aquí está tu credencial — puedes tomarle captura o descargarla.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <CredentialCard participant={participant} />
        </FadeIn>

        <FadeIn delay={0.4}>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </FadeIn>
      </div>
    </PublicLayout>
  );
}
