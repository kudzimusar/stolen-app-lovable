// @ts-nocheck
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DeviceReport {
  id: string;
  report_type: 'lost' | 'found';
  device_category: string;
  device_model?: string;
  serial_number?: string;
  description: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  incident_date: string;
  reward_amount?: number;
  photos?: string[];
}

export interface MatchCriteria {
  location_match: boolean;
  device_category_match: boolean;
  device_model_match: boolean;
  time_proximity: boolean;
  description_similarity: number;
}

export interface DeviceMatch {
  lost_report_id: string;
  found_report_id: string;
  match_confidence: number;
  match_criteria: MatchCriteria;
  status: 'pending' | 'contacted' | 'verified' | 'recovered' | 'rejected';
}

export class AIMatchingService {
  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate text similarity using Jaccard similarity
  calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // Calculate time proximity score
  calculateTimeProximity(date1: string, date2: string): number {
    const time1 = new Date(date1).getTime();
    const time2 = new Date(date2).getTime();
    const diffHours = Math.abs(time1 - time2) / (1000 * 60 * 60);
    
    // Score decreases as time difference increases
    if (diffHours <= 1) return 1.0;
    if (diffHours <= 24) return 0.8;
    if (diffHours <= 168) return 0.6; // 1 week
    if (diffHours <= 720) return 0.4; // 1 month
    return 0.2;
  }

  // Calculate match confidence between two reports
  calculateMatchConfidence(lostReport: DeviceReport, foundReport: DeviceReport): {
    confidence: number;
    criteria: MatchCriteria;
  } {
    const criteria: MatchCriteria = {
      location_match: false,
      device_category_match: false,
      device_model_match: false,
      time_proximity: false,
      description_similarity: 0
    };

    let confidence = 0;

    // Location match (40% weight)
    const distance = this.calculateDistance(
      lostReport.location_lat,
      lostReport.location_lng,
      foundReport.location_lat,
      foundReport.location_lng
    );
    
    if (distance <= 5) { // Within 5km
      criteria.location_match = true;
      confidence += 0.4;
    } else if (distance <= 20) { // Within 20km
      confidence += 0.2;
    }

    // Device category match (30% weight)
    if (lostReport.device_category === foundReport.device_category) {
      criteria.device_category_match = true;
      confidence += 0.3;
    }

    // Device model match (20% weight)
    if (lostReport.device_model && foundReport.device_model) {
      const modelSimilarity = this.calculateTextSimilarity(
        lostReport.device_model,
        foundReport.device_model
      );
      if (modelSimilarity > 0.8) {
        criteria.device_model_match = true;
        confidence += 0.2;
      } else if (modelSimilarity > 0.5) {
        confidence += 0.1;
      }
    }

    // Time proximity (10% weight)
    const timeScore = this.calculateTimeProximity(
      lostReport.incident_date,
      foundReport.incident_date
    );
    if (timeScore > 0.6) {
      criteria.time_proximity = true;
    }
    confidence += timeScore * 0.1;

    // Description similarity (bonus)
    const descriptionSimilarity = this.calculateTextSimilarity(
      lostReport.description,
      foundReport.description
    );
    criteria.description_similarity = descriptionSimilarity;
    if (descriptionSimilarity > 0.3) {
      confidence += descriptionSimilarity * 0.1;
    }

    return { confidence: Math.min(confidence, 1), criteria };
  }

  // Find potential matches for a report
  async findPotentialMatches(report: DeviceReport, radiusKm: number = 50): Promise<DeviceMatch[]> {
    try {
      // Get nearby reports of opposite type
      const oppositeType = report.report_type === 'lost' ? 'found' : 'lost';
      
      const { data: nearbyReports, error } = await supabase
        .from('lost_found_reports')
        .select('*')
        .eq('report_type', oppositeType)
        .neq('id', report.id);

      if (error) {
        console.error('Error fetching nearby reports:', error);
        return [];
      }

      const matches: DeviceMatch[] = [];

      for (const nearbyReport of nearbyReports) {
        // Check if within radius
        const distance = this.calculateDistance(
          report.location_lat,
          report.location_lng,
          nearbyReport.location_lat,
          nearbyReport.location_lng
        );

        if (distance <= radiusKm) {
          const { confidence, criteria } = this.calculateMatchConfidence(
            report.report_type === 'lost' ? report : nearbyReport,
            report.report_type === 'found' ? report : nearbyReport
          );

          // Only include matches with confidence > 0.3
          if (confidence > 0.3) {
            matches.push({
              lost_report_id: report.report_type === 'lost' ? report.id : nearbyReport.id,
              found_report_id: report.report_type === 'found' ? report.id : nearbyReport.id,
              match_confidence: confidence,
              match_criteria: criteria,
              status: 'pending'
            });
          }
        }
      }

      // Sort by confidence (highest first)
      return matches.sort((a, b) => b.match_confidence - a.match_confidence);
    } catch (error) {
      console.error('Error finding potential matches:', error);
      return [];
    }
  }

  // Auto-create high-confidence matches
  async autoCreateMatches(report: DeviceReport, minConfidence: number = 0.8): Promise<void> {
    try {
      const matches = await this.findPotentialMatches(report);
      const highConfidenceMatches = matches.filter(match => match.match_confidence >= minConfidence);

      for (const match of highConfidenceMatches) {
        // Check if match already exists
        const { data: existingMatch } = await supabase
          .from('device_matches')
          .select('id')
          .eq('lost_report_id', match.lost_report_id)
          .eq('found_report_id', match.found_report_id)
          .single();

        if (!existingMatch) {
          // Create the match
          const { error } = await supabase
            .from('device_matches')
            .insert(match);

          if (error) {
            console.error('Error creating auto-match:', error);
          } else {
            console.log(`Auto-created match with confidence: ${match.match_confidence}`);
          }
        }
      }
    } catch (error) {
      console.error('Error auto-creating matches:', error);
    }
  }

  // Get match suggestions for a report
  async getMatchSuggestions(reportId: string): Promise<DeviceMatch[]> {
    try {
      const { data: report, error: reportError } = await supabase
        .from('lost_found_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError || !report) {
        console.error('Error fetching report:', reportError);
        return [];
      }

      return await this.findPotentialMatches(report);
    } catch (error) {
      console.error('Error getting match suggestions:', error);
      return [];
    }
  }

  // Update match status
  async updateMatchStatus(matchId: string, status: DeviceMatch['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('device_matches')
        .update({ status })
        .eq('id', matchId);

      if (error) {
        console.error('Error updating match status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating match status:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const aiMatchingService = new AIMatchingService();

// React hook for AI matching
export function useAIMatching() {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<DeviceMatch[]>([]);

  const findMatches = async (report: DeviceReport) => {
    setIsLoading(true);
    try {
      const foundMatches = await aiMatchingService.findPotentialMatches(report);
      setMatches(foundMatches);
      return foundMatches;
    } catch (error) {
      console.error('Error finding matches:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async (reportId: string) => {
    setIsLoading(true);
    try {
      const suggestions = await aiMatchingService.getMatchSuggestions(reportId);
      setMatches(suggestions);
      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (matchId: string, status: DeviceMatch['status']) => {
    try {
      const success = await aiMatchingService.updateMatchStatus(matchId, status);
      if (success) {
        setMatches(prev => prev.map(match => 
          match.lost_report_id === matchId || match.found_report_id === matchId
            ? { ...match, status }
            : match
        ));
      }
      return success;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  };

  return {
    isLoading,
    matches,
    findMatches,
    getSuggestions,
    updateStatus
  };
}
