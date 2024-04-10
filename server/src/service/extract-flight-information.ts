import {Data, FlightResponseBody} from "../constants/external-api/response";
import {Arrival, Departure, FlightLeg, Itineraries, Segment} from "../constants/frontend/response/itinerary.ts";

export function extractFlightInformation(responseBody: FlightResponseBody): Itineraries {
    const itineraries: Itineraries = responseBody.data.map((data: Data) => {

        const flightLegs: Array<FlightLeg> = data.itineraries.map((itinerary) => {
            const segments: Array<Segment> = itinerary.segments.map((segment) => {

                return {
                    departure: _createDepartureObject(segment),
                    arrival: _createArrivalObject(segment),
                    carrierCode: segment.carrierCode,
                    duration: segment.duration
                }
            });

            return {
                duration: _formatDuration(itinerary.duration),
                from: itinerary.segments.at(0)!.departure.iataCode,
                to: itinerary.segments.at(-1)!.arrival.iataCode,
                // TODO: add a unit test for the correct number of stopovers
                numberOfStopovers: itinerary.segments.length - 1,
                segments
            }

        });
        // TODO: remove hardcoded price prefix when you add options for different currencies
        return {
            cost: `$${data.price.grandTotal}`,
            flightLegs
        }
    });

    return itineraries;
}

function _checkDaysHavePassed(firstDate: string, secondDate: string): number {
    const date1 = new Date(firstDate);
    const date2 = new Date(secondDate);
    return date2.getDate() - date1.getDate();
}

function _getTruncatedDate(date: string):string {
    return new Date(date).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
}

function _createDepartureObject(segment: Segment): Departure {
    const departureTime: string = _getTruncatedDate(segment.departure.at);
    return {
        ...segment.departure,
        at: departureTime
    }
}

function _createArrivalObject(segment: Segment): Arrival {
    const elapsedDays = _checkDaysHavePassed(segment.departure.at, segment.arrival.at);
    let arrivalTime: string = _getTruncatedDate(segment.arrival.at);
    if (elapsedDays) {
        arrivalTime += `+${elapsedDays}`;
    }

    return {
        ...segment.arrival,
        at: arrivalTime
    }
}

function _formatDuration(duration: string): string {
    return duration
        .slice(2)
        .toLowerCase()
        .replace('h', 'h ');
}