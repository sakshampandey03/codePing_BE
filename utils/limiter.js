import Bottleneck from "bottleneck";

const limiter = new Bottleneck({
  minTime: 2100,  // ~2.1s gap between requests
  maxConcurrent: 1,
});

export default limiter;
