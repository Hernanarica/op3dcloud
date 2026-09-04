CREATE TABLE op3dcloud.treatment_planning (
  id                        BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  patient_id                BIGINT NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Assets
  render_3d                 TEXT NULL,                                    -- URL del render 3D
  technical_report_url      TEXT NULL,                                    -- URL del informe técnico
  -- Datos clínicos
  upper_aligners            INTEGER NOT NULL DEFAULT 0,                   -- Alineadores superior
  lower_aligners            INTEGER NOT NULL DEFAULT 0,                   -- Alineadores inferior
  complexity                TEXT NULL,                                    -- Complejidad
  prognosis                 TEXT NULL,                                    -- Pronóstico
  -- Checklists
  diagnosis                 TEXT[] NOT NULL DEFAULT '{}',                 -- Diagnóstico
  laboratory                TEXT[] NOT NULL DEFAULT '{}',                 -- Laboratorio
  planning                  TEXT[] NOT NULL DEFAULT '{}',                 -- Planificación
  restrictions              TEXT[] NOT NULL DEFAULT '{}',                 -- Restricciones
  -- Control de tracking
  tracking_rotations        TEXT NULL,                                    -- Tracking rotaciones
  tracking_extrusions       TEXT NULL,                                    -- Tracking extrusiones
  tracking_extrusion_buttons TEXT NULL,                                   -- Tracking extrusiones boto
  tracking_intrusions       TEXT NULL,                                    -- Tracking intrusiones
  tracking_torque           TEXT NULL,                                    -- Tracking torque
  tracking_angulations      TEXT NULL,                                    -- Tracking angulaciones
  tracking_translations     TEXT NULL,                                    -- Tracking traslaciones
  tracking_expansion        TEXT NULL,                                    -- Tracking expansión
  -- Análisis comercial
  commercial_potential      TEXT[] NULL DEFAULT '{}',                     -- Potencial comercial
  -- Espacio de mejora continua
  quality_information       TEXT[] NOT NULL DEFAULT '{}',                 -- Calidad de la información
  quality_scan              TEXT[] NOT NULL DEFAULT '{}',                 -- Calidad del escaneo
  quality_xrays             TEXT[] NOT NULL DEFAULT '{}',                 -- Calidad de radiografías
  quality_intraoral         TEXT[] NOT NULL DEFAULT '{}',                 -- Calidad de fotos intraorales
  quality_extraoral         TEXT[] NOT NULL DEFAULT '{}',                 -- Calidad de fotos extraorales
  -- Observaciones
  additional_observations   TEXT NULL,                                    -- Observaciones adicionales
  -- Aprobación del cliente (desbloquea los modelos 3D en /pacientes)
  client_approved           BOOLEAN NOT NULL DEFAULT FALSE,
  client_approved_at        TIMESTAMPTZ NULL,
  CONSTRAINT treatment_planning_pkey PRIMARY KEY (id),
  CONSTRAINT treatment_planning_patient_id_fkey FOREIGN KEY (patient_id)
    REFERENCES op3dcloud.patients (id) ON DELETE CASCADE
);

CREATE INDEX treatment_planning_patient_id_idx ON op3dcloud.treatment_planning (patient_id);

ALTER TABLE op3dcloud.treatment_planning ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRUD"
ON op3dcloud.treatment_planning FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public read"
ON op3dcloud.treatment_planning FOR SELECT
TO anon
USING (true);

COMMENT ON TABLE op3dcloud.treatment_planning IS 'Planes de tratamiento generados a partir del formulario PLAN 3D | PORFOLIO OP3D';

