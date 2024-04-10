export type Itineraries = Array<Itinerary>

export interface Itinerary {
    cost: string;
    flightLegs: Array<FlightLeg>;
}

export interface FlightLeg {
    duration: string;
    from: string;
    to: string;
    numberOfStopovers: number;
    segments: Array<Segment>;
}

export interface Segment {
    duration: string;
    departure: Departure;
    arrival: Arrival;
    carrierCode: string;
}

export interface Departure {
    at: string;
    iataCode: string;
    terminal?: string;
}

export interface Arrival {
    at: string;
    iataCode: string;
    terminal?: string;
}