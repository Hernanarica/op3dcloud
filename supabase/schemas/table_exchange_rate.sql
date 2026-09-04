CREATE TABLE op3dcloud.exchange_rate (
  id         BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  currency   TEXT NOT NULL,
  rate       NUMERIC(12,6) NOT NULL,
  period     DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT exchange_rate_pkey PRIMARY KEY (id),
  CONSTRAINT exchange_rate_currency_period_key UNIQUE (currency, period),
  CONSTRAINT exchange_rate_currency_check CHECK (currency IN ('ARS', 'USD', 'EUR')),
  CONSTRAINT exchange_rate_rate_check CHECK (rate > 0)
);

alter table op3dcloud.exchange_rate enable row level security;

-- Igual que "plans": la página de suscripción es pública, un visitante sin
-- login tiene que poder convertir los precios que ve.
create policy "Todos leen los tipos de cambio"
on op3dcloud.exchange_rate for select
to authenticated
using (true);

create policy "Lectura pública de los tipos de cambio"
on op3dcloud.exchange_rate for select
to anon
using (true);

create policy "Solo el admin edita los tipos de cambio"
on op3dcloud.exchange_rate for all
to authenticated
using (op3dcloud.is_admin())
with check (op3dcloud.is_admin());

COMMENT ON TABLE op3dcloud.exchange_rate IS 'Tasas en pesos argentinos (ARS) usadas para mostrar en /suscripcion el precio equivalente de un plan cotizado en USD; no afectan el monto registrado en credit_payments';
COMMENT ON COLUMN op3dcloud.exchange_rate.id IS 'Identificador único de la tasa';
COMMENT ON COLUMN op3dcloud.exchange_rate.currency IS 'Moneda cargada: USD o EUR (ARS es la referencia implícita, no se carga, vale 1)';
COMMENT ON COLUMN op3dcloud.exchange_rate.rate IS 'Cuántos ARS cuesta comprar 1 unidad de currency (el mismo número que se lee en una casa de cambio)';
COMMENT ON COLUMN op3dcloud.exchange_rate.period IS 'Mes de vigencia de la tasa (primer día del mes). Permite cargar tasas por adelantado y conservar historial';
COMMENT ON COLUMN op3dcloud.exchange_rate.created_at IS 'Fecha y hora en que se cargó el registro';
