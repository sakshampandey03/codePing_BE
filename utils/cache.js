import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3000, checkperiod: 600 }); 
// stdTTL = 300s (5 mins), checkperiod = 60s

export default cache;