COMMENT ON COLUMN op3dcloud.treatment_planning.id IS 'Identificador único del plan de tratamiento';
COMMENT ON COLUMN op3dcloud.treatment_planning.patient_id IS 'Referencia al paciente asociado a este plan de tratamiento';
COMMENT ON COLUMN op3dcloud.treatment_planning.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN op3dcloud.treatment_planning.render_3d IS 'URL del render 3D del tratamiento';
COMMENT ON COLUMN op3dcloud.treatment_planning.technical_report_url IS 'URL del PDF con el informe técnico del plan 3D';
COMMENT ON COLUMN op3dcloud.treatment_planning.upper_aligners IS 'Cantidad de alineadores para el maxilar superior';
COMMENT ON COLUMN op3dcloud.treatment_planning.lower_aligners IS 'Cantidad de alineadores para el maxilar inferior';
COMMENT ON COLUMN op3dcloud.treatment_planning.complexity IS 'Complejidad del caso: baja, moderada o alta';
COMMENT ON COLUMN op3dcloud.treatment_planning.prognosis IS 'Pronóstico del tratamiento: favorable o reservada';
COMMENT ON COLUMN op3dcloud.treatment_planning.diagnosis IS 'Items seleccionados del diagnóstico presuntivo general';
COMMENT ON COLUMN op3dcloud.treatment_planning.laboratory IS 'Recomendaciones y requerimientos para el laboratorio';
COMMENT ON COLUMN op3dcloud.treatment_planning.planning IS 'Criterios de planificación y accionar clínico seleccionados';
COMMENT ON COLUMN op3dcloud.treatment_planning.restrictions IS 'Restricciones biomecánicas identificadas en el caso';
COMMENT ON COLUMN op3dcloud.treatment_planning.tracking_rotations IS 'Piezas dentarias con rotaciones que requieren control de tracking';
COMMENT ON COLUMN op3dcloud.treatment_planning.tracking_extrusions IS 'Piezas con extrusiones que requieren controles frecuentes';
COMMENT ON COLUMN op3dcloud.treatment_planning.tracking_extrusion_buttons IS 'Piezas con botones de extrusión programados para predictibilidad del movimiento';
COMMENT ON COLUMN op3dcloud.treatment_planning.tracking_intrusions IS 'Piezas con intrusiones que requieren uso de mordillos y control periodontal';
COMMENT ON COLUMN op3dcloud.treatment_planning.tracking_torque IS 'Piezas con torque/inclinaciones que requieren evaluación clínica continua';
COMMENT ON COLUMN op3dcloud.treatment_planning.tracking_angulations IS 'Piezas con angulaciones complejas que requieren control especial de tracking';
COMMENT ON COLUMN op3dcloud.treatment_planning.tracking_translations IS 'Piezas con traslaciones que requieren control de anclaje';
COMMENT ON COLUMN op3dcloud.treatment_planning.tracking_expansion IS 'Piezas con expansión/compresión con riesgo de tipping';
COMMENT ON COLUMN op3dcloud.treatment_planning.commercial_potential IS 'Tratamientos complementarios identificados con potencial clínico-comercial';
COMMENT ON COLUMN op3dcloud.treatment_planning.quality_information IS 'Evaluación de la calidad de la información enviada por el profesional';
COMMENT ON COLUMN op3dcloud.treatment_planning.quality_scan IS 'Evaluación de la calidad del escaneo intraoral';
COMMENT ON COLUMN op3dcloud.treatment_planning.quality_xrays IS 'Evaluación de la calidad de las radiografías panorámicas';
COMMENT ON COLUMN op3dcloud.treatment_planning.quality_intraoral IS 'Evaluación de la calidad de las fotos intraorales';
COMMENT ON COLUMN op3dcloud.treatment_planning.quality_extraoral IS 'Evaluación de la calidad de las fotos extraorales';
COMMENT ON COLUMN op3dcloud.treatment_planning.additional_observations IS 'Observaciones adicionales del caso';
COMMENT ON COLUMN op3dcloud.treatment_planning.client_approved IS 'True cuando el cliente aprueba la planificación y desbloquea los modelos 3D';
COMMENT ON COLUMN op3dcloud.treatment_planning.client_approved_at IS 'Fecha y hora en que el cliente aprobó la planificación';
