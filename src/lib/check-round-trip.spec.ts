import { Flight } from "../constants/frontend/request/flight.ts";
import { checkRoundTrip } from "./check-round-trip.ts";

describe('checkRoundtrip()', () => {
    let firstFlight: Flight;
    let secondFlight: Flight;
    let thirdFlight: Flight;
    let fourthFlight: Flight;
    let differentCityFlight: Flight;
    let roundTripFlightOne: Flight;
    let roundTripFlightTwo: Flight;
    let flights: Array<Flight>;
    let brokenUpFlights: Array<Flight>;
    let roundTripFlights: Array<Flight>;

    beforeEach(() => {
        roundTripFlightOne = createFlight(1, "CDG", "LON", "2024-04-25");
        roundTripFlightTwo = createFlight(2, "LON", "CDG", "2024-04-26");
        firstFlight = createFlight(1, "CDG", "LON", "2024-04-25");
        secondFlight = createFlight(2, "LON", "MAD", "2024-04-26");
        thirdFlight = createFlight(3, "MAD", "BRU", "2024-04-27");
        differentCityFlight = createFlight(3, "MAD", "NYC", "2024-04-27");
        fourthFlight = createFlight(4, "BRU", "CDG", "2024-04-28");
        brokenUpFlights = [firstFlight, secondFlight, differentCityFlight, fourthFlight];
        flights = [firstFlight, secondFlight, thirdFlight, fourthFlight];
        roundTripFlights = [roundTripFlightOne, roundTripFlightTwo];
    })

    it('should return false if multi-city trip is broken up at certain point', () => {
        const result = checkRoundTrip(brokenUpFlights);
        expect(result).toBe(false);
    });
    it('should return true if flying in and out from the same city for each leg of the trip', () => {
        const result = checkRoundTrip(flights);
        expect(result).toBe(true);
    })
    it('should return false if flying a non-multi city round trip', () => {
        const result = checkRoundTrip(roundTripFlights);
        expect(result).toBe(false);
    })
})

function createFlight(id: number, from: string, to: string, date: string): Flight {
    return {
        id,
        from,
        to,
        date
    };
}