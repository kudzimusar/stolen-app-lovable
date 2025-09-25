# STOLEN Platform - Coherence Rules Implementation

## 🎯 **Purpose**

This document provides practical, actionable rules to maintain coherence across the STOLEN platform. These rules ensure every development decision aligns with our collective goals and maintains platform integrity.

---

## 🏗️ **STOLEN Collective Goals (Reference)**

### **Primary Mission**
> "To create a trusted, secure, and comprehensive ecosystem that reduces device theft through blockchain-powered traceability while providing secure, efficient, and community-driven solutions for all stakeholders in the device marketplace."

### **Core Objectives**
1. **Device Recovery**: Reduce device theft through community-driven recovery
2. **Marketplace Trust**: Create secure, escrow-protected device transactions  
3. **Stakeholder Unity**: Serve all 8 stakeholder types equally and effectively
4. **South African Focus**: Optimize for South African market (ZAR, FICA compliance)

---

## 🛡️ **COHERENCE RULES**

### **RULE 1: MISSION ALIGNMENT RULE**
> **Every feature must directly serve the device recovery mission or support stakeholder functionality**

#### **Implementation Checklist**
- [ ] Feature helps recover stolen devices OR
- [ ] Feature supports marketplace transactions OR  
- [ ] Feature serves one of the 8 stakeholder types OR
- [ ] Feature enhances community engagement

#### **Validation Questions**
1. "Does this feature help someone recover a stolen device?"
2. "Does this feature enable secure device transactions?"
3. "Does this feature serve a specific stakeholder need?"
4. "Does this feature build community around device recovery?"

#### **Approval Criteria**
- ✅ **APPROVE** if feature serves device recovery mission
- ✅ **APPROVE** if feature supports stakeholder functionality
- ❌ **REJECT** if feature doesn't serve mission or stakeholders

#### **Examples**
- ✅ **APPROVED**: Device registration system (serves recovery mission)
- ✅ **APPROVED**: Repair shop dashboard (serves repair shop stakeholder)
- ❌ **REJECTED**: Social media feed (doesn't serve mission)
- ❌ **REJECTED**: International payment system (not South African focus)

---

### **RULE 2: STAKEHOLDER EQUALITY RULE**
> **All 8 stakeholder types must receive equal attention and functionality**

#### **The 8 Stakeholder Types**
1. **Individual Users** - Device owners, buyers, sellers
2. **Repair Shops** - Device repair and maintenance services
3. **Retailers** - Device sales and inventory management
4. **Law Enforcement** - Investigation and recovery tools
5. **NGO Partners** - Community programs and donations
6. **Insurance Admin** - Claims processing and risk management
7. **Banks/Payment Gateways** - Financial transaction processing
8. **Platform Administrators** - System oversight and management

#### **Implementation Checklist**
- [ ] Feature serves all relevant stakeholder types
- [ ] No stakeholder type is excluded without justification
- [ ] Stakeholder-specific workflows are preserved
- [ ] Cross-stakeholder integration is maintained

#### **Validation Questions**
1. "Which stakeholder types does this feature serve?"
2. "Are we maintaining balance across all stakeholders?"
3. "Does this change affect stakeholder coverage?"
4. "Are we preserving stakeholder-specific functionality?"

#### **Approval Criteria**
- ✅ **APPROVE** if feature serves multiple stakeholders
- ✅ **APPROVE** if feature enhances stakeholder-specific functionality
- ❌ **REJECT** if feature excludes any stakeholder type
- ❌ **REJECT** if feature prioritizes one stakeholder over others

#### **Examples**
- ✅ **APPROVED**: Marketplace search (serves all buyer/seller stakeholders)
- ✅ **APPROVED**: Admin dashboard (serves platform administrators)
- ❌ **REJECTED**: Feature that only works for individual users
- ❌ **REJECTED**: Feature that excludes law enforcement

---

### **RULE 3: TECHNICAL CONSISTENCY RULE**
> **All technical decisions must maintain consistency with the established tech stack**

#### **Established Technology Stack**
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL) + Edge Functions
- **Payment**: S-Pay wallet system + Stripe integration
- **AI/ML**: OpenAI + Google Gemini
- **Blockchain**: Ethereum + Polygon
- **Mobile**: Progressive Web App (PWA)

#### **Implementation Checklist**
- [ ] Uses established technology stack
- [ ] Follows established API patterns
- [ ] Maintains database schema consistency
- [ ] Meets performance standards (<2s response, 99.9% uptime)

#### **Validation Questions**
1. "Does this use our established tech stack?"
2. "Is this consistent with our API patterns?"
3. "Does this maintain our database integrity?"
4. "Does this meet our performance standards?"

#### **Approval Criteria**
- ✅ **APPROVE** if uses established technologies
- ✅ **APPROVE** if follows established patterns
- ❌ **REJECT** if introduces new frameworks without justification
- ❌ **REJECT** if breaks established patterns

#### **Examples**
- ✅ **APPROVED**: New React component using Tailwind CSS
- ✅ **APPROVED**: New Supabase Edge Function
- ❌ **REJECTED**: Adding Vue.js components
- ❌ **REJECTED**: Creating custom API patterns

---

### **RULE 4: SOUTH AFRICAN FOCUS RULE**
> **All features must be optimized for the South African market**

#### **South African Requirements**
- **Currency**: ZAR (South African Rand) primary
- **Compliance**: FICA (Financial Intelligence Centre Act)
- **Banking**: Integration with South African banks
- **Language**: English primary, local context
- **Regulations**: South African legal requirements

