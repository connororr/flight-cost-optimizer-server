import { Flight } from "../constants/frontend/request/flight";
import { FlightService } from "./flight-service";
import {AmadeusService, IAmadeusService} from "./amadeus-service";
import {Endpoints} from "../constants/endpoints.ts";
import {FlightOfferRequestBody, OriginDestination, Traveler} from "../constants/external-api/request";
import { extractFlightInformation } from "./extract-flight-information.ts";
import {FlightResponseBody} from "../constants/external-api/response";

jest.mock('./amadeus-service.ts');
jest.mock('./extract-flight-information.ts');

describe('FlightService', () => {
    const travelers: Array<Traveler> = [{ id: '1', travelerType: 'ADULT' }];
    const sources: string[] = [ 'GDS' ];
    let flights: Array<Flight>;
    let firstFlight: Flight;
    let secondFlight: Flight;
    let mockAmadeusService: jest.Mocked<IAmadeusService>;
    let mockOriginDestinations: Array<OriginDestination>;
    let mockResponseBody: FlightResponseBody;

   beforeEach(() => {
       mockResponseBody = {} as any;
      firstFlight = {
         id:1,
         from: "NYC",
         to: "LON",
         date: "2024-02-12"
      };
      secondFlight = {
         id: 2,
         from: "LON",
         to: "MAD",
         date: "2024-02-13"}
      flights = [firstFlight, secondFlight];
      mockOriginDestinations = flights.map((flight) => ({
           id: String(flight.id),
           originLocationCode: flight.from,
           destinationLocationCode: flight.to,
           departureDateTimeRange: {
               date: flight.date,
               time: '10:00:00'
           }
       }));
      mockAmadeusService = {
          post: jest.fn().mockResolvedValue({
              json: jest.fn().mockResolvedValue(mockResponseBody)
          }),
          get: jest.fn().mockResolvedValue({
              json: jest.fn().mockResolvedValue(mockResponseBody)
          }),
      };
      (AmadeusService as jest.Mock).mockReturnValue(mockAmadeusService);
   })

   describe('getFlightPrices()', () => {
    it('should make a request to amadeus', async () => {
      const flightService = new FlightService();
        const mockBody: FlightOfferRequestBody = {
            originDestinations: mockOriginDestinations,
            travelers,
            sources,
            searchCriteria: {
                maxFlightOffers: 15
            }
        }
      await flightService.getFlightPrices(flights);
      expect(mockAmadeusService.post).toHaveBeenCalledWith(Endpoints.FlightPrice, mockBody)
    });

       it('should extractFlightInformation from amadeus', async () => {
           (extractFlightInformation as jest.Mock).mockReturnValue(undefined);
           const flightService = new FlightService();
           const mockBody: FlightOfferRequestBody = {
               originDestinations: mockOriginDestinations,
               travelers,
               sources,
               searchCriteria: {
                   maxFlightOffers: 15
               }
           }
           await flightService.getFlightPrices(flights);
           expect(extractFlightInformation).toHaveBeenCalledWith(mockResponseBody)
       });
   })
})