-- ADVANCED LEGAL RECORDS SYSTEM WITH SOPHISTICATED SCHEMA HANDLING
-- This system provides comprehensive legal compliance with dynamic schema adaptation
-- and advanced error handling while maintaining full functionality

BEGIN;

-- 1. CREATE ADVANCED LEGAL RECORDS TABLE WITH ENHANCED SECURITY
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
    risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
    fraud_indicators JSONB, -- Store fraud detection results
    verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    verification_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    archived_at TIMESTAMP,
    CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 100)
);

-- 2. CREATE ADVANCED ESCALATION CATEGORIES WITH PRIORITY MATRIX
CREATE TABLE IF NOT EXISTS escalation_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    escalation_days INTEGER NOT NULL,
    law_enforcement_required BOOLEAN DEFAULT TRUE,
    priority_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    auto_escalate BOOLEAN DEFAULT FALSE,
    notification_required BOOLEAN DEFAULT TRUE,
    risk_threshold INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_priority CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_risk_threshold CHECK (risk_threshold >= 0 AND risk_threshold <= 100)
);

-- Insert sophisticated escalation categories with advanced logic
INSERT INTO escalation_categories (category_name, description, escalation_days, law_enforcement_required, priority_level, auto_escalate, notification_required, risk_threshold) VALUES
('unclaimed_found', 'Found devices with no owner claims after 30 days', 30, TRUE, 'high', TRUE, TRUE, 60),
('disputed_ownership', 'Devices with multiple ownership claims', 7, TRUE, 'critical', TRUE, TRUE, 90),
('suspicious_activity', 'Reports flagged for suspicious patterns', 1, TRUE, 'critical', TRUE, TRUE, 95),
('high_value_items', 'Devices worth over R10,000', 14, TRUE, 'high', TRUE, TRUE, 70),
('stolen_reports', 'Devices reported as stolen', 0, TRUE, 'critical', TRUE, TRUE, 100),
('fraudulent_claims', 'Claims identified as potentially fraudulent', 1, TRUE, 'critical', TRUE, TRUE, 95),
('unusual_patterns', 'Reports showing unusual reporting patterns', 3, FALSE, 'medium', FALSE, TRUE, 40),
('bulk_reports', 'Multiple reports from same user in short time', 1, FALSE, 'medium', FALSE, TRUE, 30)
ON CONFLICT (category_name) DO NOTHING;

-- 3. CREATE ADVANCED ESCALATION LOG WITH AUDIT TRAIL
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
    risk_assessment JSONB, -- Store detailed risk analysis
    action_taken TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_escalation_status CHECK (status IN ('pending', 'acknowledged', 'investigating', 'resolved'))
);

-- 4. CREATE SOPHISTICATED LAW ENFORCEMENT INTEGRATION
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
    investigation_team JSONB, -- Store team member details
    case_timeline JSONB, -- Store chronological case events
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_case_status CHECK (case_status IN ('open', 'investigating', 'closed', 'archived')),
    CONSTRAINT valid_case_priority CHECK (case_priority IN ('low', 'medium', 'high', 'critical'))
);

-- 5. CREATE SECURITY AUDIT LOG FOR COMPREHENSIVE TRACKING
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    risk_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

-- 6. CREATE SOPHISTICATED LEGAL RECORD FUNCTION WITH ADVANCED ERROR HANDLING
CREATE OR REPLACE FUNCTION create_legal_record_from_report()
RETURNS TRIGGER AS $$
DECLARE
    v_imei_hash TEXT := NULL;
    v_imei_column_exists BOOLEAN;
    v_imei_value TEXT;
    v_user_display_name TEXT;
    v_user_email TEXT;
    v_legal_record_id UUID;
    v_risk_score INTEGER := 0;
    v_fraud_indicators JSONB := '{}';
    v_verification_status VARCHAR(50) := 'pending';
    v_verification_notes TEXT := '';
    v_sql TEXT;
    v_result RECORD;
