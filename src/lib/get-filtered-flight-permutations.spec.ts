import { Flight } from "../constants/frontend/request/flight.ts";
import { getFilteredFlightPermutations } from "./get-filtered-flight-permutations.ts";

describe('getFilteredFlightPermutations()', () => {
    let firstFlight: Flight;
    let secondFlight: Flight;
    let thirdFlight: Flight;
    let fourthFlight: Flight;
    let flights: Array<Flight>;
    let expectedPermutations: Array<Array<Flight>>;

    beforeEach(() => {
        firstFlight = createFlight(1, "CDG", "LON", "2024-04-25");
        secondFlight = createFlight(2, "LON", "MAD", "2024-04-26");
        thirdFlight = createFlight(3, "MAD", "BRU", "2024-04-27");
        fourthFlight = createFlight(4, "BRU", "CDG", "2024-04-28");
        flights = [firstFlight, secondFlight, thirdFlight, fourthFlight];
        expectedPermutations = createPossiblePermutation();
    })

    it('should find all permutations of a multi-city flight array whilst the first departure location and last arrival location stay the same', () => {
        const result = getFilteredFlightPermutations(flights);
        expect(result).toStrictEqual(expectedPermutations);
    });

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