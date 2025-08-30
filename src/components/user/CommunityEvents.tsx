import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Search,
  Megaphone,
  GraduationCap
} from "lucide-react";

interface CommunityEvent {
  id: string;
  event_type: "recovery_drive" | "awareness_campaign" | "training_session";
  title: string;
  description: string;
  location_address: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  status: "upcoming" | "active" | "completed" | "cancelled";
  organizer: {
    display_name: string;
    avatar_url?: string;
  };
}

interface CommunityEventsProps {
  onJoinEvent?: (eventId: string) => void;
  onCreateEvent?: () => void;
}

const CommunityEvents = ({ onJoinEvent, onCreateEvent }: CommunityEventsProps) => {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "active">("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/lost-found/community/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock data
      setEvents([
        {
          id: "1",
          event_type: "recovery_drive",
          title: "Downtown Device Recovery Drive",
          description: "Join us for a community-wide effort to help recover lost devices in the downtown area.",
          location_address: "Union Square, San Francisco",
          start_date: "2024-02-15T10:00:00Z",
          end_date: "2024-02-15T16:00:00Z",
          max_participants: 50,
          current_participants: 23,
          status: "upcoming",
          organizer: {
            display_name: "SF Community Group",
            avatar_url: "/placeholder.svg"
          }
        },
        {
          id: "2",
          event_type: "awareness_campaign",
          title: "Device Security Workshop",
          description: "Learn about device security, registration, and how to protect your devices from theft.",
          location_address: "Public Library, Mission District",
          start_date: "2024-02-20T14:00:00Z",
          end_date: "2024-02-20T16:00:00Z",
          max_participants: 30,
          current_participants: 18,
          status: "upcoming",
          organizer: {
            display_name: "Tech Safety Initiative",
            avatar_url: "/placeholder.svg"
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/v1/lost-found/community/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to join event');
      }

      toast({
        title: "Event Joined",
        description: "You have successfully joined the event!",
      });

      // Refresh events to update participant count
      fetchEvents();
      onJoinEvent?.(eventId);
    } catch (error) {
      console.error('Error joining event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "recovery_drive":
        return <Search className="w-4 h-4" />;
      case "awareness_campaign":
        return <Megaphone className="w-4 h-4" />;
      case "training_session":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "recovery_drive":
        return "Recovery Drive";
      case "awareness_campaign":
        return "Awareness Campaign";
      case "training_session":
        return "Training Session";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="outline" className="text-blue-600">Upcoming</Badge>;
      case "active":
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    return event.status === filter;
  });

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Community Events</h3>
          <p className="text-sm text-muted-foreground">
            Join local events to help recover devices and build community awareness
          </p>
        </div>
        <Button onClick={onCreateEvent} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Events
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold mb-2">No events found</h4>
            <p className="text-muted-foreground mb-4">
              {filter === "all" 
                ? "There are no community events scheduled at the moment."
                : `No ${filter} events found.`
              }
            </p>
            <Button onClick={onCreateEvent}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Event
            </Button>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getEventTypeIcon(event.event_type)}
                  <Badge variant="outline">
                    {getEventTypeLabel(event.event_type)}
                  </Badge>
                  {getStatusBadge(event.status)}
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.current_participants}/{event.max_participants}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.location_address}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(event.start_date)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Organized by:</span>
                  <span className="font-medium">{event.organizer.display_name}</span>
                </div>

                <div className="flex gap-2">
                  {event.status === "upcoming" && event.current_participants < event.max_participants && (
                    <Button 
                      size="sm" 
                      onClick={() => handleJoinEvent(event.id)}
                    >
                      Join Event
                    </Button>
                  )}
                  {event.status === "upcoming" && event.current_participants >= event.max_participants && (
                    <Button size="sm" variant="outline" disabled>
                      Event Full
                    </Button>
                  )}
                  {event.status === "active" && (
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityEvents;
