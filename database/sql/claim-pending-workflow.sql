-- CLAIM PENDING WORKFLOW AND ADMIN APPROVAL PROCESS
-- Implements manual admin approval for all claims with 3-day auto-escalation

BEGIN;

-- 1. ADD CLAIM PENDING STATUS TO LOST_FOUND_REPORTS
ALTER TABLE lost_found_reports 
ADD COLUMN IF NOT EXISTS claim_status VARCHAR(50) DEFAULT 'no_claim', -- 'no_claim', 'claim_pending', 'claim_approved', 'claim_rejected'
ADD COLUMN IF NOT EXISTS claim_submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS claim_submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claim_verification_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS admin_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS auto_escalation_date TIMESTAMP;

-- 2. CREATE CLAIM SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS device_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES lost_found_reports(id) ON DELETE CASCADE,
    claimant_user_id UUID REFERENCES auth.users(id),
    claimant_name VARCHAR(255) NOT NULL,
    claimant_email VARCHAR(255) NOT NULL,
    claimant_phone VARCHAR(50),
    claim_type VARCHAR(50) NOT NULL, -- 'ownership_claim', 'finder_claim'
    device_serial_provided VARCHAR(255),
    device_imei_provided VARCHAR(255),
    device_mac_provided VARCHAR(255),
    ownership_proof JSONB, -- Store additional proof documents
    claim_description TEXT,
    claim_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'escalated'
    admin_review_notes TEXT,
    admin_reviewed_by UUID REFERENCES auth.users(id),
    admin_reviewed_at TIMESTAMP,
    auto_escalation_date TIMESTAMP DEFAULT (NOW() + INTERVAL '3 days'),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. CREATE CLAIM APPROVAL FUNCTION
