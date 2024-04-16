import { Data, FlightResponseBody } from "../constants/external-api/response";
import { Arrival, Departure, FlightLeg, Itineraries, Segment } from "../constants/frontend/response";

export function extractFlightInformation(responseBody: FlightResponseBody): Itineraries {
    if (!responseBody.data || responseBody?.data.length === 0) {
        return [];
    }

    return responseBody.data.map((data: Data) => {
        let totalDurationInMins: number = 0;

        const flightLegs: Array<FlightLeg> = data.itineraries.map((itinerary) => {
            totalDurationInMins += _toMinutes(itinerary.duration);

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
            totalDurationInMins,
            cost: `$${data.price.grandTotal}`,
            flightLegs
        }
    });
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

function _toMinutes(duration: string): number {
    let formattedDurationArray = duration.slice(2).split('H');
    const hours: number = Number(formattedDurationArray[0]);
    const minutes: number = Number(formattedDurationArray[1].split('M')[0]);
    return (hours * 60) + minutes;
}