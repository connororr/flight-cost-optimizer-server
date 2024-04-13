import { Endpoints } from "../constants/endpoints";
import { FlightOfferRequestBody, OriginDestination, Traveler } from "../constants/external-api/request";
import { FlightResponseBody } from "../constants/external-api/response";
import { Flight } from "../constants/frontend/request/flight";
import { AmadeusService, IAmadeusService } from "./amadeus-service";
import { extractFlightInformation } from "./extract-flight-information.ts";
import { City, Itineraries } from "../constants/frontend/response";

export interface IFlightService {
    getFlightPrices(options: Array<Flight>): Promise<Itineraries>;
    getIataCodes(searchTerm: string): Promise<Array<City>>
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

        const response: any = await this.amadeusService.post(Endpoints.FlightPrice, body);
        const responseJson = await response.json() as FlightResponseBody;
        return extractFlightInformation(responseJson);
    }

    public async getIataCodes(searchTerm: string): Promise<Array<City>> {
        const searchParams = new URLSearchParams();
        searchParams.append('subType', 'AIRPORT');
        searchParams.append('keyword', searchTerm);
        searchParams.append('page[limit]', '5');
        searchParams.append('page[offset]', '0');
        searchParams.append('sort', 'analytics.travelers.score');
        searchParams.append('view', 'LIGHT');

        const response: any = await this.amadeusService.get(Endpoints.Locations, searchParams);
        const responseJson = await response.json() as IataCodeResponseBody;
        return this.extractCityInformation(responseJson);
    }

    private extractCityInformation(iataCodeResponseBody: IataCodeResponseBody): Array<City> {

    }

}