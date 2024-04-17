import { City } from "../constants/frontend/response";

export function extractCityInformation(iataCodeResponseBody: IataCodeResponseBody): Array<City> {
    if (!iataCodeResponseBody.data || iataCodeResponseBody.data.length === 0) {
        return [];
    }
    return iataCodeResponseBody.data?.map((data: LocationData) => {
        const city: City = {
            iataCode: data.iataCode,
            name: data.address.cityName
        }
        return city;
    });
}