-- Migration 004: Persist generated plan data and lifecycle state

ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS plan_data JSONB,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_plans_user_status
  ON plans (user_id, status, start_date, end_date);
