import { Flight } from "../constants/frontend/request/flight.ts";

export function checkRoundTrip(flights: Array<Flight>) {
    if (flights.length <= 2) {
        return false;
    }
    for (let i = 1; i < flights.length; i++) {
        if (flights[i].from !== flights[i - 1].to) {
            return false;
        }
    }
    return true;
}