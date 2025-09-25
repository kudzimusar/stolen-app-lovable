/**
 * STOLEN Platform - Advanced Dependency Mapper
 * 
 * This module provides advanced dependency mapping for API calls, database queries,
 * and component relationships across the 8-stakeholder ecosystem.
 */

import fs from 'fs';
import path from 'path';
import { STAKEHOLDER_TYPES, CORE_SYSTEMS } from './coherence-ai-engine';

// Dependency types
export interface APIDependency {
  type: 'supabase' | 'external' | 'internal';
  endpoint: string;
  method: string;
  stakeholders: string[];
  systems: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface DatabaseDependency {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  stakeholders: string[];
  systems: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface ComponentDependency {
  component: string;
  type: 'import' | 'export' | 'usage';
  stakeholders: string[];
  systems: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface StakeholderIntegration {
  fromStakeholder: string;
  toStakeholder: string;
  integrationType: 'data' | 'api' | 'ui' | 'workflow';
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface DependencyMap {
  filePath: string;
  apiDependencies: APIDependency[];
  databaseDependencies: DatabaseDependency[];
  componentDependencies: ComponentDependency[];
  stakeholderIntegrations: StakeholderIntegration[];
  totalImpact: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

// Advanced Dependency Mapper Class
export class AdvancedDependencyMapper {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async mapFileDependencies(filePath: string): Promise<DependencyMap> {
    const fullPath = path.resolve(this.projectRoot, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    
    const apiDependencies = await this.mapAPICalls(content, filePath);
    const databaseDependencies = await this.mapDatabaseQueries(content, filePath);
    const componentDependencies = await this.mapComponentRelationships(content, filePath);
    const stakeholderIntegrations = await this.mapStakeholderIntegrations(content, filePath);
    
    const totalImpact = this.calculateTotalImpact([
      ...apiDependencies,
      ...databaseDependencies,
      ...componentDependencies,
      ...stakeholderIntegrations
    ]);

    return {
      filePath,
      apiDependencies,
      databaseDependencies,
      componentDependencies,
      stakeholderIntegrations,
      totalImpact,
      timestamp: new Date()
    };
  }

  private async mapAPICalls(content: string, filePath: string): Promise<APIDependency[]> {
    const dependencies: APIDependency[] = [];
    
    // Map Supabase function calls
    const supabaseCalls = this.extractSupabaseCalls(content);
    for (const call of supabaseCalls) {
      dependencies.push({
        type: 'supabase',
        endpoint: call.endpoint,
        method: call.method,
        stakeholders: this.identifyStakeholders(filePath, call.endpoint),
        systems: this.identifySystems(filePath, call.endpoint),
        impact: this.calculateAPIImpact(call.endpoint, call.method),
        description: `Supabase ${call.method} call to ${call.endpoint}`
      });
    }

    // Map external API calls
    const externalCalls = this.extractExternalAPICalls(content);
    for (const call of externalCalls) {
      dependencies.push({
        type: 'external',
        endpoint: call.endpoint,
        method: call.method,
        stakeholders: this.identifyStakeholders(filePath, call.endpoint),
        systems: this.identifySystems(filePath, call.endpoint),
        impact: this.calculateAPIImpact(call.endpoint, call.method),
        description: `External API ${call.method} call to ${call.endpoint}`
      });
    }

    // Map internal API calls
    const internalCalls = this.extractInternalAPICalls(content);
    for (const call of internalCalls) {
      dependencies.push({
        type: 'internal',
        endpoint: call.endpoint,
        method: call.method,
        stakeholders: this.identifyStakeholders(filePath, call.endpoint),
        systems: this.identifySystems(filePath, call.endpoint),
        impact: this.calculateAPIImpact(call.endpoint, call.method),
        description: `Internal API ${call.method} call to ${call.endpoint}`
      });
    }

    return dependencies;
  }

  private async mapDatabaseQueries(content: string, filePath: string): Promise<DatabaseDependency[]> {
    const dependencies: DatabaseDependency[] = [];
    
    // Map Supabase database operations
    const dbOperations = this.extractDatabaseOperations(content);
    for (const operation of dbOperations) {
      dependencies.push({
        table: operation.table,
        operation: operation.operation,
        stakeholders: this.identifyStakeholders(filePath, operation.table),
        systems: this.identifySystems(filePath, operation.table),
        impact: this.calculateDatabaseImpact(operation.table, operation.operation),
        description: `${operation.operation} operation on ${operation.table} table`
      });
    }

    return dependencies;
  }

  private async mapComponentRelationships(content: string, filePath: string): Promise<ComponentDependency[]> {
    const dependencies: ComponentDependency[] = [];
    
    // Map component imports
    const imports = this.extractComponentImports(content);
    for (const importItem of imports) {
      dependencies.push({
        component: importItem.component,
        type: 'import',
        stakeholders: this.identifyStakeholders(filePath, importItem.component),
        systems: this.identifySystems(filePath, importItem.component),
        impact: this.calculateComponentImpact(importItem.component, 'import'),
        description: `Imports ${importItem.component} component`
      });
    }

    // Map component exports
    const exports = this.extractComponentExports(content);
    for (const exportItem of exports) {
      dependencies.push({
        component: exportItem.component,
        type: 'export',
        stakeholders: this.identifyStakeholders(filePath, exportItem.component),
        systems: this.identifySystems(filePath, exportItem.component),
        impact: this.calculateComponentImpact(exportItem.component, 'export'),
        description: `Exports ${exportItem.component} component`
      });
    }

    // Map component usage
    const usage = this.extractComponentUsage(content);
    for (const usageItem of usage) {
      dependencies.push({
        component: usageItem.component,
        type: 'usage',
        stakeholders: this.identifyStakeholders(filePath, usageItem.component),
        systems: this.identifySystems(filePath, usageItem.component),
        impact: this.calculateComponentImpact(usageItem.component, 'usage'),
        description: `Uses ${usageItem.component} component`
      });
    }

    return dependencies;
  }

  private async mapStakeholderIntegrations(content: string, filePath: string): Promise<StakeholderIntegration[]> {
    const integrations: StakeholderIntegration[] = [];
    
    // Identify stakeholder from file path
    const currentStakeholder = this.identifyStakeholderFromPath(filePath);
    
    // Map cross-stakeholder data flows
    const dataFlows = this.extractDataFlows(content);
    for (const flow of dataFlows) {
      const targetStakeholder = this.identifyStakeholderFromPath(flow.target);
      if (targetStakeholder && targetStakeholder !== currentStakeholder) {
        integrations.push({
          fromStakeholder: currentStakeholder,
          toStakeholder: targetStakeholder,
          integrationType: 'data',
          impact: this.calculateIntegrationImpact(currentStakeholder, targetStakeholder, 'data'),
          description: `Data flow from ${currentStakeholder} to ${targetStakeholder}`
        });
      }
    }

    // Map cross-stakeholder API calls
    const apiFlows = this.extractAPIFlows(content);
    for (const flow of apiFlows) {
      const targetStakeholder = this.identifyStakeholderFromPath(flow.target);
      if (targetStakeholder && targetStakeholder !== currentStakeholder) {
        integrations.push({
          fromStakeholder: currentStakeholder,
          toStakeholder: targetStakeholder,
          integrationType: 'api',
          impact: this.calculateIntegrationImpact(currentStakeholder, targetStakeholder, 'api'),
          description: `API integration from ${currentStakeholder} to ${targetStakeholder}`
        });
      }
    }

    return integrations;
  }

  // Helper methods for extracting patterns
  private extractSupabaseCalls(content: string): Array<{endpoint: string, method: string}> {
    const calls: Array<{endpoint: string, method: string}> = [];
    
    // Match supabase.functions.invoke calls
    const invokeRegex = /supabase\.functions\.invoke\(['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = invokeRegex.exec(content)) !== null) {
      calls.push({
        endpoint: match[1],
        method: 'POST'
      });
    }

    // Match supabase.from calls
    const fromRegex = /supabase\.from\(['"`]([^'"`]+)['"`]/g;
    while ((match = fromRegex.exec(content)) !== null) {
      calls.push({
        endpoint: match[1],
        method: 'GET'
      });
    }

    return calls;
  }

  private extractExternalAPICalls(content: string): Array<{endpoint: string, method: string}> {
    const calls: Array<{endpoint: string, method: string}> = [];
    
    // Match fetch calls to external URLs
    const fetchRegex = /fetch\(['"`](https?:\/\/[^'"`]+)['"`]/g;
    let match;
    while ((match = fetchRegex.exec(content)) !== null) {
      const url = match[1];
      if (!url.includes('supabase') && !url.includes('localhost')) {
        calls.push({
          endpoint: url,
          method: 'GET' // Default, could be enhanced to detect method
        });
      }
    }

    return calls;
  }

  private extractInternalAPICalls(content: string): Array<{endpoint: string, method: string}> {
    const calls: Array<{endpoint: string, method: string}> = [];
    
    // Match fetch calls to internal endpoints
    const fetchRegex = /fetch\(['"`]([^'"`]*\/api\/[^'"`]+)['"`]/g;
    let match;
    while ((match = fetchRegex.exec(content)) !== null) {
      calls.push({
        endpoint: match[1],
        method: 'GET' // Default, could be enhanced to detect method
      });
    }

    return calls;
  }

  private extractDatabaseOperations(content: string): Array<{table: string, operation: string}> {
    const operations: Array<{table: string, operation: string}> = [];
    
    // Match database operations
    const dbRegex = /\.(select|insert|update|delete|upsert)\(/g;
    let match;
    while ((match = dbRegex.exec(content)) !== null) {
      // Try to find the table name before this operation
      const beforeMatch = content.substring(0, match.index);
      const tableMatch = beforeMatch.match(/\.from\(['"`]([^'"`]+)['"`]\)/);
      
      if (tableMatch) {
        operations.push({
          table: tableMatch[1],
          operation: match[1] as any
        });
      }
    }

    return operations;
  }

  private extractComponentImports(content: string): Array<{component: string}> {
    const imports: Array<{component: string}> = [];
    
    // Match component imports
    const importRegex = /import.*from\s+['"`]([^'"`]*\/components\/[^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        component: match[1]
      });
    }

    return imports;
  }

  private extractComponentExports(content: string): Array<{component: string}> {
    const exports: Array<{component: string}> = [];
    
    // Match component exports
    const exportRegex = /export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push({
        component: match[1]
      });
    }

    return exports;
  }

  private extractComponentUsage(content: string): Array<{component: string}> {
    const usage: Array<{component: string}> = [];
    
    // Match JSX component usage
    const jsxRegex = /<(\w+[A-Z]\w*)/g;
    let match;
    while ((match = jsxRegex.exec(content)) !== null) {
      usage.push({
        component: match[1]
      });
    }

    return usage;
  }

  private extractDataFlows(content: string): Array<{target: string}> {
    const flows: Array<{target: string}> = [];
    
    // Match data flow patterns (simplified)
    const flowRegex = /(?:navigate|router\.push|Link.*to)\(['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = flowRegex.exec(content)) !== null) {
      flows.push({
        target: match[1]
      });
    }

    return flows;
  }

  private extractAPIFlows(content: string): Array<{target: string}> {
    const flows: Array<{target: string}> = [];
    
    // Match API flow patterns
    const apiRegex = /fetch\(['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = apiRegex.exec(content)) !== null) {
      flows.push({
        target: match[1]
      });
    }

    return flows;
  }

  // Helper methods for impact calculation
  private identifyStakeholders(filePath: string, target: string): string[] {
    const stakeholders: string[] = [];
    
    for (const [key, stakeholder] of Object.entries(STAKEHOLDER_TYPES)) {
      if (stakeholder.paths.some(path => filePath.includes(path)) ||
          stakeholder.paths.some(path => target.includes(path))) {
        stakeholders.push(stakeholder.name);
      }
    }

    return stakeholders;
  }

  private identifySystems(filePath: string, target: string): string[] {
    const systems: string[] = [];
    
    for (const [key, system] of Object.entries(CORE_SYSTEMS)) {
      if (system.paths.some(path => filePath.includes(path)) ||
          system.paths.some(path => target.includes(path))) {
        systems.push(system.name);
      }
    }

    return systems;
  }

  private identifyStakeholderFromPath(filePath: string): string | null {
    for (const [key, stakeholder] of Object.entries(STAKEHOLDER_TYPES)) {
      if (stakeholder.paths.some(path => filePath.includes(path))) {
        return stakeholder.name;
      }
    }
    return null;
  }

  private calculateAPIImpact(endpoint: string, method: string): 'low' | 'medium' | 'high' | 'critical' {
    // Critical endpoints
    if (endpoint.includes('auth') || endpoint.includes('payment') || endpoint.includes('admin')) {
      return 'critical';
    }
    
    // High impact endpoints
    if (endpoint.includes('marketplace') || endpoint.includes('insurance') || endpoint.includes('law')) {
      return 'high';
    }
    
    // Medium impact endpoints
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      return 'medium';
    }
    
    return 'low';
  }

  private calculateDatabaseImpact(table: string, operation: string): 'low' | 'medium' | 'high' | 'critical' {
    // Critical tables
    if (table.includes('users') || table.includes('payments') || table.includes('devices')) {
      return 'critical';
    }
    
    // High impact operations
    if (operation === 'delete' || operation === 'update') {
      return 'high';
    }
    
    return 'medium';
  }

  private calculateComponentImpact(component: string, type: string): 'low' | 'medium' | 'high' | 'critical' {
    // Critical components
    if (component.includes('Dashboard') || component.includes('Admin') || component.includes('Payment')) {
      return 'critical';
    }
    
    // High impact components
    if (component.includes('Form') || component.includes('Modal') || component.includes('Navigation')) {
      return 'high';
    }
    
    return 'medium';
  }

  private calculateIntegrationImpact(from: string, to: string, type: string): 'low' | 'medium' | 'high' | 'critical' {
    // Critical integrations
    if ((from === 'Platform Administrators' || to === 'Platform Administrators') ||
        (from === 'Banks/Payment Gateways' || to === 'Banks/Payment Gateways')) {
      return 'critical';
    }
    
    // High impact integrations
    if (type === 'api' || type === 'workflow') {
      return 'high';
    }
    
    return 'medium';
  }

  private calculateTotalImpact(dependencies: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const impactCounts = { low: 0, medium: 0, high: 0, critical: 0 };
    
    for (const dep of dependencies) {
      impactCounts[dep.impact]++;
    }
    
    if (impactCounts.critical > 0) return 'critical';
    if (impactCounts.high > 0) return 'high';
    if (impactCounts.medium > 0) return 'medium';
    return 'low';
  }
}



