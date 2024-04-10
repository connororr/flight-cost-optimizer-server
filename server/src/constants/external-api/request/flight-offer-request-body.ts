export interface FlightOfferRequestBody {
  
  originDestinations: OriginDestination[];
  travelers: Traveler[];
  sources: string[];
  searchCriteria?: {
    maxFlightOffers: number;
  };
}

export interface OriginDestination {
  id: string;
  originLocationCode: string;
  destinationLocationCode: string;
  departureDateTimeRange: {
    date: string;
    time: string;
  };
}

export interface Traveler {
  id: string;
  travelerType: string;
}