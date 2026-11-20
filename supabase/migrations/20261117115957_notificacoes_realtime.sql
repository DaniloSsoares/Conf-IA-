-- Notificações em tempo real: o app escuta as notificações novas do usuário logado.
-- Seguro: o Realtime respeita a RLS (notificacoes_select_own), cada um só recebe as próprias.
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerta_notificacoes;
