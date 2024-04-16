import {FlightService} from "./flight-service.ts";
import {extractFlightInformation} from "./extract-flight-information.ts";
import {Data, FlightResponseBody, Itinerary} from "../constants/external-api/response";

describe('extractFlightInformation()', () => {
    let mockData: Data[];
    let mockDataValue: Data;
    let itineraries: Itinerary[];
    let mockFlightResponseBody: FlightResponseBody;

    beforeEach(() => {
        itineraries = createItineraries();
        mockDataValue = {
            type: 'mockType',
            id: 'mockId',
            source: 'mockSource',
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            lastTicketingDate: 'mockLastTicketingDate',
            numberOfBookableSeats: 9,
            validatingAirlineCodes: [],
            travelerPricings: [],
            price: {
                currency: 'mockCurrency',
                total: 'mockTotal',
                base: 'mockBase',
                fees: [],
                grandTotal: 'mockGrandTotal'
            },
            pricingOptions: {
                fareType: [],
                includedCheckedBagsOnly: false
            },
            itineraries,
        };
        mockData = [mockDataValue]
        mockFlightResponseBody = {
            data: mockData,
            meta: {
                count: 9000,
                links: {
                    self: 'mockSelf'
                }
            },
            dictionaries: {
                locations: {},
                aircraft: {},
                currencies: {},
                carriers: {}
            },
        }
    })
    it('should ensure that departure and arrival dates have been truncated correctly', async () => {
        const truncatedDepartureTime = '21:50';
        const truncatedArrivalTime = '08:45+1';

        const result = extractFlightInformation(mockFlightResponseBody);

        const firstSegmentDepartureTime = result[0].flightLegs[0].segments[0].departure.at;
        const firstSegmentArrivalTime = result[0].flightLegs[0].segments[0].arrival.at;
        expect(firstSegmentDepartureTime).toStrictEqual(truncatedDepartureTime);
        expect(firstSegmentArrivalTime).toStrictEqual(truncatedArrivalTime);
    });

    it('should ensure that total trip duration has been formatted correctly', async () => {
        const formattedDuration = '9h 10m';

        const result = extractFlightInformation(mockFlightResponseBody)
        const firstSegmentDepartureTime = result[0].flightLegs[0].duration;
        expect(firstSegmentDepartureTime).toStrictEqual(formattedDuration);
    });

    it('should calculate the total duration of the itinerary', () => {
        const totalDuration: number = 2695;

        const result = extractFlightInformation(mockFlightResponseBody);

        expect(result[0].totalDurationInMins).toStrictEqual(totalDuration);
    })

    it('should return empty array if responseBody\'s data property is undefined', () => {
        const newMockFlightResponseBody = {
            data: undefined,
        } as unknown as FlightResponseBody;

        const result = extractFlightInformation(newMockFlightResponseBody);
        expect(result).toStrictEqual([]);
    });

    it('should return empty array if repsonseBody\'s data property has no values', () => {
        const newMockFlightResponseBody = {
            data: [],
        } as unknown as FlightResponseBody;

        const result = extractFlightInformation(newMockFlightResponseBody);
        expect(result).toStrictEqual([]);
    })

    function createItineraries(): Itinerary[] {
        return [
            {
                duration: "PT9H10M",
                segments: [
                    {
                        departure: {
                            iataCode: "EWR",
                            at: "2023-11-01T21:50:00",
                            terminal: 'mockTerminal'
                        },
                        arrival: {
                            iataCode: "LHR",
                            at: "2023-11-02T08:45:00",
                        },
                        carrierCode: "6X",
                        number: "188",
                        aircraft: {
                            code: "777",
                        },
                        operating: {
                            carrierCode: "6X",
                        },
                        duration: "PT5H55M",
                        id: "3",
                        numberOfStops: 0,
                        blacklistedInEU: false,
                    },
                    {
                        departure: {
                            iataCode: "LHR",
                            at: "2023-11-02T10:30:00",
                            terminal: 'mockTerminal'
                        },
                        arrival: {
                            iataCode: "MAD",
                            at: "2023-11-02T13:00:00",
                        },
                        carrierCode: "6X",
                        number: "9931",
                        aircraft: {
                            code: "320",
                        },
                        operating: {
                            carrierCode: "6X",
                        },
                        duration: "PT1H30M",
                        id: "4",
                        numberOfStops: 0,
                        blacklistedInEU: false,
                    },
                ],
            },
            {
                duration: "PT35H45M",
                segments: [
                    {
                        departure: {
                            iataCode: "EWR",
                            at: "2023-11-01T21:50:00",
                            terminal: 'mockTerminal'
                        },
                        arrival: {
                            iataCode: "SIN",
                            at: "2023-11-02T08:45:00",
                        },
                        carrierCode: "6X",
                        number: "188",
                        aircraft: {
                            code: "777",
                        },
                        operating: {
                            carrierCode: "6X",
                        },
                        duration: "PT5H55M",
                        id: "3",
                        numberOfStops: 0,
                        blacklistedInEU: false,
                    },
                    {
                        departure: {
                            iataCode: "SIN",
                            at: "2023-11-02T10:30:00",
                            terminal: 'mockTerminal'
                        },
                        arrival: {
                            iataCode: "MAD",
                            at: "2023-11-02T13:00:00",
                        },
                        carrierCode: "6X",
                        number: "9931",
                        aircraft: {
                            code: "320",
                        },
                        operating: {
                            carrierCode: "6X",
                        },
                        duration: "PT11H30M",
                        id: "4",
                        numberOfStops: 0,
                        blacklistedInEU: false,
                    },
                ],
            }
        ];
    }
})