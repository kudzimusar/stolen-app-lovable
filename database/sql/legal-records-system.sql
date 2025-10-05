-- COMPREHENSIVE LEGAL RECORDS SYSTEM
-- All lost/found devices automatically recorded for legal compliance

BEGIN;

-- 1. CREATE LEGAL RECORDS TABLE
-- Every device report becomes a legal record
CREATE TABLE IF NOT EXISTS legal_device_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES lost_found_reports(id) ON DELETE CASCADE,
    device_serial_hash VARCHAR(255) NOT NULL,
    device_imei_hash VARCHAR(255),
    device_model VARCHAR(255) NOT NULL,
    device_category VARCHAR(100) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'lost' or 'found'
    reporter_id UUID REFERENCES auth.users(id),
    reporter_name VARCHAR(255) NOT NULL,
    reporter_contact VARCHAR(255),
    incident_date TIMESTAMP NOT NULL,
    incident_location TEXT NOT NULL,
    incident_description TEXT NOT NULL,
    legal_status VARCHAR(50) DEFAULT 'active', -- 'active', 'escalated', 'resolved', 'archived'
    escalation_date TIMESTAMP,
    escalation_reason TEXT,
    law_enforcement_case_number VARCHAR(100),
    law_enforcement_officer_id VARCHAR(100),
    law_enforcement_department VARCHAR(255),
    resolution_date TIMESTAMP,
    resolution_type VARCHAR(50), -- 'reunited', 'confiscated', 'destroyed', 'unclaimed'
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    archived_at TIMESTAMP
);

-- 2. CREATE ESCALATION CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS escalation_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    escalation_days INTEGER NOT NULL,
    law_enforcement_required BOOLEAN DEFAULT TRUE,
    priority_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default escalation categories
INSERT INTO escalation_categories (category_name, description, escalation_days, law_enforcement_required, priority_level) VALUES
('unclaimed_found', 'Found devices with no owner claims after 30 days', 30, TRUE, 'high'),
('disputed_ownership', 'Devices with multiple ownership claims', 7, TRUE, 'critical'),
('suspicious_activity', 'Reports flagged for suspicious patterns', 1, TRUE, 'critical'),
('high_value_items', 'Devices worth over R10,000', 14, TRUE, 'high'),
('stolen_reports', 'Devices reported as stolen', 0, TRUE, 'critical'),
('fraudulent_claims', 'Claims identified as potentially fraudulent', 1, TRUE, 'critical')
ON CONFLICT (category_name) DO NOTHING;

-- 3. CREATE ESCALATION LOG TABLE
CREATE TABLE IF NOT EXISTS escalation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_record_id UUID REFERENCES legal_device_records(id) ON DELETE CASCADE,
    escalation_category_id UUID REFERENCES escalation_categories(id),
    escalated_by UUID REFERENCES auth.users(id),
    escalation_reason TEXT NOT NULL,
    escalation_date TIMESTAMP DEFAULT NOW(),
    law_enforcement_notified BOOLEAN DEFAULT FALSE,
    law_enforcement_response TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'acknowledged', 'investigating', 'resolved'
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. CREATE LAW ENFORCEMENT INTEGRATION TABLE
CREATE TABLE IF NOT EXISTS law_enforcement_integration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_record_id UUID REFERENCES legal_device_records(id) ON DELETE CASCADE,
    case_number VARCHAR(100) UNIQUE,
    officer_id VARCHAR(100),
    officer_name VARCHAR(255),
    department VARCHAR(255),
    jurisdiction VARCHAR(255),
    case_status VARCHAR(50) DEFAULT 'open', -- 'open', 'investigating', 'closed', 'archived'
    case_priority VARCHAR(20) DEFAULT 'medium',
    assigned_date TIMESTAMP DEFAULT NOW(),
    last_contact_date TIMESTAMP,
    next_follow_up_date TIMESTAMP,
    case_notes TEXT,
    evidence_collected JSONB,
    court_proceedings BOOLEAN DEFAULT FALSE,
    court_case_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. CREATE AUTOMATIC LEGAL RECORD FUNCTION
CREATE OR REPLACE FUNCTION create_legal_record_from_report()
RETURNS TRIGGER AS $$
DECLARE
    v_imei_hash TEXT := NULL;
