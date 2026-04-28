-- Script to fill missing permissions in platform_role_permissions using staff_role enum
DO $$
DECLARE
    r_role TEXT;
    r_resource TEXT;
    r_action TEXT;
    roles TEXT[] := ARRAY['admin', 'manager', 'staff'];
    resources TEXT[] := ARRAY['tenants', 'users', 'staff', 'financials', 'integrations', 'audit', 'vitacoins', 'permissions'];
    actions TEXT[] := ARRAY['read', 'create', 'update', 'delete'];
BEGIN
    FOREACH r_role IN ARRAY roles
    LOOP
        FOREACH r_resource IN ARRAY resources
        LOOP
            FOREACH r_action IN ARRAY actions
            LOOP
                -- Check if the permission already exists (using staff_role type)
                IF NOT EXISTS (
                    SELECT 1 FROM platform_role_permissions 
                    WHERE role = r_role::staff_role 
                    AND resource = r_resource 
                    AND action = r_action
                ) THEN
                    -- Insert missing permission as FALSE by default
                    INSERT INTO platform_role_permissions (role, resource, action, allowed)
                    VALUES (r_role::staff_role, r_resource, r_action, false);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- Ensure super_admin has all permissions as TRUE
    FOREACH r_resource IN ARRAY resources
    LOOP
        FOREACH r_action IN ARRAY actions
        LOOP
            IF NOT EXISTS (
                SELECT 1 FROM platform_role_permissions 
                WHERE role = 'super_admin'::staff_role 
                AND resource = r_resource 
                AND action = r_action
            ) THEN
                INSERT INTO platform_role_permissions (role, resource, action, allowed)
                VALUES ('super_admin'::staff_role, r_resource, r_action, true);
            ELSE
                UPDATE platform_role_permissions 
                SET allowed = true 
                WHERE role = 'super_admin'::staff_role 
                AND resource = r_resource 
                AND action = r_action;
            END IF;
        END LOOP;
    END LOOP;
END $$;