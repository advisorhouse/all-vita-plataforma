
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE public.staff_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.staff_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.staff_role ADD VALUE IF NOT EXISTS 'staff';
