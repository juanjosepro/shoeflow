import { useAuth } from '../hooks/useAuth';
import { toast } from '@/shared/lib/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Controller } from 'react-hook-form';

const schema = z.object({
  username: z.string().min(3, 'Requerido'),
  password: z.string().min(3, 'Requerido'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: 'superadmin',
      password: 'Supernov@08',
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      toast.success('Bienvenido');
    } catch {
      toast.error('Credenciales incorrectas');
    }
  };

  return (
    <div className="flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'var(--surface-ground)' }}>
      <div className="surface-card border-round-2xl shadow-4 p-5" style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo / título */}
        <div className="text-center mb-5">
          <div className="flex align-items-center justify-content-center mb-3">
            <div className="border-round-xl p-3" style={{ background: 'var(--primary-color)' }}>
              <i className="pi pi-box" style={{ fontSize: '2rem', color: '#fff' }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold m-0" style={{ color: 'var(--text-color)' }}>ShoeFlow</h1>
          <p className="mt-1 mb-0" style={{ color: 'var(--text-color-secondary)' }}>Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-4">

          {/* Usuario */}
          <div className="flex flex-column gap-1">
            <label className="font-semibold" style={{ color: 'var(--text-color)' }}>Usuario</label>
            <InputText
              {...register('username')}
              placeholder="Ingresa tu usuario"
              invalid={!!errors.username}
              className="w-full"
            />
            {errors.username && <small className="p-error">{errors.username.message}</small>}
          </div>

          {/* Contraseña */}
          <div className="flex flex-column gap-1">
            <label className="font-semibold" style={{ color: 'var(--text-color)' }}>Contraseña</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Password
                  {...field}
                  placeholder="Ingresa tu contraseña"
                  invalid={!!errors.password}
                  feedback={false}
                  toggleMask
                  className="w-full"
                  inputClassName="w-full"
                />
              )}
            />
            {errors.password && <small className="p-error">{errors.password.message}</small>}
          </div>

          {/* Botón */}
          <Button
            type="submit"
            label={isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            icon={isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            iconPos="right"
            loading={isSubmitting}
            className="w-full mt-2"
          />

        </form>

        <p className="text-center mt-4 mb-0 text-sm" style={{ color: 'var(--text-color-secondary)' }}>
          ShoeFlow © {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
}