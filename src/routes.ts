import { FastifyInstance } from "fastify"
import { FlightService, IFlightService } from "./service/flight-service";
import { Itineraries } from "./constants/frontend/response";
import { Flight } from "./constants/frontend/request/flight.ts";

// TODO: fix types
/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://www.fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const flightService: IFlightService = new FlightService();

async function routes (fastify: FastifyInstance) {
    fastify.post('/api/flights', async (req: any, res: any) => {
        const body = JSON.parse(req.body);
        res.headers({
            "Access-Control-Allow-Origin": "https://exploria-test.xyz"
        })
        return await flightService.getFlightPrices(body);
    });
    fastify.get('/api/codes', async (req: any, res: any) => {
        return await flightService.getIataCodes(req.query.search);
    });
}
  
export default routes;