#### **Implementation Checklist**
- [ ] Supports ZAR currency
- [ ] Complies with FICA regulations
- [ ] Works with South African banking systems
- [ ] Optimized for South African user behavior

#### **Validation Questions**
1. "Does this support ZAR currency?"
2. "Is this compliant with FICA regulations?"
3. "Does this work with South African banks?"
4. "Is this optimized for South African users?"

#### **Approval Criteria**
- ✅ **APPROVE** if optimized for South African market
- ✅ **APPROVE** if compliant with local regulations
- ❌ **REJECT** if focuses on international markets
- ❌ **REJECT** if doesn't comply with local regulations

#### **Examples**
- ✅ **APPROVED**: ZAR currency support in S-Pay
- ✅ **APPROVED**: FICA compliance features
- ❌ **REJECTED**: USD/EUR currency support
- ❌ **REJECTED**: International banking integration

---

### **RULE 5: S-PAY INTEGRATION RULE**
> **All financial features must integrate with the S-Pay wallet system**

#### **S-Pay Requirements**
- **Wallet System**: Primary payment method
- **Escrow Protection**: Secure transaction handling
- **ZAR Currency**: South African Rand support
- **FICA Compliance**: Financial compliance
- **Fraud Detection**: AI-powered fraud prevention

#### **Implementation Checklist**
- [ ] Integrates with S-Pay wallet system
- [ ] Maintains escrow protection
- [ ] Supports ZAR currency
- [ ] Includes fraud detection
- [ ] Complies with FICA regulations

#### **Validation Questions**
1. "Does this integrate with S-Pay wallet?"
2. "Is escrow protection maintained?"
3. "Does this support ZAR currency?"
4. "Is fraud detection included?"

#### **Approval Criteria**
- ✅ **APPROVE** if integrates with S-Pay
- ✅ **APPROVE** if maintains security standards
- ❌ **REJECT** if bypasses S-Pay system
- ❌ **REJECT** if compromises security

#### **Examples**
- ✅ **APPROVED**: Marketplace payment through S-Pay
- ✅ **APPROVED**: Escrow-protected transactions
- ❌ **REJECTED**: Direct payment without S-Pay
- ❌ **REJECTED**: Payment without escrow protection

---

## 🔍 **COHERENCE VALIDATION PROCESS**

### **Pre-Development Validation**
```bash
# 1. Check mission alignment
npm run validate:mission

# 2. Check stakeholder coverage  
npm run validate:stakeholders

# 3. Check technical consistency
npm run validate:technical

# 4. Check South African focus
npm run validate:localization

# 5. Check S-Pay integration
npm run validate:spay
```

### **During Development Validation**
- [ ] Feature serves device recovery mission
- [ ] Feature serves relevant stakeholder types
- [ ] Feature uses established tech stack
- [ ] Feature supports ZAR currency
- [ ] Feature integrates with S-Pay

### **Post-Development Validation**
- [ ] All coherence rules satisfied
- [ ] Stakeholder functionality preserved
- [ ] Technical consistency maintained
- [ ] South African compliance verified
- [ ] S-Pay integration confirmed

---

## 📊 **COHERENCE SCORING**

### **Scoring System**
Each rule is scored 0-100 points:
- **90-100**: Excellent coherence
- **80-89**: Good coherence  
- **70-79**: Acceptable coherence
- **60-69**: Poor coherence
- **0-59**: Coherence violation

### **Overall Coherence Score**
- **Mission Alignment**: 20%
- **Stakeholder Equality**: 20%
- **Technical Consistency**: 20%
- **South African Focus**: 20%
- **S-Pay Integration**: 20%

### **Coherence Targets**
- **Minimum Acceptable**: 80% overall
- **Target Achievement**: 90% overall
- **Excellence Level**: 95% overall

---

## 🚨 **COHERENCE VIOLATION RESPONSE**

### **When Violations Are Detected**

#### **1. Immediate Response**
- Stop development on violating feature
- Document the violation
- Assess impact on coherence score
- Plan corrective action

#### **2. Corrective Action**
- Update feature to comply with rules
- Re-validate against all coherence rules
- Test stakeholder functionality
- Verify technical consistency

#### **3. Prevention**
- Update development process
- Enhance validation procedures
- Improve team training
- Strengthen review process

---

## 🎯 **COHERENCE EXCELLENCE**

### **Achieving 95%+ Coherence**

#### **Strategic Excellence**
- Every feature serves device recovery mission
- All stakeholders receive equal attention
- South African market fully supported
- Community impact maximized

#### **Technical Excellence**
- Technology stack completely unified
- API patterns fully consistent
- Database integrity maintained
- Performance standards exceeded

#### **Functional Excellence**
- All features fully integrated
- Cross-stakeholder workflows seamless
- S-Pay integration complete
- Business logic fully consistent

---

## 📋 **QUICK REFERENCE**

### **Before Any Development**
1. **Mission Check**: Does this serve device recovery?
2. **Stakeholder Check**: Which stakeholders does this serve?
3. **Technical Check**: Does this use our tech stack?
4. **Local Check**: Is this optimized for South Africa?
5. **S-Pay Check**: Does this integrate with S-Pay?

### **Coherence Validation Commands**
```bash
npm run validate:coherence    # Full coherence check
npm run validate:mission      # Mission alignment
npm run validate:stakeholders # Stakeholder coverage
npm run validate:technical    # Technical consistency
npm run validate:localization # South African focus
npm run validate:spay         # S-Pay integration
```

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Maintainer**: STOLEN Development Team  
**Status**: Active Rules
