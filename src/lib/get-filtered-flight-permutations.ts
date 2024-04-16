import { Flight } from "../constants/frontend/request/flight.ts";

export function getFilteredFlightPermutations(flights: Array<Flight>): Array<Array<Flight>> {
    let strArray: string[] = [];

    flights.slice(1).forEach((flight) => strArray.push(flight.from));
    const permutations = getAllPermutationsIterative(strArray);
    const newPermutations: string[][] = [];
    permutations.forEach((permutation) => {
        const newPermutation = permutation.flatMap(value => [value, value]);
        newPermutation.unshift(flights[0].from);
        newPermutation.push(flights[flights.length - 1].to);
        newPermutations.push(newPermutation);
    });

    return createFlightPermutations(newPermutations, flights);
}

function swap(array: string[], i: number, j: number): void {
    [array[i], array[j]] = [array[j], array[i]];
}

function getAllPermutationsIterative(array: string[]): string[][] {
    const permutations: string[][] = [];
    const n = array.length;
    const c = new Array(n).fill(0);

    permutations.push([...array]);

    let i = 0;
    while (i < n) {
        if (c[i] < i) {
            if (i % 2 === 0) {
                swap(array, 0, i);
            } else {
                swap(array, c[i], i);
            }
            permutations.push([...array]);
            c[i]++;
            i = 0;
        } else {
            c[i] = 0;
            i++;
        }
    }

    return permutations;
}

function createFlightPermutations(permutations: Array<Array<string>>, flights: Array<Flight>): Array<Array<Flight>> {
    const flightPermutations: Array<Array<Flight>> = [];
    let i = 0;
    let j = 0;

    permutations.forEach((permutation) => {
        let j = 0;
        const flightPermutation: Array<Flight> = [];
        for (let i = 0; i < permutation.length; i+= 2) {
            const flight: Flight = {
                id: j+1,
                from: permutation[i],
                to: permutation[i+1],
                date: flights[j].date
            }
            flightPermutation.push(flight);
            j += 1;
        }
        flightPermutations.push(flightPermutation);
    });

    return flightPermutations;
}