BEGIN
    -- Try to hash IMEI if it exists, catch error if column doesn't exist
    BEGIN
        -- This will only work if imei_number column exists
        IF NEW.imei_number IS NOT NULL AND NEW.imei_number != '' THEN
            v_imei_hash := hash_serial_number(NEW.imei_number);
        END IF;
    EXCEPTION
        WHEN undefined_column THEN
            -- Column doesn't exist, keep imei_hash as NULL
            v_imei_hash := NULL;
        WHEN OTHERS THEN
            -- Any other error, keep imei_hash as NULL
            v_imei_hash := NULL;
    END;
    
    -- Create legal record for every new report
    INSERT INTO legal_device_records (
        report_id,
        device_serial_hash,
        device_imei_hash,
        device_model,
        device_category,
        report_type,
        reporter_id,
        reporter_name,
        reporter_contact,
        incident_date,
        incident_location,
        incident_description
    ) VALUES (
        NEW.id,
        hash_serial_number(NEW.serial_number),
        v_imei_hash,
        NEW.device_model,
        NEW.device_category,
        NEW.report_type,
        NEW.user_id,
        COALESCE(
            (SELECT raw_user_meta_data->>'display_name' FROM auth.users WHERE id = NEW.user_id),
            (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = NEW.user_id),
            'Anonymous'
        ),
        COALESCE(
            (SELECT email FROM auth.users WHERE id = NEW.user_id),
            'Not provided'
        ),
        NEW.incident_date,
        NEW.location_address,
        NEW.description
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE ESCALATION TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION check_escalation_triggers()
RETURNS TRIGGER AS $$
DECLARE
    v_days_since_created INTEGER;
    v_escalation_category_id UUID;
    v_escalation_days INTEGER;
BEGIN
    -- Calculate days since creation
    v_days_since_created := EXTRACT(DAY FROM (NOW() - NEW.created_at));
    
    -- Check for unclaimed found devices (30 days)
    IF NEW.report_type = 'found' AND NEW.legal_status = 'active' AND v_days_since_created >= 30 THEN
        SELECT id, escalation_days INTO v_escalation_category_id, v_escalation_days
        FROM escalation_categories 
        WHERE category_name = 'unclaimed_found';
        
        IF v_escalation_category_id IS NOT NULL THEN
            -- Update legal record status
            UPDATE legal_device_records 
            SET 
                legal_status = 'escalated',
                escalation_date = NOW(),
                escalation_reason = 'Unclaimed found device after ' || v_escalation_days || ' days'
            WHERE id = NEW.id;
            
            -- Create escalation log entry
            INSERT INTO escalation_log (
                legal_record_id,
                escalation_category_id,
                escalation_reason,
                law_enforcement_notified
            ) VALUES (
                NEW.id,
                v_escalation_category_id,
                'Automatic escalation: Unclaimed found device after ' || v_escalation_days || ' days',
                TRUE
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE TRIGGERS
-- Trigger to create legal record for every new report
CREATE TRIGGER create_legal_record_trigger
    AFTER INSERT ON lost_found_reports
    FOR EACH ROW
    EXECUTE FUNCTION create_legal_record_from_report();

-- Trigger to check escalation conditions
CREATE TRIGGER check_escalation_trigger
    AFTER UPDATE ON legal_device_records
    FOR EACH ROW
    EXECUTE FUNCTION check_escalation_triggers();

-- 8. CREATE ESCALATION MANAGEMENT FUNCTIONS
CREATE OR REPLACE FUNCTION escalate_legal_record(
    p_legal_record_id UUID,
    p_escalation_category VARCHAR(100),
    p_reason TEXT,
    p_escalated_by UUID
)
RETURNS JSON AS $$
DECLARE
    v_category_id UUID;
    v_result JSON;
BEGIN
    -- Get escalation category
    SELECT id INTO v_category_id 
    FROM escalation_categories 
    WHERE category_name = p_escalation_category;
    
    IF v_category_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Invalid escalation category');
    END IF;
    
    -- Update legal record
    UPDATE legal_device_records 
    SET 
        legal_status = 'escalated',
        escalation_date = NOW(),
        escalation_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_legal_record_id;
    
    -- Create escalation log
    INSERT INTO escalation_log (
        legal_record_id,
        escalation_category_id,
        escalated_by,
        escalation_reason,
        law_enforcement_notified
    ) VALUES (
        p_legal_record_id,
        v_category_id,
        p_escalated_by,
        p_reason,
        TRUE
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'Record escalated successfully',
        'legal_record_id', p_legal_record_id
    );
END;
$$ LANGUAGE plpgsql;

-- 9. CREATE LAW ENFORCEMENT CASE CREATION FUNCTION
CREATE OR REPLACE FUNCTION create_law_enforcement_case(
    p_legal_record_id UUID,
    p_case_number VARCHAR(100),
    p_officer_id VARCHAR(100),
    p_officer_name VARCHAR(255),
    p_department VARCHAR(255),
    p_jurisdiction VARCHAR(255),
    p_priority VARCHAR(20) DEFAULT 'medium'
)
RETURNS JSON AS $$
DECLARE
    v_case_id UUID;
BEGIN
    INSERT INTO law_enforcement_integration (
        legal_record_id,
        case_number,
        officer_id,
        officer_name,
        department,
        jurisdiction,
        case_priority
    ) VALUES (
        p_legal_record_id,
        p_case_number,
        p_officer_id,
        p_officer_name,
        p_department,
        p_jurisdiction,
        p_priority
    ) RETURNING id INTO v_case_id;
    
    RETURN json_build_object(
        'success', true,
        'case_id', v_case_id,
        'case_number', p_case_number,
        'message', 'Law enforcement case created successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- 10. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_legal_records_report_id ON legal_device_records(report_id);
CREATE INDEX IF NOT EXISTS idx_legal_records_serial_hash ON legal_device_records(device_serial_hash);
CREATE INDEX IF NOT EXISTS idx_legal_records_legal_status ON legal_device_records(legal_status);
CREATE INDEX IF NOT EXISTS idx_legal_records_escalation_date ON legal_device_records(escalation_date);
CREATE INDEX IF NOT EXISTS idx_escalation_log_legal_record ON escalation_log(legal_record_id);
CREATE INDEX IF NOT EXISTS idx_escalation_log_status ON escalation_log(status);
CREATE INDEX IF NOT EXISTS idx_law_enforcement_case_number ON law_enforcement_integration(case_number);
CREATE INDEX IF NOT EXISTS idx_law_enforcement_status ON law_enforcement_integration(case_status);

-- 11. CREATE VIEWS FOR REPORTING
CREATE OR REPLACE VIEW legal_records_summary AS
SELECT 
    ldr.id,
    ldr.report_id,
    ldr.device_model,
    ldr.device_category,
    ldr.report_type,
    ldr.legal_status,
    ldr.incident_date,
    ldr.escalation_date,
    ldr.escalation_reason,
    ldr.law_enforcement_case_number,
    ldr.resolution_date,
    ldr.resolution_type,
    ec.category_name as escalation_category,
    ec.priority_level,
    lei.case_status as le_case_status,
    lei.officer_name,
    lei.department
FROM legal_device_records ldr
LEFT JOIN escalation_log el ON ldr.id = el.legal_record_id
LEFT JOIN escalation_categories ec ON el.escalation_category_id = ec.id
LEFT JOIN law_enforcement_integration lei ON ldr.id = lei.legal_record_id
ORDER BY ldr.created_at DESC;

-- 12. MIGRATE EXISTING DATA TO LEGAL RECORDS
-- Create legal records for all existing reports using dynamic SQL
DO $$
DECLARE
    v_imei_column_exists BOOLEAN;
    v_sql TEXT;
BEGIN
    -- Check if imei_number column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'imei_number'
        AND table_schema = 'public'
    ) INTO v_imei_column_exists;
    
    -- Build dynamic SQL based on column existence
    IF v_imei_column_exists THEN
        v_sql := '
            INSERT INTO legal_device_records (
                report_id, device_serial_hash, device_imei_hash, device_model, device_category,
                report_type, reporter_id, reporter_name, reporter_contact, incident_date,
                incident_location, incident_description, legal_status
            )
            SELECT 
                lfr.id,
                hash_serial_number(lfr.serial_number),
                CASE 
                    WHEN lfr.imei_number IS NOT NULL AND lfr.imei_number != '''' 
                    THEN hash_serial_number(lfr.imei_number)
                    ELSE NULL
                END,
                lfr.device_model,
                lfr.device_category,
                lfr.report_type,
                lfr.user_id,
                COALESCE(u.raw_user_meta_data->>''display_name'', u.raw_user_meta_data->>''full_name'', ''Anonymous''),
                COALESCE(u.email, ''Not provided''),
                lfr.incident_date,
                lfr.location_address,
                lfr.description,
                CASE 
                    WHEN lfr.status = ''reunited'' THEN ''resolved''
                    WHEN lfr.status = ''reward_paid'' THEN ''resolved''
                    ELSE ''active''
                END
            FROM lost_found_reports lfr
            LEFT JOIN auth.users u ON lfr.user_id = u.id
            WHERE NOT EXISTS (
                SELECT 1 FROM legal_device_records ldr 
                WHERE ldr.report_id = lfr.id
            )';
    ELSE
        v_sql := '
            INSERT INTO legal_device_records (
                report_id, device_serial_hash, device_imei_hash, device_model, device_category,
                report_type, reporter_id, reporter_name, reporter_contact, incident_date,
                incident_location, incident_description, legal_status
            )
            SELECT 
                lfr.id,
                hash_serial_number(lfr.serial_number),
                NULL,
                lfr.device_model,
                lfr.device_category,
                lfr.report_type,
                lfr.user_id,
                COALESCE(u.raw_user_meta_data->>''display_name'', u.raw_user_meta_data->>''full_name'', ''Anonymous''),
                COALESCE(u.email, ''Not provided''),
                lfr.incident_date,
                lfr.location_address,
                lfr.description,
                CASE 
                    WHEN lfr.status = ''reunited'' THEN ''resolved''
                    WHEN lfr.status = ''reward_paid'' THEN ''resolved''
                    ELSE ''active''
                END
            FROM lost_found_reports lfr
            LEFT JOIN auth.users u ON lfr.user_id = u.id
            WHERE NOT EXISTS (
                SELECT 1 FROM legal_device_records ldr 
                WHERE ldr.report_id = lfr.id
            )';
    END IF;
    
    -- Execute the dynamic SQL
    EXECUTE v_sql;
    
    RAISE NOTICE 'Legal records migration completed. IMEI column exists: %', v_imei_column_exists;
END $$;

-- 13. CREATE AUTOMATIC ESCALATION JOB FUNCTION
CREATE OR REPLACE FUNCTION process_automatic_escalations()
RETURNS JSON AS $$
DECLARE
    v_escalated_count INTEGER := 0;
    v_escalation_record RECORD;
BEGIN
    -- Find records that need escalation
    FOR v_escalation_record IN
        SELECT 
            ldr.id,
            ldr.report_id,
            ldr.device_model,
            ldr.report_type,
            EXTRACT(DAY FROM (NOW() - ldr.created_at)) as days_old
        FROM legal_device_records ldr
        WHERE ldr.legal_status = 'active'
        AND (
            -- Unclaimed found devices after 30 days
            (ldr.report_type = 'found' AND EXTRACT(DAY FROM (NOW() - ldr.created_at)) >= 30)
            OR
            -- High value items after 14 days
            (ldr.device_category IN ('laptop', 'tablet', 'smartphone') AND EXTRACT(DAY FROM (NOW() - ldr.created_at)) >= 14)
        )
    LOOP
        -- Escalate the record
        PERFORM escalate_legal_record(
            v_escalation_record.id,
            CASE 
                WHEN v_escalation_record.report_type = 'found' THEN 'unclaimed_found'
                ELSE 'high_value_items'
            END,
            'Automatic escalation after ' || v_escalation_record.days_old || ' days',
            NULL -- System escalation
        );
        
        v_escalated_count := v_escalated_count + 1;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'escalated_count', v_escalated_count,
        'message', 'Automatic escalation processing completed'
    );
END;
$$ LANGUAGE plpgsql;

-- 14. FINAL VERIFICATION
SELECT 
    'Legal Records System Complete' as status,
    'All devices now tracked for legal compliance' as message,
    NOW() as completion_time;

-- Show summary
SELECT 
    'Legal Records Created' as table_type,
    COUNT(*) as record_count
FROM legal_device_records
UNION ALL
SELECT 
    'Escalation Categories',
    COUNT(*)
FROM escalation_categories
UNION ALL
SELECT 
    'Active Legal Records',
    COUNT(*)
FROM legal_device_records
WHERE legal_status = 'active';

COMMIT;