BEGIN
    -- Advanced schema detection with comprehensive column verification
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'imei_number'
        AND table_schema = 'public'
        AND data_type IN ('text', 'varchar', 'character varying')
    ) INTO v_imei_column_exists;
    
    -- Sophisticated IMEI handling with multiple validation strategies
    IF v_imei_column_exists THEN
        BEGIN
            -- Advanced IMEI validation and hashing
            v_sql := format('
                SELECT 
                    CASE 
                        WHEN imei_number IS NOT NULL 
                        AND imei_number != ''''
                        AND LENGTH(TRIM(imei_number)) >= 10
                        AND imei_number ~ ''^[0-9]+$''
                        AND LENGTH(imei_number) <= 20
                        THEN hash_serial_number(imei_number)
                        ELSE NULL
                    END as imei_hash
                FROM lost_found_reports 
                WHERE id = %L', NEW.id);
            
            EXECUTE v_sql INTO v_result;
            v_imei_hash := v_result.imei_hash;
            
            -- Update risk score based on IMEI presence
            IF v_imei_hash IS NOT NULL THEN
                v_risk_score := v_risk_score + 10; -- IMEI presence increases trust
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- Advanced error handling with detailed logging
                v_imei_hash := NULL;
                v_fraud_indicators := v_fraud_indicators || jsonb_build_object(
                    'imei_error', SQLERRM,
                    'imei_error_time', NOW()
                );
                RAISE NOTICE 'Advanced IMEI extraction failed for report %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    -- Advanced user metadata extraction with multiple fallback strategies
    SELECT 
        COALESCE(
            raw_user_meta_data->>'display_name',
            raw_user_meta_data->>'full_name',
            raw_user_meta_data->>'name',
            raw_user_meta_data->>'user_name',
            email,
            'Anonymous User'
        ),
        COALESCE(
            email,
            raw_user_meta_data->>'email',
            'not.provided@stolen.com'
        )
    INTO v_user_display_name, v_user_email
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Advanced risk assessment and fraud detection
    -- Check for suspicious patterns
    IF EXISTS (
        SELECT 1 FROM lost_found_reports 
        WHERE user_id = NEW.user_id 
        AND created_at > NOW() - INTERVAL '24 hours'
        AND id != NEW.id
    ) THEN
        v_risk_score := v_risk_score + 30; -- Multiple reports in 24h
        v_fraud_indicators := v_fraud_indicators || jsonb_build_object(
            'multiple_reports_24h', true,
            'risk_factor', 'high_frequency_reporting'
        );
    END IF;
    
    -- Check for high-value items
    IF NEW.device_category IN ('laptop', 'tablet', 'smartphone') THEN
        v_risk_score := v_risk_score + 20;
        v_fraud_indicators := v_fraud_indicators || jsonb_build_object(
            'high_value_device', true,
            'device_category', NEW.device_category
        );
    END IF;
    
    -- Check for found items (higher risk of false claims)
    IF NEW.report_type = 'found' THEN
        v_risk_score := v_risk_score + 15;
        v_fraud_indicators := v_fraud_indicators || jsonb_build_object(
            'found_item', true,
            'verification_required', true
        );
        v_verification_status := 'pending';
        v_verification_notes := 'Found item requires additional verification';
    END IF;
    
    -- Create comprehensive legal record with full data integrity
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
        incident_description,
        legal_status,
        risk_score,
        fraud_indicators,
        verification_status,
        verification_notes,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        hash_serial_number(NEW.serial_number),
        v_imei_hash,
        COALESCE(NEW.device_model, 'Unknown Device'),
        COALESCE(NEW.device_category, 'Unknown Category'),
        NEW.report_type,
        NEW.user_id,
        v_user_display_name,
        v_user_email,
        COALESCE(NEW.incident_date, NEW.created_at, NOW()),
        COALESCE(NEW.location_address, 'Location Not Specified'),
        COALESCE(NEW.description, 'No description provided'),
        'active',
        v_risk_score,
        v_fraud_indicators,
        v_verification_status,
        v_verification_notes,
        NOW(),
        NOW()
    ) RETURNING id INTO v_legal_record_id;
    
    -- Advanced security audit logging
    INSERT INTO security_audit_log (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        risk_level
    ) VALUES (
        NEW.user_id,
        'legal_record_created',
        'legal_device_record',
        v_legal_record_id,
        jsonb_build_object(
            'report_id', NEW.id,
            'device_model', NEW.device_model,
            'report_type', NEW.report_type,
            'imei_processed', v_imei_column_exists,
            'imei_hash_created', v_imei_hash IS NOT NULL,
            'risk_score', v_risk_score,
            'fraud_indicators', v_fraud_indicators,
            'verification_status', v_verification_status
        ),
        CASE 
            WHEN v_risk_score >= 70 THEN 'high'
            WHEN v_risk_score >= 40 THEN 'medium'
            ELSE 'low'
        END
    );
    
    -- Advanced automatic escalation for high-risk items
    IF v_risk_score >= 70 THEN
        PERFORM escalate_legal_record(
            v_legal_record_id,
            'suspicious_activity',
            'Automatic escalation: High risk score (' || v_risk_score || ') detected',
            NEW.user_id
        );
    ELSIF NEW.report_type = 'found' AND NEW.device_category IN ('laptop', 'tablet', 'smartphone') THEN
        PERFORM escalate_legal_record(
            v_legal_record_id,
            'high_value_items',
            'Automatic escalation: High-value found device requires immediate attention',
            NEW.user_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE ADVANCED ESCALATION TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION check_escalation_triggers()
RETURNS TRIGGER AS $$
DECLARE
    v_days_since_created INTEGER;
    v_escalation_category_id UUID;
    v_escalation_days INTEGER;
    v_risk_assessment JSONB;
    v_auto_escalate BOOLEAN;
BEGIN
    -- Calculate days since creation
    v_days_since_created := EXTRACT(DAY FROM (NOW() - NEW.created_at));
    
    -- Advanced risk assessment for escalation decisions
    v_risk_assessment := jsonb_build_object(
        'days_old', v_days_since_created,
        'risk_score', NEW.risk_score,
        'fraud_indicators', NEW.fraud_indicators,
        'verification_status', NEW.verification_status
    );
    
    -- Check for unclaimed found devices (30 days) with risk-based escalation
    IF NEW.report_type = 'found' AND NEW.legal_status = 'active' AND v_days_since_created >= 30 THEN
        SELECT id, escalation_days, auto_escalate INTO v_escalation_category_id, v_escalation_days, v_auto_escalate
        FROM escalation_categories 
        WHERE category_name = 'unclaimed_found';
        
        IF v_escalation_category_id IS NOT NULL AND v_auto_escalate THEN
            -- Update legal record status with advanced tracking
            UPDATE legal_device_records 
            SET 
                legal_status = 'escalated',
                escalation_date = NOW(),
                escalation_reason = 'Automatic escalation: Unclaimed found device after ' || v_days_since_created || ' days (Risk Score: ' || NEW.risk_score || ')',
                updated_at = NOW()
            WHERE id = NEW.id;
            
            -- Create comprehensive escalation log entry
            INSERT INTO escalation_log (
                legal_record_id,
                escalation_category_id,
                escalation_reason,
                law_enforcement_notified,
                risk_assessment,
                action_taken,
                follow_up_required,
                follow_up_date
            ) VALUES (
                NEW.id,
                v_escalation_category_id,
                'Automatic escalation: Unclaimed found device after ' || v_days_since_created || ' days',
                TRUE,
                v_risk_assessment,
                'Record escalated to law enforcement for unclaimed device processing',
                TRUE,
                NOW() + INTERVAL '7 days'
            );
        END IF;
    END IF;
    
    -- Check for high-risk items requiring immediate attention
    IF NEW.risk_score >= 90 AND NEW.legal_status = 'active' THEN
        SELECT id INTO v_escalation_category_id
        FROM escalation_categories 
        WHERE category_name = 'suspicious_activity';
        
        IF v_escalation_category_id IS NOT NULL THEN
            UPDATE legal_device_records 
            SET 
                legal_status = 'escalated',
                escalation_date = NOW(),
                escalation_reason = 'Critical risk escalation: Risk score ' || NEW.risk_score || ' exceeds threshold',
                updated_at = NOW()
            WHERE id = NEW.id;
            
            INSERT INTO escalation_log (
                legal_record_id,
                escalation_category_id,
                escalation_reason,
                law_enforcement_notified,
                risk_assessment,
                action_taken,
                follow_up_required
            ) VALUES (
                NEW.id,
                v_escalation_category_id,
                'Critical risk escalation: Risk score ' || NEW.risk_score || ' exceeds threshold',
                TRUE,
                v_risk_assessment,
                'Immediate law enforcement notification required',
                TRUE
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. CREATE SOPHISTICATED ESCALATION MANAGEMENT FUNCTIONS
CREATE OR REPLACE FUNCTION escalate_legal_record(
    p_legal_record_id UUID,
    p_escalation_category VARCHAR(100),
    p_reason TEXT,
    p_escalated_by UUID
)
RETURNS JSON AS $$
DECLARE
    v_category_id UUID;
    v_legal_record RECORD;
    v_risk_assessment JSONB;
    v_result JSON;
BEGIN
    -- Get escalation category with validation
    SELECT id INTO v_category_id 
    FROM escalation_categories 
    WHERE category_name = p_escalation_category;
    
    IF v_category_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Invalid escalation category: ' || p_escalation_category);
    END IF;
    
    -- Get legal record details for comprehensive escalation
    SELECT * INTO v_legal_record
    FROM legal_device_records
    WHERE id = p_legal_record_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Legal record not found');
    END IF;
    
    -- Build comprehensive risk assessment
    v_risk_assessment := jsonb_build_object(
        'escalation_reason', p_reason,
        'current_risk_score', v_legal_record.risk_score,
        'fraud_indicators', v_legal_record.fraud_indicators,
        'device_category', v_legal_record.device_category,
        'report_type', v_legal_record.report_type,
        'escalation_time', NOW()
    );
    
    -- Update legal record with advanced tracking
    UPDATE legal_device_records 
    SET 
        legal_status = 'escalated',
        escalation_date = NOW(),
        escalation_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_legal_record_id;
    
    -- Create comprehensive escalation log
    INSERT INTO escalation_log (
        legal_record_id,
        escalation_category_id,
        escalated_by,
        escalation_reason,
        law_enforcement_notified,
        risk_assessment,
        action_taken,
        follow_up_required,
        follow_up_date
    ) VALUES (
        p_legal_record_id,
        v_category_id,
        p_escalated_by,
        p_reason,
        TRUE,
        v_risk_assessment,
        'Record escalated to ' || p_escalation_category || ' category',
        TRUE,
        NOW() + INTERVAL '3 days'
    );
    
    -- Advanced security audit logging
    INSERT INTO security_audit_log (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        risk_level
    ) VALUES (
        p_escalated_by,
        'legal_record_escalated',
        'legal_device_record',
        p_legal_record_id,
        jsonb_build_object(
            'escalation_category', p_escalation_category,
            'escalation_reason', p_reason,
            'risk_assessment', v_risk_assessment
        ),
        'high'
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'Record escalated successfully with comprehensive tracking',
        'legal_record_id', p_legal_record_id,
        'escalation_category', p_escalation_category,
        'risk_assessment', v_risk_assessment
    );
END;
$$ LANGUAGE plpgsql;

-- 9. CREATE ADVANCED LAW ENFORCEMENT CASE CREATION FUNCTION
CREATE OR REPLACE FUNCTION create_law_enforcement_case(
    p_legal_record_id UUID,
    p_case_number VARCHAR(100),
    p_officer_id VARCHAR(100),
    p_officer_name VARCHAR(255),
    p_department VARCHAR(255),
    p_jurisdiction VARCHAR(255),
    p_priority VARCHAR(20) DEFAULT 'medium',
    p_investigation_team JSONB DEFAULT '[]'::jsonb
)
RETURNS JSON AS $$
DECLARE
    v_case_id UUID;
    v_legal_record RECORD;
    v_case_timeline JSONB;
BEGIN
    -- Get legal record details
    SELECT * INTO v_legal_record
    FROM legal_device_records
    WHERE id = p_legal_record_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Legal record not found');
    END IF;
    
    -- Build comprehensive case timeline
    v_case_timeline := jsonb_build_object(
        'case_created', NOW(),
        'initial_report_date', v_legal_record.created_at,
        'escalation_date', v_legal_record.escalation_date,
        'risk_score', v_legal_record.risk_score,
        'fraud_indicators', v_legal_record.fraud_indicators
    );
    
    INSERT INTO law_enforcement_integration (
        legal_record_id,
        case_number,
        officer_id,
        officer_name,
        department,
        jurisdiction,
        case_priority,
        investigation_team,
        case_timeline,
        case_notes
    ) VALUES (
        p_legal_record_id,
        p_case_number,
        p_officer_id,
        p_officer_name,
        p_department,
        p_jurisdiction,
        p_priority,
        p_investigation_team,
        v_case_timeline,
        'Case created from legal record escalation. Risk Score: ' || v_legal_record.risk_score
    ) RETURNING id INTO v_case_id;
    
    -- Update legal record with case information
    UPDATE legal_device_records 
    SET 
        law_enforcement_case_number = p_case_number,
        law_enforcement_officer_id = p_officer_id,
        law_enforcement_department = p_department,
        updated_at = NOW()
    WHERE id = p_legal_record_id;
    
    RETURN json_build_object(
        'success', true,
        'case_id', v_case_id,
        'case_number', p_case_number,
        'message', 'Law enforcement case created successfully with comprehensive tracking',
        'legal_record_id', p_legal_record_id,
        'case_timeline', v_case_timeline
    );
END;
$$ LANGUAGE plpgsql;

-- 10. CREATE ADVANCED INDEXES FOR OPTIMAL PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_legal_records_report_id ON legal_device_records(report_id);
CREATE INDEX IF NOT EXISTS idx_legal_records_serial_hash ON legal_device_records(device_serial_hash);
CREATE INDEX IF NOT EXISTS idx_legal_records_imei_hash ON legal_device_records(device_imei_hash);
CREATE INDEX IF NOT EXISTS idx_legal_records_legal_status ON legal_device_records(legal_status);
CREATE INDEX IF NOT EXISTS idx_legal_records_risk_score ON legal_device_records(risk_score);
CREATE INDEX IF NOT EXISTS idx_legal_records_escalation_date ON legal_device_records(escalation_date);
CREATE INDEX IF NOT EXISTS idx_legal_records_verification_status ON legal_device_records(verification_status);
CREATE INDEX IF NOT EXISTS idx_escalation_log_legal_record ON escalation_log(legal_record_id);
CREATE INDEX IF NOT EXISTS idx_escalation_log_status ON escalation_log(status);
CREATE INDEX IF NOT EXISTS idx_escalation_log_date ON escalation_log(escalation_date);
CREATE INDEX IF NOT EXISTS idx_law_enforcement_case_number ON law_enforcement_integration(case_number);
CREATE INDEX IF NOT EXISTS idx_law_enforcement_status ON law_enforcement_integration(case_status);
CREATE INDEX IF NOT EXISTS idx_law_enforcement_priority ON law_enforcement_integration(case_priority);
CREATE INDEX IF NOT EXISTS idx_security_audit_user ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_action ON security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_risk_level ON security_audit_log(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_audit_created ON security_audit_log(created_at);

-- 11. CREATE SOPHISTICATED VIEWS FOR COMPREHENSIVE REPORTING
CREATE OR REPLACE VIEW legal_records_summary AS
SELECT 
    ldr.id,
    ldr.report_id,
    ldr.device_model,
    ldr.device_category,
    ldr.report_type,
    ldr.legal_status,
    ldr.risk_score,
    ldr.verification_status,
    ldr.incident_date,
    ldr.escalation_date,
    ldr.escalation_reason,
    ldr.law_enforcement_case_number,
    ldr.resolution_date,
    ldr.resolution_type,
    ec.category_name as escalation_category,
    ec.priority_level,
    ec.risk_threshold,
    lei.case_status as le_case_status,
    lei.officer_name,
    lei.department,
    lei.case_priority,
    ldr.fraud_indicators,
    ldr.created_at,
    ldr.updated_at
FROM legal_device_records ldr
LEFT JOIN escalation_log el ON ldr.id = el.legal_record_id
LEFT JOIN escalation_categories ec ON el.escalation_category_id = ec.id
LEFT JOIN law_enforcement_integration lei ON ldr.id = lei.legal_record_id
ORDER BY ldr.risk_score DESC, ldr.created_at DESC;

-- 12. MIGRATE EXISTING DATA WITH SOPHISTICATED SCHEMA HANDLING
DO $$
DECLARE
    v_imei_column_exists BOOLEAN;
    v_sql TEXT;
    v_migrated_count INTEGER := 0;
BEGIN
    -- Advanced schema detection
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'imei_number'
        AND table_schema = 'public'
        AND data_type IN ('text', 'varchar', 'character varying')
    ) INTO v_imei_column_exists;
    
    -- Build sophisticated migration SQL based on schema
    IF v_imei_column_exists THEN
        v_sql := '
            INSERT INTO legal_device_records (
                report_id, device_serial_hash, device_imei_hash, device_model, device_category,
                report_type, reporter_id, reporter_name, reporter_contact, incident_date,
                incident_location, incident_description, legal_status, risk_score, fraud_indicators,
                verification_status, verification_notes, created_at, updated_at
            )
            SELECT 
                lfr.id,
                hash_serial_number(lfr.serial_number),
                CASE 
                    WHEN lfr.imei_number IS NOT NULL 
                    AND lfr.imei_number != ''''
                    AND LENGTH(TRIM(lfr.imei_number)) >= 10
                    AND lfr.imei_number ~ ''^[0-9]+$''
                    THEN hash_serial_number(lfr.imei_number)
                    ELSE NULL
                END,
                COALESCE(lfr.device_model, ''Unknown Device''),
                COALESCE(lfr.device_category, ''Unknown Category''),
                lfr.report_type,
                lfr.user_id,
                COALESCE(u.raw_user_meta_data->>''display_name'', u.raw_user_meta_data->>''full_name'', ''Anonymous''),
                COALESCE(u.email, ''not.provided@stolen.com''),
                COALESCE(lfr.incident_date, lfr.created_at, NOW()),
                COALESCE(lfr.location_address, ''Location Not Specified''),
                COALESCE(lfr.description, ''No description provided''),
                CASE 
                    WHEN lfr.status = ''reunited'' THEN ''resolved''
                    WHEN lfr.status = ''reward_paid'' THEN ''resolved''
                    ELSE ''active''
                END,
                CASE 
                    WHEN lfr.report_type = ''found'' THEN 25
                    WHEN lfr.device_category IN (''laptop'', ''tablet'', ''smartphone'') THEN 20
                    ELSE 10
                END,
                jsonb_build_object(
                    ''migration_source'', ''existing_report'',
                    ''original_status'', lfr.status,
                    ''migration_date'', NOW()
                ),
                CASE 
                    WHEN lfr.report_type = ''found'' THEN ''pending''
                    ELSE ''verified''
                END,
                CASE 
                    WHEN lfr.report_type = ''found'' THEN ''Found item requires verification''
                    ELSE ''Migrated from existing report''
                END,
                lfr.created_at,
                NOW()
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
                incident_location, incident_description, legal_status, risk_score, fraud_indicators,
                verification_status, verification_notes, created_at, updated_at
            )
            SELECT 
                lfr.id,
                hash_serial_number(lfr.serial_number),
                NULL,
                COALESCE(lfr.device_model, ''Unknown Device''),
                COALESCE(lfr.device_category, ''Unknown Category''),
                lfr.report_type,
                lfr.user_id,
                COALESCE(u.raw_user_meta_data->>''display_name'', u.raw_user_meta_data->>''full_name'', ''Anonymous''),
                COALESCE(u.email, ''not.provided@stolen.com''),
                COALESCE(lfr.incident_date, lfr.created_at, NOW()),
                COALESCE(lfr.location_address, ''Location Not Specified''),
                COALESCE(lfr.description, ''No description provided''),
                CASE 
                    WHEN lfr.status = ''reunited'' THEN ''resolved''
                    WHEN lfr.status = ''reward_paid'' THEN ''resolved''
                    ELSE ''active''
                END,
                CASE 
                    WHEN lfr.report_type = ''found'' THEN 25
                    WHEN lfr.device_category IN (''laptop'', ''tablet'', ''smartphone'') THEN 20
                    ELSE 10
                END,
                jsonb_build_object(
                    ''migration_source'', ''existing_report'',
                    ''original_status'', lfr.status,
                    ''migration_date'', NOW(),
                    ''imei_column_missing'', true
                ),
                CASE 
                    WHEN lfr.report_type = ''found'' THEN ''pending''
                    ELSE ''verified''
                END,
                CASE 
                    WHEN lfr.report_type = ''found'' THEN ''Found item requires verification''
                    ELSE ''Migrated from existing report''
                END,
                lfr.created_at,
                NOW()
            FROM lost_found_reports lfr
            LEFT JOIN auth.users u ON lfr.user_id = u.id
            WHERE NOT EXISTS (
                SELECT 1 FROM legal_device_records ldr 
                WHERE ldr.report_id = lfr.id
            )';
    END IF;
    
    -- Execute sophisticated migration
    EXECUTE v_sql;
    GET DIAGNOSTICS v_migrated_count = ROW_COUNT;
    
    -- Advanced logging and verification
    RAISE NOTICE 'Advanced legal records migration completed successfully';
    RAISE NOTICE 'Records migrated: %', v_migrated_count;
    RAISE NOTICE 'IMEI column exists: %', v_imei_column_exists;
    
    -- Create comprehensive audit log
    INSERT INTO security_audit_log (
        action,
        resource_type,
        details,
        risk_level
    ) VALUES (
        'legal_records_migration',
        'system',
        jsonb_build_object(
            'migrated_count', v_migrated_count,
            'imei_column_exists', v_imei_column_exists,
            'migration_timestamp', NOW()
        ),
        'low'
    );