CREATE OR REPLACE FUNCTION approve_device_claim(
    p_claim_id UUID,
    p_admin_user_id UUID,
    p_approval_status VARCHAR(50), -- 'approved' or 'rejected'
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_claim RECORD;
    v_report_id UUID;
    v_result JSON;
BEGIN
    -- Get claim details
    SELECT * INTO v_claim FROM device_claims WHERE id = p_claim_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Claim not found');
    END IF;
    
    v_report_id := v_claim.report_id;
    
    -- Update claim status
    UPDATE device_claims 
    SET 
        claim_status = p_approval_status,
        admin_review_notes = p_admin_notes,
        admin_reviewed_by = p_admin_user_id,
        admin_reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_claim_id;
    
    -- Update report status based on approval
    IF p_approval_status = 'approved' THEN
        UPDATE lost_found_reports 
        SET 
            claim_status = 'claim_approved',
            status = 'reunited',
            admin_reviewed_at = NOW(),
            admin_reviewed_by = p_admin_user_id,
            updated_at = NOW()
        WHERE id = v_report_id;
        
        -- Create notification for claimant
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            data
        ) VALUES (
            v_claim.claimant_user_id,
            'Claim Approved',
            'Your device claim has been approved. Please contact us to arrange device pickup.',
            'claim_approved',
            jsonb_build_object('claim_id', p_claim_id, 'report_id', v_report_id)
        );
        
    ELSIF p_approval_status = 'rejected' THEN
        UPDATE lost_found_reports 
        SET 
            claim_status = 'claim_rejected',
            admin_reviewed_at = NOW(),
            admin_reviewed_by = p_admin_user_id,
            updated_at = NOW()
        WHERE id = v_report_id;
        
        -- Create notification for claimant
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            data
        ) VALUES (
            v_claim.claimant_user_id,
            'Claim Rejected',
            'Your device claim has been rejected. ' || COALESCE(p_admin_notes, 'Please provide additional proof of ownership.'),
            'claim_rejected',
            jsonb_build_object('claim_id', p_claim_id, 'report_id', v_report_id)
        );
    END IF;
    
    -- Log admin action
    INSERT INTO security_audit_log (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        risk_level
    ) VALUES (
        p_admin_user_id,
        'claim_' || p_approval_status,
        'device_claim',
        p_claim_id,
        jsonb_build_object(
            'claim_id', p_claim_id,
            'report_id', v_report_id,
            'claimant_email', v_claim.claimant_email,
            'admin_notes', p_admin_notes
        ),
        'medium'
    );
    
    v_result := json_build_object(
        'success', true,
        'message', 'Claim ' || p_approval_status || ' successfully',
        'claim_id', p_claim_id,
        'report_id', v_report_id
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE AUTO-ESCALATION FUNCTION (3 DAYS)
CREATE OR REPLACE FUNCTION process_auto_escalations()
RETURNS JSON AS $$
DECLARE
    v_escalated_count INTEGER := 0;
    v_claim RECORD;
    v_legal_record_id UUID;
BEGIN
    -- Find claims that need auto-escalation (3 days)
    FOR v_claim IN
        SELECT 
            dc.id,
            dc.report_id,
            dc.claimant_email,
            dc.auto_escalation_date,
            lfr.device_model,
            lfr.device_category
        FROM device_claims dc
        JOIN lost_found_reports lfr ON dc.report_id = lfr.id
        WHERE dc.claim_status = 'pending'
        AND dc.auto_escalation_date <= NOW()
    LOOP
        -- Update claim status to escalated
        UPDATE device_claims 
        SET 
            claim_status = 'escalated',
            updated_at = NOW()
        WHERE id = v_claim.id;
        
        -- Update report status
        UPDATE lost_found_reports 
        SET 
            claim_status = 'claim_escalated',
            auto_escalation_date = NOW(),
            updated_at = NOW()
        WHERE id = v_claim.report_id;
        
        -- Find corresponding legal record and escalate
        SELECT id INTO v_legal_record_id 
        FROM legal_device_records 
        WHERE report_id = v_claim.report_id;
        
        IF v_legal_record_id IS NOT NULL THEN
            -- Escalate to law enforcement
            PERFORM escalate_legal_record(
                v_legal_record_id,
                'unclaimed_found',
                'Auto-escalation: Unclaimed found device after 3 days - Claim ID: ' || v_claim.id,
                NULL -- System escalation
            );
        END IF;
        
        -- Create law enforcement case
        PERFORM create_law_enforcement_case(
            v_legal_record_id,
            'LE-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || LPAD(v_escalated_count::TEXT, 4, '0'),
            'AUTO-SYSTEM',
            'STOLEN App Auto-Escalation',
            'Local Law Enforcement',
            'Local Jurisdiction',
            'high'
        );
        
        v_escalated_count := v_escalated_count + 1;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'escalated_count', v_escalated_count,
        'message', 'Auto-escalation processing completed - 3 day threshold'
    );
END;
$$ LANGUAGE plpgsql;

-- 5. CREATE CLAIM SUBMISSION FUNCTION
CREATE OR REPLACE FUNCTION submit_device_claim(
    p_report_id UUID,
    p_claimant_user_id UUID,
    p_claimant_name VARCHAR(255),
    p_claimant_email VARCHAR(255),
    p_claimant_phone VARCHAR(50),
    p_claim_type VARCHAR(50),
    p_device_serial_provided VARCHAR(255),
    p_device_imei_provided VARCHAR(255),
    p_device_mac_provided VARCHAR(255),
    p_ownership_proof JSONB,
    p_claim_description TEXT
)
RETURNS JSON AS $$
DECLARE
    v_claim_id UUID;
    v_report RECORD;
    v_verification_score INTEGER := 0;
    v_result JSON;
