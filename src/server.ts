import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import routes from './routes';
import { Server } from 'tls';
import cors from '@fastify/cors';

// TODO: remove logging for prod
const fastifyPort = process.env.PORT || '3001';
const server: FastifyInstance = Fastify({
  logger: true
})


// server.addContentTypeParser('application/json', {}, (req, body, done) => {
//   done(null, body);
// });

await server.register(cors, { 
  origin: false
})
server.register(routes)

// TODO: remove cors stuff when going to prod
server.addHook('preHandler', (req, res, done) => {

  // const allowedPaths = ['/api/flights', '/api/codes', '*'];
  // if (allowedPaths.includes(req.routeOptions.url)) {
  //   res.header('Access-Control-Allow-Origin', '*');
  //   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  //   res.header("Access-Control-Allow-Headers",  "*");
  // }

  const isPreflight = /options/i.test(req.method);
  if (isPreflight) {
    res.header('Access-Control-Allow-Origin', 'https://exploria-test.xyz');
    return res.send();
  }
  done();
})

const start = async () => {
  try {
    await server.listen({ port: Number(fastifyPort), host: process.env.HOST || '127.0.0.1' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()