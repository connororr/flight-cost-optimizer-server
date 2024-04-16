import { Endpoints } from "../constants/endpoints";
import { FlightOfferRequestBody, OriginDestination, Traveler } from "../constants/external-api/request";
import { FlightResponseBody } from "../constants/external-api/response";
import { Flight } from "../constants/frontend/request/flight";
import { AmadeusService, IAmadeusService } from "./amadeus-service";
import { extractFlightInformation } from "./extract-flight-information.ts";
import { City, Itineraries, Itinerary } from "../constants/frontend/response";
import { checkRoundTrip, getFilteredFlightPermutations } from "../lib";
import { sleep } from "../lib/sleep.ts";
import { extractCityInformation } from "./extract-city-information.ts";

export interface IFlightService {
    getFlightPrices(options: Array<Flight>): Promise<Itineraries>;
    getIataCodes(searchTerm: string): Promise<Array<City>>
}

export class FlightService implements IFlightService {
    private amadeusService: IAmadeusService;

    constructor() {
        this.amadeusService = new AmadeusService();
    }

    public async getFlightPrices(options: Array<Flight>): Promise<Itineraries> {

        if (checkRoundTrip(options)) {
            return this._searchAllPermutations(options);
        }

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
            currencyCode: 'AUD',
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
        const itineraries = extractFlightInformation(responseJson);
        return itineraries.filter(this._filterDuplicates);
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
        return extractCityInformation(responseJson);
    }

    private async _searchAllPermutations(options: Array<Flight>): Promise<Itineraries> {
        const permutations = getFilteredFlightPermutations(options);
        const originDestinationPermutations: Array<Array<OriginDestination>> = new Array<Array<OriginDestination>>();
        const bodies: Array<FlightOfferRequestBody> = new Array<FlightOfferRequestBody>();
        const itineraries: Itineraries = Array<Itinerary>();
        const requests: Array<any> = new Array<any>();
        const travelers: Array<Traveler> = [{ id: '1', travelerType: 'ADULT' }];
        const sources: string[] = [ 'GDS' ];

        permutations.forEach((permutation) => {
            const originDestination = permutation.map(this._toOriginDestination);
            originDestinationPermutations.push(originDestination);
        })

        originDestinationPermutations.forEach((originDestinationPermutation) => {
            const bodyPermutation: FlightOfferRequestBody = {
                currencyCode: 'AUD',
                originDestinations: originDestinationPermutation,
                travelers,
                sources,
                // TODO: remove the 15 maxFlightOffers once I go live. Instead have a button to show 10 more offers
                searchCriteria: {
                    maxFlightOffers: 15
                }
            }
            bodies.push(bodyPermutation);
        });

        for (const body of bodies) {
            requests.push(this.amadeusService.post(Endpoints.FlightPrice, body))
            await sleep(3000);
        }

        const responses = await Promise.all(requests);
        for (const response of responses) {
            const responseJson = await response.json() as FlightResponseBody;
            itineraries.push(...extractFlightInformation(responseJson));
        }
        // TODO: test this part of the code
        itineraries.sort(this._sortItineraries);
        return itineraries.filter(this._filterDuplicates);
    }


    private _toOriginDestination(flight: Flight) {
        return {
            id: String(flight.id),
            originLocationCode: flight.from,
            destinationLocationCode: flight.to,
            departureDateTimeRange: {
                date: flight.date,
                time: '10:00:00'
            }
        }
    }

    private _sortItineraries(itineraryA: Itinerary, itineraryB: Itinerary): number {
        const costWeight = 0.5;
        const timeWeight = 0.5;
        const costA: number = Number(itineraryA.cost?.slice(0));
        const costB: number = Number(itineraryB.cost?.slice(0));
        const weightedSumA: number = (costA * costWeight) + (itineraryA.totalDurationInMins * timeWeight);
        const weightedSumB: number = (costB * costWeight) + (itineraryB.totalDurationInMins * timeWeight);

        return weightedSumA - weightedSumB;
    }

    private _filterDuplicates(value: Itinerary, index: number, self: Itinerary[]): boolean {
        return index === self.findIndex((t) => (
            t.cost === value.cost && t.totalDurationInMins === value.totalDurationInMins
        ));
    }
}