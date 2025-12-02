-- Add due_date column to tasks table
-- Run this in Supabase SQL Editor

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Add index for faster queries on due_date
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Optional: Add comment to column
COMMENT ON COLUMN tasks.due_date IS 'Deadline date and time for the task';
