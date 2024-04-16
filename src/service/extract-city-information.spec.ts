import { extractCityInformation } from "./extract-city-information.ts";

describe('extractCityInformation()', () => {

    let iataCodeResponseBody: IataCodeResponseBody;

    beforeEach(() => {
        iataCodeResponseBody = createIataCodeResponseBody();
    })

    it('should grab the iata code and name from each data response', () => {
        const cities = extractCityInformation(iataCodeResponseBody);
        expect(cities[0]).toStrictEqual({ name: 'Paris', iataCode: 'CDG'});
        expect(cities[1]).toStrictEqual({ name: 'Brussels', iataCode: 'BRU'});

    })

    function createIataCodeResponseBody(): IataCodeResponseBody {
        return {
            meta: {
                count: 9000,
                links: {
                    self: 'www.self.com',
                }
            },
            data: [
                createMockLocationData('CDG', 'Paris'),
                createMockLocationData('BRU', 'Brussels')
            ]
        }
    }

    function createMockLocationData(iataCode: string, cityName: string): LocationData {
        return {
            type: 'mockType',
            subType: 'mockSubType',
            name: 'mockName',
            detailedName: 'mockDetailedName',
            id: 'mockId',
            self: {
                href: 'mockHref',
                methods: ['mockValue'],
            },
            iataCode,
            address: {
                cityName,
                countryName: 'France'
            }
        }
    }

})