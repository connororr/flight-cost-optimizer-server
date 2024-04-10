import { Endpoints } from "../constants/endpoints";
import { FlightOfferRequestBody, OriginDestination, Traveler } from "../constants/external-api/request";
import { FlightResponseBody } from "../constants/external-api/response";
import { Flight } from "../constants/frontend/request/flight";
import {Itineraries } from "../constants/frontend/response/itinerary";
import { AmadeusService, IAmadeusService } from "./amadeus-service";
import { extractFlightInformation } from "./extract-flight-information.ts";

export interface IFlightService {
    getFlightPrices(options: Array<Flight>): Promise<Itineraries>;
}

export class FlightService implements IFlightService {
    private amadeusService: IAmadeusService;

    constructor() {
        const accessTokenTimestamp = Date.now();
        this.amadeusService = new AmadeusService(accessTokenTimestamp);
    }

    // TODO: notice there's a hardcoded value that you need to write a unit test for
    public async getFlightPrices(options: Array<Flight>): Promise<Itineraries> {
        const originDestinations: Array<OriginDestination> = options.map((flight) => ({
            id: String(flight.id),
            originLocationCode: flight.from,
            destinationLocationCode: flight.to,
            departureDateTimeRange: {
                date: flight.date,
                time: '10:00:00'
            }
        }));

        // TODO: remove hardcoded value and replace with input from a button
        const travelers: Array<Traveler> = [{ id: '1', travelerType: 'ADULT' }];
        const sources: string[] = [ 'GDS' ];

        const body: FlightOfferRequestBody = {
            originDestinations,
            travelers,
            sources,
            // TODO: remove the 15 maxFlightOffers once I go live. Instead have a button to show 10 more offers
            searchCriteria: {
                maxFlightOffers: 15
            }
        }

        const response: any = await this.amadeusService.request(Endpoints.FlightPrice, body, 'POST');
        const responseJson = await response.json() as FlightResponseBody;
        return extractFlightInformation(responseJson);
    }


}