END $$;

-- 13. CREATE ADVANCED AUTOMATIC ESCALATION JOB FUNCTION
CREATE OR REPLACE FUNCTION process_automatic_escalations()
RETURNS JSON AS $$
DECLARE
    v_escalated_count INTEGER := 0;
    v_escalation_record RECORD;
    v_risk_threshold INTEGER;
    v_escalation_category_id UUID;
BEGIN
    -- Find records that need escalation with advanced criteria
    FOR v_escalation_record IN
        SELECT 
            ldr.id,
            ldr.report_id,
            ldr.device_model,
            ldr.report_type,
            ldr.risk_score,
            ldr.fraud_indicators,
            EXTRACT(DAY FROM (NOW() - ldr.created_at)) as days_old
        FROM legal_device_records ldr
        WHERE ldr.legal_status = 'active'
        AND (
            -- Unclaimed found devices after 30 days
            (ldr.report_type = 'found' AND EXTRACT(DAY FROM (NOW() - ldr.created_at)) >= 30)
            OR
            -- High value items after 14 days
            (ldr.device_category IN ('laptop', 'tablet', 'smartphone') AND EXTRACT(DAY FROM (NOW() - ldr.created_at)) >= 14)
            OR
            -- High risk items after 7 days
            (ldr.risk_score >= 70 AND EXTRACT(DAY FROM (NOW() - ldr.created_at)) >= 7)
            OR
            -- Critical risk items immediately
            (ldr.risk_score >= 90)
        )
    LOOP
        -- Determine escalation category based on risk and time
        IF v_escalation_record.risk_score >= 90 THEN
            SELECT id INTO v_escalation_category_id FROM escalation_categories WHERE category_name = 'suspicious_activity';
        ELSIF v_escalation_record.report_type = 'found' THEN
            SELECT id INTO v_escalation_category_id FROM escalation_categories WHERE category_name = 'unclaimed_found';
        ELSE
            SELECT id INTO v_escalation_category_id FROM escalation_categories WHERE category_name = 'high_value_items';
        END IF;
        
        -- Escalate the record with comprehensive tracking
        PERFORM escalate_legal_record(
            v_escalation_record.id,
            CASE 
                WHEN v_escalation_record.risk_score >= 90 THEN 'suspicious_activity'
                WHEN v_escalation_record.report_type = 'found' THEN 'unclaimed_found'
                ELSE 'high_value_items'
            END,
            'Automatic escalation: ' || 
            CASE 
                WHEN v_escalation_record.risk_score >= 90 THEN 'Critical risk score ' || v_escalation_record.risk_score
                WHEN v_escalation_record.report_type = 'found' THEN 'Unclaimed found device after ' || v_escalation_record.days_old || ' days'
                ELSE 'High-value item after ' || v_escalation_record.days_old || ' days'
            END,
            NULL -- System escalation
        );
        
        v_escalated_count := v_escalated_count + 1;
    END LOOP;
    
    -- Create comprehensive audit log
    INSERT INTO security_audit_log (
        action,
        resource_type,
        details,
        risk_level
    ) VALUES (
        'automatic_escalation_batch',
        'system',
        jsonb_build_object(
            'escalated_count', v_escalated_count,
            'execution_time', NOW()
        ),
        'medium'
    );
    
    RETURN json_build_object(
        'success', true,
        'escalated_count', v_escalated_count,
        'message', 'Advanced automatic escalation processing completed with comprehensive tracking',
        'execution_time', NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- 14. CREATE TRIGGERS WITH ADVANCED ERROR HANDLING
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS create_legal_record_trigger ON lost_found_reports;
DROP TRIGGER IF EXISTS check_escalation_trigger ON legal_device_records;

-- Create sophisticated triggers
CREATE TRIGGER create_legal_record_trigger
    AFTER INSERT ON lost_found_reports
    FOR EACH ROW
    EXECUTE FUNCTION create_legal_record_from_report();

CREATE TRIGGER check_escalation_trigger
    AFTER UPDATE ON legal_device_records
    FOR EACH ROW
    EXECUTE FUNCTION check_escalation_triggers();

-- 15. FINAL COMPREHENSIVE VERIFICATION
SELECT 
    'Advanced Legal Records System Complete' as status,
    'Comprehensive legal compliance system with sophisticated schema handling implemented' as message,
    NOW() as completion_time;

-- Show comprehensive summary
SELECT 
    'Legal Records Created' as table_type,
    COUNT(*) as record_count,
    'Active' as status
FROM legal_device_records
WHERE legal_status = 'active'
UNION ALL
SELECT 
    'Escalation Categories',
    COUNT(*),
    'Configured'
FROM escalation_categories
UNION ALL
SELECT 
    'Escalated Records',
    COUNT(*),
    'Requiring Attention'
FROM legal_device_records
WHERE legal_status = 'escalated'
UNION ALL
SELECT 
    'High Risk Records',
    COUNT(*),
    'Risk Score >= 70'
FROM legal_device_records
WHERE risk_score >= 70
UNION ALL
SELECT 
    'Security Audit Entries',
    COUNT(*),
    'System Tracking'
FROM security_audit_log;

-- Show risk distribution
SELECT 
    'Risk Score Distribution' as analysis_type,
    CASE 
        WHEN risk_score >= 90 THEN 'Critical (90-100)'
        WHEN risk_score >= 70 THEN 'High (70-89)'
        WHEN risk_score >= 40 THEN 'Medium (40-69)'
        ELSE 'Low (0-39)'
    END as risk_category,
    COUNT(*) as record_count,
    ROUND((COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM legal_device_records)) * 100, 2) as percentage