BEGIN
    -- Get report details
    SELECT * INTO v_report FROM lost_found_reports WHERE id = p_report_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Report not found');
    END IF;
    
    -- Check if claim already exists
    IF EXISTS (SELECT 1 FROM device_claims WHERE report_id = p_report_id AND claimant_user_id = p_claimant_user_id) THEN
        RETURN json_build_object('success', false, 'error', 'Claim already submitted for this device');
    END IF;
    
    -- Calculate verification score
    IF p_device_serial_provided = v_report.serial_number THEN
        v_verification_score := v_verification_score + 40;
    END IF;
    
    IF p_device_imei_provided = v_report.device_imei_number THEN
        v_verification_score := v_verification_score + 30;
    END IF;
    
    IF p_device_mac_provided = v_report.device_mac_address THEN
        v_verification_score := v_verification_score + 20;
    END IF;
    
    -- Create claim
    INSERT INTO device_claims (
        report_id,
        claimant_user_id,
        claimant_name,
        claimant_email,
        claimant_phone,
        claim_type,
        device_serial_provided,
        device_imei_provided,
        device_mac_provided,
        ownership_proof,
        claim_description,
        auto_escalation_date
    ) VALUES (
        p_report_id,
        p_claimant_user_id,
        p_claimant_name,
        p_claimant_email,
        p_claimant_phone,
        p_claim_type,
        p_device_serial_provided,
        p_device_imei_provided,
        p_device_mac_provided,
        p_ownership_proof,
        p_claim_description,
        NOW() + INTERVAL '3 days'
    ) RETURNING id INTO v_claim_id;
    
    -- Update report status
    UPDATE lost_found_reports 
    SET 
        claim_status = 'claim_pending',
        claim_submitted_at = NOW(),
        claim_submitted_by = p_claimant_user_id,
        claim_verification_notes = 'Verification score: ' || v_verification_score || '/100',
        updated_at = NOW()
    WHERE id = p_report_id;
    
    -- Create notification for admins
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        data
    ) 
    SELECT 
        au.user_id,
        'New Device Claim',
        'A new claim has been submitted for device: ' || v_report.device_model || ' (Verification Score: ' || v_verification_score || '/100)',
        'new_claim',
        jsonb_build_object('claim_id', v_claim_id, 'report_id', p_report_id, 'verification_score', v_verification_score)
    FROM admin_users au
    WHERE au.is_active = TRUE
    AND au.permissions ? 'admin:lost-found';
    
    v_result := json_build_object(
        'success', true,
        'claim_id', v_claim_id,
        'verification_score', v_verification_score,
        'message', 'Claim submitted successfully. Admin review required.',
        'auto_escalation_date', NOW() + INTERVAL '3 days'
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_device_claims_report_id ON device_claims(report_id);
CREATE INDEX IF NOT EXISTS idx_device_claims_claimant ON device_claims(claimant_user_id);
CREATE INDEX IF NOT EXISTS idx_device_claims_status ON device_claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_device_claims_escalation ON device_claims(auto_escalation_date);
CREATE INDEX IF NOT EXISTS idx_lost_found_reports_claim_status ON lost_found_reports(claim_status);

-- 7. FINAL VERIFICATION
SELECT 
    'Claim Pending Workflow Complete' as status,
    'Manual admin approval with 3-day auto-escalation implemented' as message,
    NOW() as completion_time;

-- Show workflow statistics
SELECT 
    'Workflow Statistics' as analysis_type,
    'Pending Claims' as status_type,
    COUNT(*) as count
FROM device_claims
WHERE claim_status = 'pending'

UNION ALL

SELECT 
    'Workflow Statistics',
    'Approved Claims',
    COUNT(*)
FROM device_claims
WHERE claim_status = 'approved'

UNION ALL

SELECT 
    'Workflow Statistics',
    'Rejected Claims',
    COUNT(*)
FROM device_claims
WHERE claim_status = 'rejected'

UNION ALL

SELECT 
    'Workflow Statistics',
    'Escalated Claims',
    COUNT(*)
FROM device_claims
WHERE claim_status = 'escalated';

COMMIT;
