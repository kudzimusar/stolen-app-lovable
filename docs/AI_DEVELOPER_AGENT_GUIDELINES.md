# AI Developer Agent Guidelines - STOLEN Platform

## 🎯 **Purpose**

This document provides comprehensive guidelines for AI developer agents (like me) working on the STOLEN platform to ensure code coherence, maintain quality standards, and prevent changes that could break the system.

---

## 🏗️ **Code Coherence Definition**

**Code Coherence** in the STOLEN platform means maintaining consistent code quality, patterns, architecture, and implementation standards across the entire codebase so that any change integrates seamlessly without breaking existing functionality or introducing inconsistencies.

### **Key Principles for AI Agents**
- **Pattern Consistency**: Use the same coding patterns throughout
- **Quality Standards**: Maintain the same level of code quality
- **Integration Safety**: Ensure changes don't break existing functionality
- **Testing Consistency**: Apply the same testing standards everywhere
- **Architecture Preservation**: Follow established architectural patterns

---

## 🛡️ **Pre-Change Analysis Protocol**

### **Before Making ANY Changes**

#### **1. Codebase Analysis**
```typescript
// Example: AI Agent Pre-Change Analysis
class PreChangeAnalysis {
  analyzeExistingPatterns(componentType: string): PatternAnalysis {
    // Find similar components
    // Identify established patterns
    // Check for consistency
    // Document findings
  }
  
  assessImpact(change: CodeChange): ImpactAssessment {
    // Identify dependencies
    // Check for breaking changes
    // Validate integration points
    // Assess testing impact
  }
}
```

#### **2. Pattern Discovery**
- **Find Similar Components**: Look for existing components with similar functionality
- **Identify Patterns**: Document the established patterns used
- **Check Consistency**: Ensure patterns are consistently applied
- **Reference Implementation**: Use existing code as a reference

#### **3. Impact Assessment**
- **Dependency Analysis**: What does this change affect?
- **Integration Points**: Where does this integrate with existing code?
- **Testing Requirements**: What tests need to be updated?
- **Performance Impact**: Could this affect performance?

### **Analysis Checklist**
- [ ] **Pattern Analysis**: Found similar components and their patterns
- [ ] **Quality Standards**: Identified quality standards used
- [ ] **Testing Patterns**: Found existing test patterns
- [ ] **Integration Points**: Identified all integration points
- [ ] **Dependencies**: Mapped all dependencies
- [ ] **Breaking Changes**: Assessed potential breaking changes

---

## 🔧 **Implementation Guidelines**

### **1. Pattern Consistency**

#### **React Component Patterns**
```typescript
// ✅ CORRECT: Follow established pattern
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComponentProps {
  title: string;
  onAction: () => void;
}

export default function ComponentName({ title, onAction }: ComponentProps) {
  const [state, setState] = useState<string>('');
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>Action</Button>
      </CardContent>
    </Card>
  );
}
```

#### **API Endpoint Patterns**
```typescript
// ✅ CORRECT: Follow established API pattern
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const RequestSchema = z.object({
  // Validation schema
});

export default async function handler(req: Request) {
  try {
    // Input validation
    const validatedData = RequestSchema.parse(req.body);
    
    // Business logic
    const result = await processRequest(validatedData);
    
    // Response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Error handling
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

#### **Database Patterns**
```typescript
// ✅ CORRECT: Follow established database pattern
import { createClient } from '@supabase/supabase-js';

interface DatabaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  // Other fields
}

export class DatabaseService {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  
  async createRecord(data: Omit<DatabaseRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseRecord> {
    const { data: result, error } = await this.supabase
      .from('table_name')
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    return result;
  }
}
```

### **2. Quality Standards**

#### **TypeScript Usage**
```typescript
// ✅ CORRECT: Strict TypeScript
interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin' | 'repair_shop';
}

function processUser(user: UserData): ProcessedUser {
  // Implementation
}

