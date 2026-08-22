ALTER TABLE IF EXISTS events
ADD COLUMN IF NOT EXISTS responsible VARCHAR(150);

ALTER TABLE IF EXISTS events
ALTER COLUMN responsible_user_id DROP NOT NULL;

UPDATE events e
SET responsible = COALESCE(NULLIF(BTRIM(e.responsible), ''), u.username)
FROM users u
WHERE e.responsible_user_id = u.id
  AND (e.responsible IS NULL OR BTRIM(e.responsible) = '');

UPDATE events
SET responsible = 'Responsável não informado'
WHERE responsible IS NULL OR BTRIM(responsible) = '';

ALTER TABLE IF EXISTS events
ALTER COLUMN responsible SET NOT NULL;
