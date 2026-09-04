drop view if exists "op3dcloud"."view_dashboard_admin";


  create table "op3dcloud"."exchange_rate" (
    "id" bigint generated always as identity not null,
    "currency" text not null,
    "rate" numeric(12,6) not null,
    "period" date not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "op3dcloud"."exchange_rate" enable row level security;

CREATE UNIQUE INDEX exchange_rate_currency_period_key ON op3dcloud.exchange_rate USING btree (currency, period);

CREATE UNIQUE INDEX exchange_rate_pkey ON op3dcloud.exchange_rate USING btree (id);

alter table "op3dcloud"."exchange_rate" add constraint "exchange_rate_pkey" PRIMARY KEY using index "exchange_rate_pkey";

alter table "op3dcloud"."exchange_rate" add constraint "exchange_rate_currency_check" CHECK ((currency = ANY (ARRAY['ARS'::text, 'USD'::text, 'EUR'::text]))) not valid;

alter table "op3dcloud"."exchange_rate" validate constraint "exchange_rate_currency_check";

alter table "op3dcloud"."exchange_rate" add constraint "exchange_rate_currency_period_key" UNIQUE using index "exchange_rate_currency_period_key";

alter table "op3dcloud"."exchange_rate" add constraint "exchange_rate_rate_check" CHECK ((rate > (0)::numeric)) not valid;

alter table "op3dcloud"."exchange_rate" validate constraint "exchange_rate_rate_check";

create or replace view "op3dcloud"."view_dashboard_admin" as  SELECT p.id,
    p.created_at,
    concat(p.name, ' ', p.last_name) AS patient_name,
    p.status,
        CASE
            WHEN ('Prioridad'::text = ANY (p.case_status)) THEN ((now() + '48:00:00'::interval))::date
            ELSE ((p.created_at + '7 days'::interval))::date
        END AS expiration,
    vp.id AS planner_id,
    vp.username AS planner_name,
    vc.id AS client_id,
    vc.username AS client_name,
    p.status_files,
    p.case_status,
    p.notes,
    p.planning_enabled
   FROM ((op3dcloud.patients p
     LEFT JOIN op3dcloud.view_clients vc ON ((p.id_client = vc.id)))
     LEFT JOIN op3dcloud.view_planners vp ON ((p.id_planner = vp.id)));


grant delete on table "op3dcloud"."exchange_rate" to "anon";

grant insert on table "op3dcloud"."exchange_rate" to "anon";

grant references on table "op3dcloud"."exchange_rate" to "anon";

grant select on table "op3dcloud"."exchange_rate" to "anon";

grant trigger on table "op3dcloud"."exchange_rate" to "anon";

grant truncate on table "op3dcloud"."exchange_rate" to "anon";

grant update on table "op3dcloud"."exchange_rate" to "anon";

grant delete on table "op3dcloud"."exchange_rate" to "authenticated";

grant insert on table "op3dcloud"."exchange_rate" to "authenticated";

grant references on table "op3dcloud"."exchange_rate" to "authenticated";

grant select on table "op3dcloud"."exchange_rate" to "authenticated";

grant trigger on table "op3dcloud"."exchange_rate" to "authenticated";

grant truncate on table "op3dcloud"."exchange_rate" to "authenticated";

grant update on table "op3dcloud"."exchange_rate" to "authenticated";

grant delete on table "op3dcloud"."exchange_rate" to "service_role";

grant insert on table "op3dcloud"."exchange_rate" to "service_role";

grant references on table "op3dcloud"."exchange_rate" to "service_role";

grant select on table "op3dcloud"."exchange_rate" to "service_role";

grant trigger on table "op3dcloud"."exchange_rate" to "service_role";

grant truncate on table "op3dcloud"."exchange_rate" to "service_role";

grant update on table "op3dcloud"."exchange_rate" to "service_role";


  create policy "Lectura pública de los tipos de cambio"
  on "op3dcloud"."exchange_rate"
  as permissive
  for select
  to anon
using (true);



  create policy "Solo el admin edita los tipos de cambio"
  on "op3dcloud"."exchange_rate"
  as permissive
  for all
  to authenticated
using (op3dcloud.is_admin())
with check (op3dcloud.is_admin());



  create policy "Todos leen los tipos de cambio"
  on "op3dcloud"."exchange_rate"
  as permissive
  for select
  to authenticated
using (true);



