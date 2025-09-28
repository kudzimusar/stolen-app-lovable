import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Search,
  Filter,
  Star,
  UserPlus,
  UserMinus
} from "lucide-react";

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location_address: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  status: string;
  users: {
    display_name: string;
    avatar_url: string;
  };
  event_participants: Array<{
    user_id: string;
    role: string;
    users: {
      display_name: string;
      avatar_url: string;
    };
  }>;
}

export const CommunityEvents = () => {
  const { getAuthToken, user } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch('/api/v1/community-events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Please log in to join events");
        return;
      }

      const response = await fetch(`/api/v1/community-events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Successfully joined the event!");
        fetchEvents(); // Refresh events
      } else {
        toast.error(result.error || "Failed to join event");
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error("Failed to join event");
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`/api/v1/community-events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Left the event successfully");
        fetchEvents(); // Refresh events
      } else {
        toast.error(result.error || "Failed to leave event");
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      toast.error("Failed to leave event");
    }
  };

  const isUserParticipating = (event: CommunityEvent) => {
    return event.event_participants.some(participant => participant.user_id === user?.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'recovery_drive': return 'bg-blue-100 text-blue-800';
      case 'awareness_campaign': return 'bg-green-100 text-green-800';
      case 'training_session': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesType = typeFilter === "all" || event.event_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="font-semibold mb-2">Loading community events...</h3>
        <p className="text-muted-foreground">
          Fetching the latest community events and campaigns
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Events</h1>
          <p className="text-muted-foreground">
            Join recovery drives, awareness campaigns, and training sessions
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="recovery_drive">Recovery Drive</SelectItem>
                <SelectItem value="awareness_campaign">Awareness Campaign</SelectItem>
                <SelectItem value="training_session">Training Session</SelectItem>
              </SelectContent>
            </Select>
      </div>
        </CardContent>
          </Card>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {event.event_type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                  </Badge>
                  </div>
                </div>
                {event.status === 'upcoming' && (
                  <Star className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {event.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(event.start_date)}</span>
              </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{event.location_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {event.current_participants} / {event.max_participants || '∞'} participants
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <img
                    src={event.users.avatar_url || '/placeholder.svg'}
                    alt={event.users.display_name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    by {event.users.display_name}
                  </span>
                </div>

                {event.status === 'upcoming' && (
                    <Button 
                      size="sm" 
                    variant={isUserParticipating(event) ? "outline" : "default"}
                    onClick={() => 
                      isUserParticipating(event) 
                        ? handleLeaveEvent(event.id)
                        : handleJoinEvent(event.id)
                    }
                  >
                    {isUserParticipating(event) ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-1" />
                        Leave
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Join
                      </>
                    )}
                    </Button>
                  )}
              </div>
            </CardContent>
            </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters, or be the first to create an event
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Card>
      )}
    </div>
  );
};