FROM legal_device_records
GROUP BY 
    CASE 
        WHEN risk_score >= 90 THEN 'Critical (90-100)'
        WHEN risk_score >= 70 THEN 'High (70-89)'
        WHEN risk_score >= 40 THEN 'Medium (40-69)'
        ELSE 'Low (0-39)'
    END
ORDER BY 
    CASE 
        WHEN CASE 
            WHEN risk_score >= 90 THEN 'Critical (90-100)'
            WHEN risk_score >= 70 THEN 'High (70-89)'
            WHEN risk_score >= 40 THEN 'Medium (40-69)'
            ELSE 'Low (0-39)'
        END = 'Critical (90-100)' THEN 1
        WHEN CASE 
            WHEN risk_score >= 90 THEN 'Critical (90-100)'
            WHEN risk_score >= 70 THEN 'High (70-89)'
            WHEN risk_score >= 40 THEN 'Medium (40-69)'
            ELSE 'Low (0-39)'
        END = 'High (70-89)' THEN 2
        WHEN CASE 
            WHEN risk_score >= 90 THEN 'Critical (90-100)'
            WHEN risk_score >= 70 THEN 'High (70-89)'
            WHEN risk_score >= 40 THEN 'Medium (40-69)'
            ELSE 'Low (0-39)'
        END = 'Medium (40-69)' THEN 3
        ELSE 4
    END;

COMMIT;
