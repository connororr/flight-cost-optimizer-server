import { Flight } from "../constants/frontend/request/flight";
import { FlightService } from "./flight-service";
import {AmadeusService, IAmadeusService} from "./amadeus-service";
import {Endpoints} from "../constants/endpoints.ts";
import { FlightOfferRequestBody, OriginDestination, Traveler } from "../constants/external-api/request";
import { extractFlightInformation } from "./extract-flight-information.ts";
import { FlightResponseBody } from "../constants/external-api/response";
import { getFilteredFlightPermutations } from "../lib";
import { sleep } from "../lib/sleep.ts";


jest.mock('./amadeus-service.ts');
jest.mock('./extract-flight-information.ts');
jest.mock('../lib/get-filtered-flight-permutations.ts');
jest.mock('../lib/sleep.ts');

describe('FlightService', () => {
    const travelers: Array<Traveler> = [{ id: '1', travelerType: 'ADULT' }];
    const sources: string[] = [ 'GDS' ];
    let returnFlights: Array<Flight>;
    let multiCityRoundTripFlights: Array<Flight>;
    let flightPermutations: Array<Array<Flight>>;
    let mockAmadeusService: jest.Mocked<IAmadeusService>;
    let mockReturnOriginDestinations: Array<OriginDestination>;
    let mockResponseBody: FlightResponseBody;

   beforeEach(() => {
      mockResponseBody = {} as any;
      returnFlights = [
          createFlight(1, "CDG", "LON", "2024-04-25"),
          createFlight(2, "LON", "CDG", "2024-04-26"),
      ];
      multiCityRoundTripFlights = [
          createFlight(1, "CDG", "LON", "2024-04-25"),
          createFlight(2, "LON", "MAD", "2024-04-26"),
          createFlight(3, "MAD", "BRU", "2024-04-27"),
          createFlight(4, "BRU", "CDG", "2024-04-28")
      ];
      flightPermutations = createPossiblePermutation();
       mockReturnOriginDestinations = returnFlights.map(toOriginDestination);
      mockAmadeusService = {
          post: jest.fn().mockResolvedValue({
              json: jest.fn().mockResolvedValue(mockResponseBody)
          }),
          get: jest.fn().mockResolvedValue({
              json: jest.fn().mockResolvedValue(mockResponseBody)
          }),
      };
      (AmadeusService as jest.Mock).mockReturnValue(mockAmadeusService);
      (getFilteredFlightPermutations as jest.Mock).mockReturnValue(flightPermutations);
      (extractFlightInformation as jest.Mock).mockReturnValue([{}]);
       (sleep as jest.Mock).mockResolvedValue('');
   })

   describe('getFlightPrices()', () => {
    it('should make a request to amadeus', async () => {
      const flightService = new FlightService();
      const mockBody: FlightOfferRequestBody = {
            currencyCode: 'AUD',
            originDestinations: mockReturnOriginDestinations,
            travelers,
            sources,
            searchCriteria: {
                maxFlightOffers: 15
            }
        }
      await flightService.getFlightPrices(returnFlights);
      expect(mockAmadeusService.post).toHaveBeenCalledWith(Endpoints.FlightPrice, mockBody);
    });

    it('should extractFlightInformation from amadeus', async () => {
           const flightService = new FlightService();
           const mockBody: FlightOfferRequestBody = {
               currencyCode: 'AUD',
               originDestinations: mockReturnOriginDestinations,
               travelers,
               sources,
               searchCriteria: {
                   maxFlightOffers: 15
               }
           };
           await flightService.getFlightPrices(returnFlights);
           expect(extractFlightInformation).toHaveBeenCalledWith(mockResponseBody)
       });

    describe('when a multi city trip is a complete round-trip', () => {
        it('should make multiple requests to amadeus for all possible permutations', async() => {
            jest.useFakeTimers();
            const flightService = new FlightService();

            await flightService.getFlightPrices(multiCityRoundTripFlights);
            expect(mockAmadeusService.post).toHaveBeenNthCalledWith(1, Endpoints.FlightPrice, createMockRequestBody(multiCityRoundTripFlights));
            expect(mockAmadeusService.post).toHaveBeenNthCalledWith(2, Endpoints.FlightPrice, createMockRequestBody(flightPermutations[1]));
            expect(mockAmadeusService.post).toHaveBeenNthCalledWith(3, Endpoints.FlightPrice, createMockRequestBody(flightPermutations[2]));
            expect(mockAmadeusService.post).toHaveBeenNthCalledWith(4, Endpoints.FlightPrice, createMockRequestBody(flightPermutations[3]));
            expect(mockAmadeusService.post).toHaveBeenNthCalledWith(5, Endpoints.FlightPrice, createMockRequestBody(flightPermutations[4]));
            expect(mockAmadeusService.post).toHaveBeenNthCalledWith(6, Endpoints.FlightPrice, createMockRequestBody(flightPermutations[5]));

        });
        // it('should return the cheapest combination of flights available from all returned requests', () => {
        //
        // });
    });
   })

    describe('getIataCodes()', () => {
        it('should make a request to amadeus', () => {

        })
        it('should extract city information', () => {

        })
    })

    function toOriginDestination(flight: Flight): OriginDestination {
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

    function createMockRequestBody(flights: Array<Flight>): FlightOfferRequestBody {
       return {
           currencyCode: 'AUD',
           originDestinations: flights.map(toOriginDestination),
           travelers,
           sources,
           searchCriteria: {
               maxFlightOffers: 15
           }
       };
    }

    function createFlight(id: number, from: string, to: string, date: string): Flight {
       return {
           id,
           from,
           to,
           date
       };
    }

    function createPossiblePermutation(): Array<Array<Flight>> {
        return [
            [
                { id: 1, from: 'CDG', to: 'LON', date: '2024-04-25' },
                { id: 2, from: 'LON', to: 'MAD', date: '2024-04-26' },
                { id: 3, from: 'MAD', to: 'BRU', date: '2024-04-27' },
                { id: 4, from: 'BRU', to: 'CDG', date: '2024-04-28' }
            ],
            [
                { id: 1, from: 'CDG', to: 'MAD', date: '2024-04-25' },
                { id: 2, from: 'MAD', to: 'LON', date: '2024-04-26' },
                { id: 3, from: 'LON', to: 'BRU', date: '2024-04-27' },
                { id: 4, from: 'BRU', to: 'CDG', date: '2024-04-28' }
            ],
            [
                { id: 1, from: 'CDG', to: 'BRU', date: '2024-04-25' },
                { id: 2, from: 'BRU', to: 'LON', date: '2024-04-26' },
                { id: 3, from: 'LON', to: 'MAD', date: '2024-04-27' },
                { id: 4, from: 'MAD', to: 'CDG', date: '2024-04-28' }
            ],
            [
                { id: 1, from: 'CDG', to: 'LON', date: '2024-04-25' },
                { id: 2, from: 'LON', to: 'BRU', date: '2024-04-26' },
                { id: 3, from: 'BRU', to: 'MAD', date: '2024-04-27' },
                { id: 4, from: 'MAD', to: 'CDG', date: '2024-04-28' }
            ],
            [
                { id: 1, from: 'CDG', to: 'MAD', date: '2024-04-25' },
                { id: 2, from: 'MAD', to: 'BRU', date: '2024-04-26' },
                { id: 3, from: 'BRU', to: 'LON', date: '2024-04-27' },
                { id: 4, from: 'LON', to: 'CDG', date: '2024-04-28' }
            ],
            [
                { id: 1, from: 'CDG', to: 'BRU', date: '2024-04-25' },
                { id: 2, from: 'BRU', to: 'MAD', date: '2024-04-26' },
                { id: 3, from: 'MAD', to: 'LON', date: '2024-04-27' },
                { id: 4, from: 'LON', to: 'CDG', date: '2024-04-28' }
            ],
        ]
    }
})