// ❌ INCORRECT: Using any
function processUser(user: any): any {
  // Implementation
}
```

#### **Error Handling**
```typescript
// ✅ CORRECT: Consistent error handling
async function fetchData(id: string): Promise<Data | null> {
  try {
    const response = await api.get(`/data/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return null;
  }
}

// ❌ INCORRECT: No error handling
async function fetchData(id: string): Promise<Data> {
  const response = await api.get(`/data/${id}`);
  return response.data;
}
```

#### **Validation Patterns**
```typescript
// ✅ CORRECT: Consistent validation
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older')
});

function validateUser(data: unknown): UserData {
  return UserSchema.parse(data);
}
```

### **3. Testing Patterns**

#### **Component Testing**
```typescript
// ✅ CORRECT: Consistent test pattern
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  const mockProps = {
    title: 'Test Title',
    onAction: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders with correct title', () => {
    render(<ComponentName {...mockProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('calls onAction when button is clicked', () => {
    render(<ComponentName {...mockProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockProps.onAction).toHaveBeenCalledTimes(1);
  });
});
```

#### **API Testing**
```typescript
// ✅ CORRECT: Consistent API test pattern
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './api-endpoint';

describe('API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('returns success response for valid data', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ valid: 'data' })
    });
    
    const response = await handler(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
  });
  
  it('returns error response for invalid data', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' })
    });
    
    const response = await handler(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });
});
```

---

## 🔍 **Change Impact Analysis**

### **1. Dependency Analysis**

#### **Component Dependencies**
```typescript
// Example: Analyze component dependencies
class ComponentDependencyAnalyzer {
  analyzeDependencies(componentPath: string): DependencyAnalysis {
    return {
      imports: this.findImports(componentPath),
      exports: this.findExports(componentPath),
      usedBy: this.findComponentsUsingThis(componentPath),
      uses: this.findComponentsThisUses(componentPath)
    };
  }
}
```

#### **API Dependencies**
```typescript
// Example: Analyze API dependencies
class APIDependencyAnalyzer {
  analyzeAPIDependencies(apiPath: string): APIDependencyAnalysis {
    return {
      endpoints: this.findEndpoints(apiPath),
      database: this.findDatabaseUsage(apiPath),
      external: this.findExternalAPIs(apiPath),
      clients: this.findAPIClients(apiPath)
    };
  }
}
```

### **2. Integration Safety**

#### **Integration Checklist**
- [ ] **Component Integration**: Does it integrate with existing components?
- [ ] **API Integration**: Does it work with existing APIs?
- [ ] **Database Integration**: Does it work with existing database schema?
- [ ] **State Integration**: Does it work with existing state management?
- [ ] **Routing Integration**: Does it work with existing routing?

#### **Breaking Change Detection**
```typescript
// Example: Breaking change detection
class BreakingChangeDetector {
  detectBreakingChanges(change: CodeChange): BreakingChange[] {
    return [
      ...this.detectAPIChanges(change),
      ...this.detectComponentChanges(change),
      ...this.detectDatabaseChanges(change),
      ...this.detectStateChanges(change)
    ];
  }
}
```

---

## 🧪 **Testing Requirements**

### **1. Test Coverage Requirements**

#### **Minimum Coverage**
- **Components**: 80% test coverage
- **API Endpoints**: 90% test coverage
- **Services**: 85% test coverage
- **Utilities**: 90% test coverage

#### **Test Types Required**
- **Unit Tests**: All components and functions
- **Integration Tests**: All API endpoints
- **E2E Tests**: All user workflows
- **Performance Tests**: All critical paths

### **2. Test Pattern Consistency**

#### **Test Structure**
```typescript
// ✅ CORRECT: Consistent test structure
describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Setup code
  });
  
  // Happy path tests
  describe('when data is valid', () => {
    it('should render correctly', () => {
      // Test implementation
    });
  });
  
  // Error cases
  describe('when data is invalid', () => {
    it('should handle errors gracefully', () => {
      // Test implementation
    });
  });
  
  // Edge cases
  describe('edge cases', () => {
    it('should handle edge cases', () => {
      // Test implementation
    });
  });
});
```

---

## 🚨 **Common Violations to Avoid**

### **1. Pattern Inconsistency**
- ❌ Using different component patterns for similar components
- ❌ Inconsistent API endpoint patterns
- ❌ Different error handling approaches
- ❌ Inconsistent validation patterns

### **2. Quality Inconsistency**
- ❌ Using `any` types in some files but strict typing in others
- ❌ Inconsistent error handling patterns
- ❌ Different validation approaches
- ❌ Inconsistent security implementations

### **3. Testing Inconsistency**
- ❌ Different testing patterns for similar components
- ❌ Inconsistent mock data patterns
- ❌ Different assertion patterns
- ❌ Inconsistent test organization

### **4. Integration Issues**
- ❌ Changes that break existing functionality
- ❌ Inconsistent API integration patterns
- ❌ Different database integration approaches
- ❌ Inconsistent external service integration

---

## 🔧 **Validation Commands**

### **Pre-Change Validation**
```bash
# Run code coherence validation
npm run validate:code-coherence

# Run specific dimension validation
npm run validate:patterns
npm run validate:quality
npm run validate:testing
npm run validate:integration

# Run full test suite
npm run test
npm run test:coverage

# Run build validation
npm run build
npm run type-check
```

### **Post-Change Validation**
```bash
# Validate changes don't break existing functionality
npm run test:integration
npm run test:e2e

# Validate performance impact
npm run test:performance

# Validate security impact
npm run test:security
```

---

## 📊 **Success Metrics**

### **Code Coherence Targets**
- **Pattern Consistency**: 90%+
- **Quality Consistency**: 90%+
- **Testing Consistency**: 80%+
- **Integration Safety**: 95%+

### **Quality Gates**
- **Pre-commit**: Code style and basic quality
- **Pre-merge**: Full test suite and quality checks
- **Pre-deploy**: Full system validation
- **Post-deploy**: Monitoring and validation

---

## 🎯 **AI Agent Decision Framework**

### **When to Proceed with Changes**
- ✅ **Patterns**: Change follows established patterns
- ✅ **Quality**: Change maintains quality standards
- ✅ **Testing**: Change includes appropriate tests
- ✅ **Integration**: Change integrates safely
- ✅ **Performance**: Change maintains performance

### **When to Stop and Reassess**
- ❌ **Patterns**: Change breaks established patterns
- ❌ **Quality**: Change reduces quality standards
- ❌ **Testing**: Change lacks appropriate tests
- ❌ **Integration**: Change breaks existing functionality
- ❌ **Performance**: Change degrades performance

### **When to Escalate**
- 🚨 **Breaking Changes**: Change breaks existing functionality
- 🚨 **Architecture Changes**: Change affects system architecture
- 🚨 **Security Issues**: Change introduces security vulnerabilities
- 🚨 **Performance Issues**: Change significantly impacts performance

---

## 📋 **Quick Reference Checklist**

### **Before Making Changes**
- [ ] **Analyze**: Found similar components and patterns
- [ ] **Assess**: Identified impact and dependencies
- [ ] **Plan**: Planned implementation approach
- [ ] **Validate**: Checked against coherence standards

### **During Implementation**
- [ ] **Patterns**: Following established patterns
- [ ] **Quality**: Maintaining quality standards
- [ ] **Testing**: Including appropriate tests
- [ ] **Integration**: Ensuring safe integration

### **After Implementation**
- [ ] **Validate**: Running coherence validation
- [ ] **Test**: Running all relevant tests
- [ ] **Check**: Verifying no breaking changes
- [ ] **Document**: Updating documentation if needed

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Maintainer**: STOLEN Development Team  
**Status**: Active Guidelines
