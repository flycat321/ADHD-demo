import React from 'react';
import { Event } from '@shared/schema';
import { formatDate } from '@/lib/utils';
import { Clock, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const eventDate = new Date(event.eventDate);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString('default', { month: 'short' });
  const year = eventDate.getFullYear();

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="rounded-xl overflow-hidden shadow-md group"
    >
      {/* Top section with gradient background */}
      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
        {/* Event date callout */}
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 rounded-xl py-2 px-3 shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">{day}</span>
            <span className="text-xs uppercase tracking-wide">{month}</span>
            <span className="text-xs text-gray-500">{year}</span>
          </div>
        </div>
        
        {/* Event details */}
        <h3 className="text-xl font-bold mb-2 pr-12">{event.title}</h3>
        <p className="text-sm text-white/90 mb-4 pr-10">{event.description}</p>
        
        {/* Event meta info */}
        <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>{formatDate(event.eventDate)}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1.5" />
            <span>10+ attending</span>
          </div>
        </div>
      </div>
      
      {/* Bottom section with actions */}
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.isVirtual ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
            {event.isVirtual ? 'Virtual' : 'In Person'}
          </span>
          <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
            ADHD Events
          </span>
        </div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="default" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-full px-4">
            <span className="mr-2">RSVP</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventCard;
