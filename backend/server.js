// Author: Sourav Kumar Das
require("dotenv").config();
// Validate required environment variables early
require("./src/config/validateEnv");

const app = require("./src/app");

const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
