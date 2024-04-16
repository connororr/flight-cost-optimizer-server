import { City } from "../constants/frontend/response";

export function extractCityInformation(iataCodeResponseBody: IataCodeResponseBody): Array<City> {
    return iataCodeResponseBody.data.map((data: LocationData) => {
        const city: City = {
            iataCode: data.iataCode,
            name: data.address.cityName
        }
        return city;
    });
}