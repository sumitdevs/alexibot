import express from 'express';
import healthRoute from './routes/health';
import authRoutes from "./routes/auth.route"
import dotenv from "dotenv";
import { env } from './config/env';
import dictionaryRoutes from './routes/dictionary.routes';
import userRoutes from './routes/user.routes'; 
import * as cors from "cors";

dotenv.config();

const app = express();
const PORT  = env.PORT;

app.use(cors.default());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use((req, res, next) => {
      const start = performance.now();
    res.on("finish", () => {
    const duration = (performance.now() - start).toFixed(1);

    console.log({
      time: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.ip,
      ua: req.headers["user-agent"],
      duration: `${duration}ms`,
    });
  });

  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/user', userRoutes);

app.use('/health', healthRoute);

app.listen(PORT,()=>{
    console.log(`server running on ${PORT} `);
});
