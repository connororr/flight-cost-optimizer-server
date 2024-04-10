import { FastifyInstance } from "fastify"
import { FlightService, IFlightService } from "./service/flight-service";

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
        return await flightService.getFlightPrices(body);
    });
}
  
export default routes;