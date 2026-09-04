drop view if exists "op3dcloud"."view_dashboard_admin";

alter table "op3dcloud"."treatment_planning" add column "client_approved" boolean not null default false;

alter table "op3dcloud"."treatment_planning" add column "client_approved_at" timestamp with time zone;

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



