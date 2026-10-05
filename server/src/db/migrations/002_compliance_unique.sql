-- Add unique constraint on user_id and date in compliance table

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'compliance_user_id_date_unique'
    ) THEN
        ALTER TABLE compliance ADD CONSTRAINT compliance_user_id_date_unique UNIQUE (user_id, date);
    END IF;
END $$;
